import type { Asset } from "./types";

/**
 * "Similar" entries for the foot of an asset page.
 *
 * Same category first, then closeness in price — a $500M yacht next to a
 * $4M one teaches nothing, while two yachts a stone's throw apart in value
 * invite the comparison the site exists for. Same-owner entries are pushed
 * down rather than excluded: they are already listed on the owner's page,
 * so leading with them wastes the slot.
 */
export function similarAssets(
  subject: Asset,
  all: Asset[],
  limit = 3,
): Asset[] {
  const value = subject.estimatedValueUsd ?? 0;

  const scored = all
    .filter((a) => a.id !== subject.id && a.category === subject.category)
    .map((a) => {
      const other = a.estimatedValueUsd ?? 0;
      // Ratio, not difference: $1M apart means nothing at $500M and
      // everything at $2M. 0 is identical, 1 is as far as it gets.
      const distance =
        value > 0 && other > 0
          ? 1 - Math.min(value, other) / Math.max(value, other)
          : 1;
      const sameOwner = a.ownerId === subject.ownerId ? 0.35 : 0;
      return { asset: a, score: distance + sameOwner };
    })
    .sort((a, b) => a.score - b.score);

  // A category with nothing else in it should not leave an empty section;
  // fall back to the closest in value from anywhere.
  if (scored.length === 0) {
    return all
      .filter((a) => a.id !== subject.id && (a.estimatedValueUsd ?? 0) > 0)
      .sort(
        (a, b) =>
          Math.abs((a.estimatedValueUsd ?? 0) - value) -
          Math.abs((b.estimatedValueUsd ?? 0) - value),
      )
      .slice(0, limit);
  }

  return scored.slice(0, limit).map((s) => s.asset);
}
