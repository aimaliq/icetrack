import { CATEGORY_META } from "@/lib/categories";

/**
 * Live position, embedded from adsb.fi.
 *
 * Building this ourselves was abandoned: collecting flight history needs
 * longer than a serverless function may run. adsb.fi already renders the map,
 * sets no X-Frame-Options, and answers in about a tenth of a second — so the
 * sensible version of this feature is to embed theirs rather than rebuild it.
 *
 * It shows the aircraft when it is airborne and its last known position
 * otherwise, which is what a reader wants from a tracking panel anyway.
 */
export function LiveTrackEmbed({ icao24 }: { icao24: string }) {
  const hex = icao24.toLowerCase().trim();
  const src = `https://globe.adsb.fi/?icao=${hex}&hideSidebar&hideButtons&zoom=5`;

  return (
    <div className="overflow-hidden rounded-2xl bg-elevated">
      <iframe
        src={src}
        title={`Live position for aircraft ${hex.toUpperCase()}`}
        loading="lazy"
        className="h-[380px] w-full border-0 sm:h-[460px]"
        // The frame needs nothing from the page and should get nothing.
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
      />
      <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-faint">
        Live position for{" "}
        <span className="font-mono uppercase text-muted">{hex}</span> · shown
        when the aircraft is transmitting, otherwise its last known position ·
        map and data by{" "}
        <a
          href={`https://globe.adsb.fi/?icao=${hex}`}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:text-ink hover:underline"
        >
          adsb.fi
        </a>
        , from receivers run by volunteers
      </p>
    </div>
  );
}

/** Only aircraft have a transponder address to track. */
export function isTrackable(category: string, icao24: unknown): boolean {
  return (
    category === "jet" &&
    typeof icao24 === "string" &&
    /^[0-9a-fA-F]{6}$/.test(icao24.trim())
  );
}

export const TRACK_LABEL = CATEGORY_META.jet.label;
