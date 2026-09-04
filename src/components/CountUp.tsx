"use client";

import { useEffect, useState } from "react";
import { formatValue } from "@/lib/format";

/**
 * A number that rolls up to its value on first paint.
 *
 * A first-load moment is the one place the motion rules leave room for
 * delight, and a figure that arrives has more weight than one that was
 * simply there. The server renders the final value, so crawlers and
 * no-JS readers see the truth; the roll only happens once script lands.
 *
 * Under prefers-reduced-motion the number just appears — a spinning
 * counter is exactly the kind of movement that setting exists to stop.
 */
export function CountUp({
  value,
  kind = "plain",
  durationMs = 1600,
}: {
  value: number;
  /** `money` renders through formatValue ("$ 12.7B"); `plain` as digits. */
  kind?: "money" | "plain";
  durationMs?: number;
}) {
  // Starts at the final value to match the server HTML; the effect rewinds
  // and rolls. Hydration never mismatches and the flash is a single frame.
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      // Strong ease-out, the house curve: fast arrival, soft landing.
      const eased = 1 - Math.pow(1 - t, 4);
      setShown(Math.round(value * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs]);

  return <>{kind === "money" ? (formatValue(shown) ?? "—") : String(shown)}</>;
}
