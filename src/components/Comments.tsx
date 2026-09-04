"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addComment, removeComment, type CommentState } from "@/lib/comments/actions";
import type { CommentRow } from "@/lib/db";

/**
 * The discussion under an entry. Reddit-shaped and deliberately spare:
 * comments nest under a left rule, votes order each level best-first, and
 * there is no collapse — at this site's scale that is furniture, not tools.
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

/**
 * The vote gutter. Optimistic like the reactions: the number moves before
 * the round trip and rolls back on failure. One vote per account - clicking
 * the same arrow again retracts it, the other one flips it.
 */
function VoteControl({
  commentId,
  initialScore,
  initialMine,
  canVote,
}: {
  commentId: string;
  initialScore: number;
  initialMine: -1 | 0 | 1;
  canVote: boolean;
}) {
  const [score, setScore] = useState(initialScore);
  const [mine, setMine] = useState<-1 | 0 | 1>(initialMine);
  const [busy, setBusy] = useState(false);

  async function vote(dir: -1 | 1) {
    if (!canVote || busy) return;
    setBusy(true);

    const next = mine === dir ? 0 : dir;
    const prevScore = score;
    const prevMine = mine;
    setScore(score - mine + next);
    setMine(next);

    const db = createClient();
    let failed = false;
    if (next === 0) {
      // RLS trims the delete to my own row.
      const { error } = await db
        .from("comment_votes")
        .delete()
        .eq("comment_id", commentId);
      failed = !!error;
    } else {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) failed = true;
      else {
        const { error } = await db.from("comment_votes").upsert(
          { comment_id: commentId, voter_id: user.id, value: next },
          { onConflict: "comment_id,voter_id" },
        );
        failed = !!error;
      }
    }

    if (failed) {
      setScore(prevScore);
      setMine(prevMine);
    }
    setBusy(false);
  }

  const arrow =
    "focus-ring grid h-6 w-6 place-items-center rounded-full transition-[transform,color] " +
    "duration-150 ease-out-strong " +
    (canVote ? "hover:scale-110 active:scale-95" : "cursor-default opacity-40");

  return (
    <div className="flex shrink-0 flex-col items-center pt-2.5" aria-label="Vote">
      <button
        type="button"
        onClick={() => void vote(1)}
        aria-label="Upvote"
        aria-pressed={mine === 1}
        title={canVote ? undefined : "Sign in to vote"}
        className={`${arrow} ${mine === 1 ? "text-accent" : "text-faint hover:text-ink"}`}
      >
        <ChevronUp className="h-4 w-4" aria-hidden />
      </button>
      <span
        className={`text-[12px] font-semibold tabular-nums ${
          mine !== 0 ? "text-accent" : "text-muted"
        }`}
      >
        {score}
      </span>
      <button
        type="button"
        onClick={() => void vote(-1)}
        aria-label="Downvote"
        aria-pressed={mine === -1}
        title={canVote ? undefined : "Sign in to vote"}
        className={`${arrow} ${mine === -1 ? "text-accent" : "text-faint hover:text-ink"}`}
      >
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </div>
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
      <div className="flex gap-3">
      <div className="min-w-0 flex-1 py-2.5">
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

        {/* Votes sit on the right, clear of the indent rules - nested
            threads keep the arrows in one column instead of a staircase. */}
        {!comment.isDeleted && (
          <VoteControl
            commentId={comment.id}
            initialScore={comment.score}
            initialMine={comment.myVote}
            canVote={me !== null}
          />
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
  // Best first at every level, ties in arrival order. Sorted from the
  // server's numbers, so a vote does not reorder the thread underfoot.
  for (const list of childrenOf.values()) {
    list.sort(
      (a, b) =>
        b.score - a.score || a.createdAt.localeCompare(b.createdAt),
    );
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
