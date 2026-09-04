"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { REACTIONS } from "@/lib/reactions";

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


type Counts = Record<string, number>;

export function Reactions({
  slug,
  initial,
}: {
  slug: string;
  initial: Counts;
}) {
  const [counts, setCounts] = useState<Counts>(initial);
  // One reaction per visitor, so this is a single key rather than a set.
  const [mine, setMine] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  // Which button is mid-animation, so the pop restarts on each fresh click.
  const [popping, setPopping] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const storageKey = `icetrack-reactions:${slug}`;

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      // Older versions stored an array; take the first entry from one.
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        setMine(
          Array.isArray(parsed)
            ? ((parsed[0] as string) ?? null)
            : typeof parsed === "string"
              ? parsed
              : null,
        );
      }
    } catch {
      // Private browsing, or storage disabled. Reacting still works; the page
      // just will not remember which one was picked.
    }
  }, [storageKey]);

  function remember(key: string | null) {
    try {
      if (key) localStorage.setItem(storageKey, JSON.stringify(key));
      else localStorage.removeItem(storageKey);
    } catch {
      // As above.
    }
  }

  async function react(key: string) {
    if (busy) return;

    const previous = mine;
    const clearing = previous === key;

    setBusy(key);
    if (!clearing) {
      setPopping(key);
      window.setTimeout(() => setPopping(null), 700);
    }

    // Move the numbers before the round trip: a counter that waits on the
    // network feels broken even when it is working.
    setCounts((c) => {
      const next = { ...c };
      if (previous) next[previous] = Math.max(0, (next[previous] ?? 1) - 1);
      if (!clearing) next[key] = (next[key] ?? 0) + 1;
      return next;
    });

    const chosen = clearing ? null : key;
    setMine(chosen);
    remember(chosen);

    const db = createClient();

    // Take the old one away first, so a visitor switching reactions never
    // counts twice even if the second call fails.
    let failedAny = false;
    if (previous) {
      const { error } = await db.rpc("unreact", {
        target_slug: slug,
        chosen: previous,
      });
      if (error) failedAny = true;
    }

    if (!clearing) {
      const { data, error } = await db.rpc("react", {
        target_slug: slug,
        chosen: key,
      });
      if (error) failedAny = true;
      else if (typeof data === "number") {
        setCounts((c) => ({ ...c, [key]: data }));
      }
    }

    if (failedAny) {
      // Put everything back rather than leaving numbers that are not real.
      setCounts((c) => {
        const back = { ...c };
        if (!clearing) back[key] = Math.max(0, (back[key] ?? 1) - 1);
        if (previous) back[previous] = (back[previous] ?? 0) + 1;
        return back;
      });
      setMine(previous);
      remember(previous);
      setFailed(true);
    } else {
      setFailed(false);
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
    <div className="flex w-full flex-col items-end gap-1.5 sm:w-auto">
      <div className="flex w-full justify-between gap-1 sm:w-auto sm:justify-end sm:gap-2">
      {ordered.map((r) => {
        const count = counts[r.key] ?? 0;
        const picked = mine === r.key;

        return (
          <button
            key={r.key}
            type="button"
            onClick={() => void react(r.key)}
            disabled={busy !== null}
            aria-label={`${r.label}${count ? `, ${count}` : ""}`}
            aria-pressed={picked}
            className={`focus-ring group flex shrink-0 items-center gap-1 rounded-full border
                        sm:gap-1.5
                        px-1.5 py-1.5 text-[16px] transition-[transform,background-color,border-color]
                        duration-150 ease-out-strong active:scale-[0.97]
                        sm:px-3.5 sm:py-2 sm:text-[19px]
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
                className={`text-[12px] font-medium tabular-nums sm:text-[14px] ${
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
