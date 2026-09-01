import { createClient } from "@/lib/supabase/server";
import type { Revision } from "@/lib/revisions";

/**
 * Resolve the record ids in a revision feed to slugs and names, so each row
 * can link to the entry it changed. Two queries rather than a join per row.
 */
export async function resolveTargets(revisions: Revision[]) {
  const celebIds = revisions
    .filter((r) => r.table_name === "celebrities")
    .map((r) => r.record_id);
  const assetIds = revisions
    .filter((r) => r.table_name === "assets")
    .map((r) => r.record_id);

  const db = await createClient();
  const map = new Map<string, { slug: string; name: string }>();

  if (celebIds.length > 0) {
    const { data } = await db
      .from("celebrities")
      .select("id, slug, name")
      .in("id", [...new Set(celebIds)]);
    for (const row of (data ?? []) as { id: string; slug: string; name: string }[]) {
      map.set(row.id, { slug: row.slug, name: row.name });
    }
  }

  if (assetIds.length > 0) {
    const { data } = await db
      .from("assets")
      .select("id, slug, name")
      .in("id", [...new Set(assetIds)]);
    for (const row of (data ?? []) as { id: string; slug: string; name: string }[]) {
      map.set(row.id, { slug: row.slug, name: row.name });
    }
  }

  return map;
}
