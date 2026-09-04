"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { addComment, removeComment, type CommentState } from "@/lib/comments/actions";
import type { CommentRow } from "@/lib/db";

/**
 * The discussion under an entry. Reddit-shaped and deliberately spare:
 * comments nest under a left rule, newest thread last, no votes and no
 * collapse — at this site's scale those are furniture, not tools.
 *
 * Reading is open to everyone. Writing needs an account, because a comment
 * asserts something the way an edit does, and the site's credibility rests
 * on being able to say who said what.
 */

/** "3m", "2h", "5d" — the compressed grammar of thread timestamps. */
function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)}d`;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function CommentForm({
  assetUuid,
  assetSlug,
  parentId,
  placeholder,
  autoFocus,
  onDone,
}: {
  assetUuid: string;
  assetSlug: string;
  parentId: string | null;
  placeholder: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const bound = addComment.bind(null, assetUuid, assetSlug, parentId);
  const [state, action, pending] = useActionState<CommentState, FormData>(
    bound,
    null,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const sent = useRef(false);

  // A cleared box is how the UI says "posted". Errors keep the draft.
  useEffect(() => {
    if (!pending && sent.current && !state?.error) {
      formRef.current?.reset();
      onDone?.();
      sent.current = false;
    }
  }, [pending, state, onDone]);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={() => (sent.current = true)}
      className="space-y-2"
    >
      <textarea
        name="body"
        required
        maxLength={2000}
        rows={3}
        autoFocus={autoFocus}
        placeholder={placeholder}
        className="focus-ring w-full resize-y rounded-xl bg-elevated px-4 py-3 text-[14px]
                   outline-none placeholder:text-faint"
      />
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="focus-ring rounded-full bg-ink px-5 py-2 text-[13px] font-medium
                     text-surface transition-[transform,opacity] duration-150 ease-out-strong
                     active:scale-[0.97] disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="focus-ring rounded-full px-3 py-2 text-[13px] text-muted
                       transition-colors duration-150 ease-out-strong hover:text-ink"
          >
            Cancel
          </button>
        )}
        {state?.error && (
          <p role="alert" className="text-[13px] text-amber-700 dark:text-amber-300">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

function Thread({
  comment,
  childrenOf,
  depth,
  me,
  assetUuid,
  assetSlug,
}: {
  comment: CommentRow;
  childrenOf: Map<string | null, CommentRow[]>;
  depth: number;
  me: string | null;
  assetUuid: string;
  assetSlug: string;
}) {
  const [replying, setReplying] = useState(false);
  const replies = childrenOf.get(comment.id) ?? [];

  return (
    <div className={depth > 0 ? "border-l-2 border-line pl-4 sm:pl-5" : ""}>
      <div className="py-2.5">
        <p className="text-[12px] text-faint">
          {comment.isDeleted ? (
            <span className="italic">[removed]</span>
          ) : (
            <>
              <Link
                href={`/u/${comment.author}`}
                className="font-medium text-muted hover:text-ink"
              >
                {comment.author}
              </Link>
              <span aria-hidden> · </span>
              {ago(comment.createdAt)}
            </>
          )}
        </p>

        {!comment.isDeleted && (
          <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed">
            {comment.body}
          </p>
        )}

        {!comment.isDeleted && me && (
          <div className="mt-1 flex gap-4 text-[12px] text-faint">
            <button
              type="button"
              onClick={() => setReplying((r) => !r)}
              className="focus-ring rounded transition-colors duration-150 ease-out-strong hover:text-ink"
            >
              Reply
            </button>
            {me === comment.author && (
              <button
                type="button"
                onClick={() => void removeComment(comment.id, assetSlug)}
                className="focus-ring rounded transition-colors duration-150 ease-out-strong hover:text-ink"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {replying && (
          <div className="mt-3">
            <CommentForm
              assetUuid={assetUuid}
              assetSlug={assetSlug}
              parentId={comment.id}
              placeholder={`Reply to ${comment.author}…`}
              autoFocus
              onDone={() => setReplying(false)}
            />
          </div>
        )}
      </div>

      {replies.map((r) => (
        <Thread
          key={r.id}
          comment={r}
          childrenOf={childrenOf}
          // Past four levels the rules stop marching right: on a phone the
          // text would be squeezed to a ribbon.
          depth={Math.min(depth + 1, 4)}
          me={me}
          assetUuid={assetUuid}
          assetSlug={assetSlug}
        />
      ))}
    </div>
  );
}

export function Comments({
  comments,
  me,
  assetUuid,
  assetSlug,
}: {
  comments: CommentRow[];
  /** Signed-in username, or null for a visitor. */
  me: string | null;
  assetUuid: string;
  assetSlug: string;
}) {
  const childrenOf = new Map<string | null, CommentRow[]>();
  for (const c of comments) {
    const list = childrenOf.get(c.parentId) ?? [];
    list.push(c);
    childrenOf.set(c.parentId, list);
  }
  const top = childrenOf.get(null) ?? [];

  return (
    <div className="space-y-4">
      {me ? (
        <CommentForm
          assetUuid={assetUuid}
          assetSlug={assetSlug}
          parentId={null}
          placeholder="What do you know about this?"
        />
      ) : (
        <p className="rounded-xl bg-elevated px-4 py-3 text-[14px] text-muted">
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}

      {top.length === 0 ? (
        <p className="text-[14px] text-faint">No comments yet.</p>
      ) : (
        <div className="divide-y divide-line">
          {top.map((c) => (
            <Thread
              key={c.id}
              comment={c}
              childrenOf={childrenOf}
              depth={0}
              me={me}
              assetUuid={assetUuid}
              assetSlug={assetSlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
