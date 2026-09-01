import type { Asset } from "@/lib/types";
import { CATEGORY_SILHOUETTE } from "@/lib/silhouettes";

const SIZES = {
  sm: "h-28",
  md: "h-40",
  lg: "h-56 sm:h-72",
} as const;

/**
 * Asset photo on a transparent-friendly surface. Falls back to a category
 * silhouette so a missing image still reads as deliberate.
 */
export function AssetImage({
  asset,
  size = "md",
}: {
  asset: Pick<Asset, "name" | "category" | "imageUrl">;
  size?: keyof typeof SIZES;
}) {
  return (
    <div
      className={`${SIZES[size]} grid w-full place-items-center overflow-hidden
                  rounded-xl bg-sunken`}
    >
      {asset.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={asset.imageUrl}
          alt={asset.name}
          loading="lazy"
          className="h-full w-full object-contain p-3"
        />
      ) : (
        <span className="text-faint/45">{CATEGORY_SILHOUETTE[asset.category]}</span>
      )}
    </div>
  );
}
