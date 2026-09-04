"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Discussion writes. Authority lives in the database — RLS pins the author
 * to the session, triggers pin replies to the same entry, forbid edits and
 * rate-limit flooding — so these actions only shape errors into sentences.
 */

export type CommentState = { error?: string } | null;

function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("too fast")) return "You are commenting too fast. Wait a minute.";
  if (m.includes("row-level security"))
    return "You need to be signed in to comment.";
  if (m.includes("banned") || m.includes("is_active"))
    return "This account cannot comment.";
  return "That could not be posted. Try again.";
}

export async function addComment(
  assetUuid: string,
  assetSlug: string,
  parentId: string | null,
  _prev: CommentState,
  form: FormData,
): Promise<CommentState> {
  const body = String(form.get("body") ?? "").trim();
  if (!body) return { error: "Write something first." };
  if (body.length > 2000)
    return { error: "Keep it under 2,000 characters." };

  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "You need to be signed in to comment." };

  const { error } = await db.from("comments").insert({
    asset_id: assetUuid,
    parent_id: parentId,
    author_id: user.id,
    body,
  });
  if (error) return { error: friendly(error.message) };

  revalidatePath(`/assets/${assetSlug}`);
  return null;
}

/** Soft delete: the thread keeps its shape, the words go. RLS restricts
 *  this to the author and moderators. */
export async function removeComment(
  commentId: string,
  assetSlug: string,
): Promise<CommentState> {
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { error: "You need to be signed in." };

  const { error } = await db
    .from("comments")
    .update({ is_deleted: true })
    .eq("id", commentId);
  if (error) return { error: friendly(error.message) };

  revalidatePath(`/assets/${assetSlug}`);
  return null;
}
