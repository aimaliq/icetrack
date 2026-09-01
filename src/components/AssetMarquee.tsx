import Link from "next/link";
import type { Asset, Celebrity } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { formatValue } from "@/lib/format";
import { AssetImage } from "./AssetImage";

/**
 * Vertically scrolling feed of recent entries.
 *
 * The list is rendered twice and the track translates by exactly half its
 * height, so the loop returns to an identical frame with no visible seam.
 * It is a CSS animation rather than JS: nothing to schedule, and it respects
 * prefers-reduced-motion through the global rule in globals.css.
 */
export function AssetMarquee({
  assets,
  owners,
}: {
  assets: Asset[];
  owners: Map<string, Celebrity>;
}) {
  if (assets.length === 0) return null;

  // Duplicated for the seamless wrap; the copy is hidden from screen readers.
  const track = [...assets, ...assets];

  return (
    <div
      className="relative h-[380px] overflow-hidden sm:h-[460px] lg:h-[540px]"
      // Fades the strip into the page at both ends instead of cutting it.
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div className="animate-marquee space-y-3 [animation-play-state:running] hover:[animation-play-state:paused]">
        {track.map((asset, i) => {
          const owner = owners.get(asset.ownerId);
          const value = formatValue(asset.estimatedValueUsd);
          const isClone = i >= assets.length;

          return (
            <Link
              key={`${asset.id}-${i}`}
              href={`/assets/${asset.id}`}
              aria-hidden={isClone}
              tabIndex={isClone ? -1 : undefined}
              className="focus-ring flex items-center gap-3 rounded-2xl bg-elevated p-3
                         transition-shadow duration-200 ease-out-strong hover:shadow-lg hover:shadow-black/5"
            >
              <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl sm:h-[72px] sm:w-24">
                <AssetImage asset={asset} bleed showBadge={false} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold tracking-tight">
                  {asset.name}
                </p>
                {owner && (
                  <p className="truncate text-[13px] text-muted">{owner.name}</p>
                )}
                <p className="mt-0.5 text-[11px] uppercase tracking-widest text-faint">
                  {CATEGORY_META[asset.category].label}
                </p>
              </div>

              {value && (
                <span className="shrink-0 text-[16px] font-semibold tabular-nums text-money">
                  {value}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
