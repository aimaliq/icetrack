"use client";

import { useEffect, useState } from "react";

/**
 * Cycles a word in place: the outgoing one lifts and fades, the incoming one
 * rises into its slot.
 *
 * Motion follows the project's rules (see CLAUDE.md): transform and opacity
 * only, 260ms, strong ease-out. The animation is a CSS class toggled around a
 * timer rather than a library — one element cross-fading does not justify one.
 */
export function RotatingWord({
  words,
  intervalMs = 2400,
  className = "",
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (words.length < 2) return;

    // Respect a reduced-motion preference by not cycling at all: a word
    // swapping under the reader is movement, whether or not it is animated.
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduce) return;

    const hold = window.setInterval(() => {
      setLeaving(true);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setLeaving(false);
      }, 260);
    }, intervalMs);

    return () => window.clearInterval(hold);
  }, [words, intervalMs]);

  return (
    // The widest word reserves the space, so the line never reflows mid-swap.
    <span className={`relative inline-grid overflow-hidden align-bottom ${className}`}>
      {/* Sets the width; invisible, and skipped by screen readers. */}
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>

      <span
        aria-live="polite"
        className={`col-start-1 row-start-1 transition-[transform,opacity] duration-[260ms]
                    ease-out-strong ${
                      leaving
                        ? "-translate-y-[0.35em] opacity-0"
                        : "translate-y-0 opacity-100"
                    }`}
      >
        {words[index]}
      </span>
    </span>
  );
}
