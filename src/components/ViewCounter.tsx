"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Records that this page was looked at.
 *
 * Runs from the browser rather than the server so that crawlers, prefetches
 * and build-time rendering do not inflate the number. It renders nothing —
 * the count itself is read on the server and displayed with the other stats,
 * so the figure is correct in the HTML rather than appearing a moment later.
 *
 * One view per page per session: a reader flicking back and forth should not
 * run the number up.
 */
export function ViewCounter({
  table,
  slug,
}: {
  table: "celebrities" | "assets";
  slug: string;
}) {
  useEffect(() => {
    const key = `icetrack-viewed:${table}:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private browsing. Counting a few extra views is better than none.
    }

    const db = createClient();
    void db.rpc("record_view", { target_table: table, target_slug: slug });
  }, [table, slug]);

  return null;
}
