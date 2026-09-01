/** Compact money for cards and stat tiles: $1.2M, $850K, $2.4B. */
export function formatValue(usd: number | undefined | null): string | null {
  if (usd === undefined || usd === null || usd <= 0) return null;
  if (usd >= 1_000_000_000) return `$${trim(usd / 1_000_000_000)}B`;
  if (usd >= 1_000_000) return `$${trim(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$${trim(usd / 1_000)}K`;
  return `$${usd}`;
}

function trim(n: number): string {
  return n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1).replace(/\.0$/, "") : n.toFixed(1).replace(/\.0$/, "");
}

/** Full precision, for detail pages. */
export function formatValueExact(usd: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

/** Total tracked value across a set of assets. */
export function totalValue(
  assets: { estimatedValueUsd?: number }[],
): number {
  return assets.reduce((sum, a) => sum + (a.estimatedValueUsd ?? 0), 0);
}
