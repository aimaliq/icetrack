import type { Asset } from "./types";

/**
 * "Which costs more?" — the pairing rules.
 *
 * Kept out of the component so the awkward cases are testable: a category
 * with one entry, two assets worth the same, a database too small to avoid
 * repeats.
 */

export type Contender = Pick<
  Asset,
  "id" | "name" | "category" | "estimatedValueUsd" | "imageUrl" | "ownerId"
> & { ownerName?: string };

export type Round = { left: Contender; right: Contender };

/**
 * Entries that would make a bad question.
 *
 * The royal car collection is 7,000 cars rather than one, so at $5B it beats
 * everything and reads as a bug. Anything without a value cannot be compared
 * at all, and a tie has no right answer.
 */
const EXCLUDED = new Set(["hassanal-bolkiah-car-collection"]);

export function playable(assets: Contender[]): Contender[] {
  return assets.filter(
    (a) => !EXCLUDED.has(a.id) && (a.estimatedValueUsd ?? 0) > 0,
  );
}

/** Fisher–Yates, seeded by nothing: a fresh order every game. */
function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Build a run of rounds.
 *
 * Same category where possible — a jet against a jet is the honest question —
 * falling back to a mixed pair when a category runs dry, which it does: there
 * is only one accessory in the database. Ties are dropped; there is no right
 * answer to "which of these two equal numbers is bigger".
 *
 * Assets repeat across a long enough run, but never inside one round, and the
 * shuffle means a repeat rarely lands next to itself.
 */
export function buildRounds(pool: Contender[], count: number): Round[] {
  const usable = playable(pool);
  if (usable.length < 2) return [];

  const byCategory = new Map<string, Contender[]>();
  for (const a of usable) {
    const list = byCategory.get(a.category) ?? [];
    list.push(a);
    byCategory.set(a.category, list);
  }

  // Categories with at least a pair, biggest first: the game leans on the
  // parts of the database that can actually sustain it.
  const deep = [...byCategory.values()]
    .filter((list) => list.length >= 2)
    .sort((a, b) => b.length - a.length);

  const rounds: Round[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count * 4 && rounds.length < count; i++) {
    const group =
      deep.length > 0 && Math.random() < 0.85
        ? deep[Math.floor(Math.random() * deep.length)]
        : usable;

    const [left, right] = shuffled(group).slice(0, 2);
    if (!left || !right || left.id === right.id) continue;
    if (left.estimatedValueUsd === right.estimatedValueUsd) continue;

    // Not the same question twice in one run.
    const key = [left.id, right.id].sort().join("|");
    if (seen.has(key)) continue;
    seen.add(key);

    rounds.push({ left, right });
  }

  return rounds;
}

/** Which side is worth more. Ties never reach here — buildRounds drops them. */
export function winner(round: Round): "left" | "right" {
  return (round.left.estimatedValueUsd ?? 0) > (round.right.estimatedValueUsd ?? 0)
    ? "left"
    : "right";
}
