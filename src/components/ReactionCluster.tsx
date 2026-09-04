import { EMOJI_BY_KEY } from "@/lib/reactions";
import { formatCount } from "@/lib/format";

/**
 * The traction badge on a card: the three most-chosen reactions overlapping,
 * with the total beside them — the grammar messengers use for "people felt
 * things about this". Renders nothing when nobody has reacted, because an
 * explicit zero would read as a verdict.
 */
export function ReactionCluster({
  counts,
}: {
  counts?: Record<string, number>;
}) {
  if (!counts) return null;

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  if (total === 0) return null;

  const top = Object.entries(counts)
    .filter(([key, n]) => n > 0 && EMOJI_BY_KEY[key])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <span
      className="flex items-center gap-1 rounded-full bg-elevated/95 py-0.5 pl-1 pr-2
                 shadow-sm ring-1 ring-line/60 backdrop-blur-sm"
      title={`${total} ${total === 1 ? "reaction" : "reactions"}`}
    >
      <span className="flex -space-x-1.5" aria-hidden>
        {top.map(([key], i) => (
          <span
            key={key}
            // Most-chosen on top of the stack, not underneath it.
            style={{ zIndex: top.length - i }}
            className="relative grid h-5 w-5 place-items-center rounded-full
                       bg-elevated text-[11px] ring-1 ring-line/60"
          >
            {EMOJI_BY_KEY[key]}
          </span>
        ))}
      </span>
      <span className="text-[11px] font-semibold tabular-nums text-muted">
        {formatCount(total)}
      </span>
    </span>
  );
}
