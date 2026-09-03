"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Emoji reactions.
 *
 * Open to everyone, signed in or not: reacting asserts nothing about the world
 * the way an edit does, so it does not need the same bar.
 *
 * The key is stored, not the emoji, so the set can be restyled without
 * orphaning counts. Which ones a visitor has picked lives in localStorage —
 * the database holds counts only and no record of who reacted.
 */
const REACTIONS = [
  { key: "heart_eyes", emoji: "😍", label: "Love it" },
  { key: "heart", emoji: "❤️", label: "Heart" },
  { key: "wow", emoji: "😮", label: "Wow" },
  { key: "money", emoji: "💸", label: "Expensive" },
  { key: "thumbs_down", emoji: "👎", label: "Dislike" },
  { key: "poop", emoji: "💩", label: "Awful" },
] as const;

type Counts = Record<string, number>;

export function Reactions({
  slug,
  initial,
}: {
  slug: string;
  initial: Counts;
}) {
  const [counts, setCounts] = useState<Counts>(initial);
  const [mine, setMine] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  // Which button is mid-animation, so the pop restarts on each fresh click.
  const [popping, setPopping] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const storageKey = `icetrack-reactions:${slug}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setMine(new Set(JSON.parse(saved) as string[]));
    } catch {
      // Private browsing, or storage disabled. Reacting still works; the page
      // just will not remember which ones were picked.
    }
  }, [storageKey]);

  async function react(key: string) {
    if (busy || mine.has(key)) return;
    setBusy(key);
    setPopping(key);
    window.setTimeout(() => setPopping(null), 700);

    // Move the number immediately: a counter that waits on a round trip feels
    // broken even when it is working.
    setCounts((c) => ({ ...c, [key]: (c[key] ?? 0) + 1 }));
    const next = new Set(mine).add(key);
    setMine(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify([...next]));
    } catch {
      // As above.
    }

    const db = createClient();
    const { data, error } = await db.rpc("react", {
      target_slug: slug,
      chosen: key,
    });

    if (error) {
      // Put it back rather than leaving a number that is not real, and say so:
      // a count that appears and then vanishes reads as a broken page.
      setCounts((c) => ({ ...c, [key]: Math.max(0, (c[key] ?? 1) - 1) }));
      const reverted = new Set(next);
      reverted.delete(key);
      setMine(reverted);
      setFailed(true);
    } else if (typeof data === "number") {
      setFailed(false);
      setCounts((c) => ({ ...c, [key]: data }));
    }

    setBusy(null);
  }

  // Most-voted first. Sorted off `initial` rather than the live counts, so a
  // click does not make the buttons jump out from under the cursor; the new
  // order settles on the next load.
  const ordered = [...REACTIONS].sort(
    (a, b) => (initial[b.key] ?? 0) - (initial[a.key] ?? 0),
  );

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap gap-2">
      {ordered.map((r) => {
        const count = counts[r.key] ?? 0;
        const picked = mine.has(r.key);

        return (
          <button
            key={r.key}
            type="button"
            onClick={() => void react(r.key)}
            disabled={picked}
            aria-label={`${r.label}${count ? `, ${count}` : ""}`}
            aria-pressed={picked}
            className={`focus-ring group flex items-center gap-1.5 rounded-full border
                        px-3.5 py-2 text-[19px] transition-[transform,background-color,border-color]
                        duration-150 ease-out-strong active:scale-[0.97]
                        ${
                          picked
                            ? "border-accent bg-accent-soft"
                            : "border-line bg-elevated hover:border-accent/40 hover:bg-sunken"
                        }`}
          >
            <span className="relative leading-none">
              <span
                aria-hidden
                className={`block transition-transform duration-150 ease-out-strong
                            group-hover:scale-110 ${
                              popping === r.key ? "animate-pop" : ""
                            }`}
              >
                {r.emoji}
              </span>

              {/* A copy of the emoji lifting away, so the click registers as
                  something landing rather than only a number changing. */}
              {popping === r.key && (
                <span
                  aria-hidden
                  className="animate-float-up pointer-events-none absolute inset-0
                             flex items-center justify-center"
                >
                  {r.emoji}
                </span>
              )}
            </span>
            {count > 0 && (
              <span
                className={`text-[14px] font-medium tabular-nums ${
                  picked ? "text-accent" : "text-muted"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
      </div>

      {failed && (
        <p role="alert" className="text-[12px] text-amber-700 dark:text-amber-300">
          Could not save that. Try again shortly.
        </p>
      )}
    </div>
  );
}
