import type { Asset } from "@/lib/types";
import { CATEGORY_SILHOUETTE } from "@/lib/silhouettes";

const SIZES = {
  /** Inherits the parent's height, so the caller sets the aspect ratio. */
  fill: "h-full",
  sm: "h-28",
  md: "h-44",
  /**
   * Detail pages cap the height instead of fixing it, so a portrait photo —
   * a watch, a standing figure — fills the space it needs rather than being
   * shrunk into the middle of a wide letterbox.
   */
  lg: "max-h-[520px] min-h-[240px]",
} as const;

/**
 * Asset photo. `bleed` runs it edge to edge with square top corners, for the
 * top half of a card; otherwise it sits in its own rounded box.
 */
export function AssetImage({
  asset,
  size = "md",
  bleed = false,
  showBadge = true,
  fit = "cover",
}: {
  asset: Pick<Asset, "name" | "category" | "imageUrl" | "imageIsRepresentative">;
  size?: keyof typeof SIZES;
  bleed?: boolean;
  /** Off at thumbnail sizes, where the label crowds the image and the entry
   *  page it links to states the same caveat properly. */
  showBadge?: boolean;
  /** `cover` fills the frame but crops; at small sizes that can leave a jet as
   *  a patch of sky, so thumbnails ask for `contain` and show the whole item. */
  fit?: "cover" | "contain";
}) {
  return (
    <div
      className={`${SIZES[size]} relative grid w-full place-items-center
                  overflow-hidden bg-sunken ${bleed ? "" : "rounded-xl"}`}
    >
      {/* A photo of the model must never read as a photo of the actual item. */}
      {showBadge && asset.imageUrl && asset.imageIsRepresentative && (
        <span
          className="absolute right-2 top-2 z-10 rounded-full bg-surface/85 px-2
                     py-0.5 text-[10px] font-medium uppercase tracking-wide
                     text-muted backdrop-blur"
        >
          Model shown
        </span>
      )}

      {asset.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={asset.imageUrl}
          alt={asset.name}
          loading="lazy"
          className={
            fit === "contain"
              ? "h-full w-full object-contain p-1.5"
              : bleed
                ? "h-full w-full object-cover transition-transform duration-500 ease-out-strong group-hover:scale-[1.03]"
                : "max-h-[520px] w-auto max-w-full object-contain p-3"
          }
        />
      ) : (
        <span className="text-faint/40">{CATEGORY_SILHOUETTE[asset.category]}</span>
      )}
    </div>
  );
}
