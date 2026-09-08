import { formatValue } from "@/lib/format";

export type RunPoint = { ok: boolean; balance: number };

/**
 * The shape of a run: how the portfolio climbed and where it fell over.
 *
 * An inline SVG rather than a chart library — this is one line and a few
 * dots, and a dependency for that would cost more than it explains. The
 * baseline is drawn wherever zero falls, so a run that went underwater
 * reads as underwater rather than merely low.
 */
export function RunChart({ points }: { points: RunPoint[] }) {
  if (points.length === 0) return null;

  const W = 560;
  const H = 110;
  const PAD = 10;

  const balances = [0, ...points.map((p) => p.balance)];
  const max = Math.max(...balances);
  const min = Math.min(...balances);
  // A flat run would divide by zero; give it a nominal span instead.
  const span = max - min || Math.abs(max) || 1;

  const x = (i: number) =>
    PAD + (i * (W - PAD * 2)) / Math.max(1, balances.length - 1);
  const y = (v: number) =>
    H - PAD - ((v - min) / span) * (H - PAD * 2);

  const line = balances.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const zeroY = y(0);
  const last = points[points.length - 1];

  return (
    <figure className="mt-8">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mx-auto w-full max-w-md"
        role="img"
        aria-label={`Portfolio over ${points.length} rounds, ending at ${
          formatValue(Math.abs(last.balance)) ?? "$0"
        }`}
      >
        {/* Zero line: only worth drawing when the run crossed it. */}
        {min < 0 && (
          <line
            x1={PAD}
            x2={W - PAD}
            y1={zeroY}
            y2={zeroY}
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3 4"
            className="text-line"
          />
        )}

        <polyline
          points={line}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={last.balance >= 0 ? "text-money" : "text-rose-500"}
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i + 1)}
            cy={y(p.balance)}
            r={p.ok ? 3.5 : 5}
            className={p.ok ? "fill-money" : "fill-rose-500"}
          />
        ))}
      </svg>

      <figcaption className="mt-2 text-[11px] uppercase tracking-widest text-faint">
        Portfolio over {points.length}{" "}
        {points.length === 1 ? "round" : "rounds"}
      </figcaption>
    </figure>
  );
}

/**
 * The Wordle trick: a result that pastes as text anywhere, no image and no
 * link preview needed. Squares read as a run at a glance even stripped of
 * every style.
 */
export function runGrid(points: RunPoint[]): string {
  return points.map((p) => (p.ok ? "🟩" : "🟥")).join("");
}
