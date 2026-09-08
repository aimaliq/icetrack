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
  fit = "cover",
}: {
  asset: Pick<Asset, "name" | "category" | "imageUrl">;
  size?: keyof typeof SIZES;
  bleed?: boolean;
  /** `cover` fills the frame but crops; at small sizes that can leave a jet as
   *  a patch of sky, so thumbnails ask for `contain` and show the whole item.
   *  `height` scales to the frame's height instead — a portrait object like a
   *  watch then shows whole, cropped at the sides where there is only
   *  backdrop. */
  fit?: "cover" | "contain" | "height";
}) {
  return (
    <div
      className={`${SIZES[size]} relative grid w-full place-items-center
                  overflow-hidden ${fit === "height" ? "bg-white" : "bg-sunken"}
                  ${bleed ? "" : "rounded-xl"}`}
    >
      {asset.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={asset.imageUrl}
          alt={asset.name}
          loading="lazy"
          className={
            fit === "height"
              ? // Whole object on white, driven by whichever side runs out
                // first — height for a standing photo, which then fills the
                // frame top to bottom and leaves white at the sides.
                //
                // h-full w-full, not w-auto: with an auto width the element
                // sizes itself from the image and a tall photo overflows the
                // frame downward. Filling both and letting object-contain do
                // the scaling is what keeps it inside.
                // Absolute, not just h-full: the frame is a centring grid,
                // and a grid item sizes itself from its content first, so a
                // tall photo lays out at its own height and h-full is
                // ignored. Pinning to the box makes the height real, and
                // object-contain then scales the photo to fit inside it.
                `absolute inset-0 h-full w-full object-contain ${
                  bleed
                    ? "transition-transform duration-500 ease-out-strong group-hover:scale-[1.03]"
                    : ""
                }`
              : fit === "contain"
              ? `h-full w-full object-contain ${bleed ? "p-4" : "p-1.5"}`
              : bleed
                ? "h-full w-full object-cover object-top transition-transform duration-500 ease-out-strong group-hover:scale-[1.03]"
                : "max-h-[520px] w-auto max-w-full object-contain p-3"
          }
        />
      ) : (
        <span className="h-1/3 w-1/3 max-h-24 max-w-24 text-accent/25">
          {CATEGORY_SILHOUETTE[asset.category]}
        </span>
      )}
    </div>
  );
}
