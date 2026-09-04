"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageCredit } from "@/components/ImageCredit";
import type { GalleryImage } from "@/lib/types";

/**
 * Photo carousel for an entry with more than one image.
 *
 * A scroll-snap strip rather than stateful slides: swiping is native on
 * touch, momentum is the platform's own, and the arrows just drive the same
 * scroll. The only state is which photo is in view, tracked from scroll so
 * the dots and the credit line follow however the user moves.
 *
 * The credit sits under the strip and changes with the visible photo,
 * because licences attach to each photo, not to the entry.
 */
export function AssetGallery({
  photos,
  name,
}: {
  photos: GalleryImage[];
  name: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  function onScroll() {
    const el = scroller.current;
    if (!el) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function go(delta: number) {
    const el = scroller.current;
    if (!el) return;
    const next = Math.min(photos.length - 1, Math.max(0, index + delta));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  const current = photos[index] ?? photos[0];

  return (
    <div>
      <div className="relative">
        <div
          ref={scroller}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-xl bg-sunken
                     [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`Photos of ${name}, ${index + 1} of ${photos.length}`}
        >
          {photos.map((p, i) => (
            <div
              key={p.url}
              className="grid w-full shrink-0 snap-center place-items-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={`${name} — photo ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="max-h-[520px] min-h-[240px] w-auto max-w-full object-contain p-3"
              />
            </div>
          ))}
        </div>

        {index > 0 && (
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="focus-ring absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2
                       place-items-center rounded-full bg-elevated/90 shadow-md
                       transition-transform duration-150 ease-out-strong
                       hover:scale-105 active:scale-[0.97]"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        )}
        {index < photos.length - 1 && (
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="focus-ring absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2
                       place-items-center rounded-full bg-elevated/90 shadow-md
                       transition-transform duration-150 ease-out-strong
                       hover:scale-105 active:scale-[0.97]"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        )}

        <div
          className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5"
          aria-hidden
        >
          {photos.map((p, i) => (
            <span
              key={p.url}
              className={`h-1.5 rounded-full transition-[width,background-color]
                          duration-150 ease-out-strong ${
                            i === index
                              ? "w-4 bg-ink"
                              : "w-1.5 bg-ink/30"
                          }`}
            />
          ))}
        </div>
      </div>

      <ImageCredit credit={current} />
    </div>
  );
}
