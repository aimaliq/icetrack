/** Compact money for cards and stat tiles: "$ 1.2M", "$ 850K", "$ 2.4B". */
export function formatValue(usd: number | undefined | null): string | null {
  if (usd === undefined || usd === null || usd <= 0) return null;
  if (usd >= 1_000_000_000) return `$ ${trim(usd / 1_000_000_000)}B`;
  if (usd >= 1_000_000) return `$ ${trim(usd / 1_000_000)}M`;
  if (usd >= 1_000) return `$ ${trim(usd / 1_000)}K`;
  return `$ ${usd}`;
}

function trim(n: number): string {
  return n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1).replace(/\.0$/, "") : n.toFixed(1).replace(/\.0$/, "");
}

/** Full precision, for detail pages: "$ 185,000,000". */
export function formatValueExact(usd: number): string {
  const n = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(usd);
  return `$ ${n}`;
}

/**
 * Total tracked value across a set of assets.
 *
 * Only what the person still owns counts. `former` is something they sold and
 * `disputed` is something we are not sure they ever had — adding either to a
 * headline figure would state a total the database does not stand behind.
 * They stay visible on the page; they just do not sum.
 */
export function totalValue(
  assets: { estimatedValueUsd?: number; status?: string }[],
): number {
  return assets
    .filter((a) => a.status !== "former" && a.status !== "disputed")
    .reduce((sum, a) => sum + (a.estimatedValueUsd ?? 0), 0);
}
