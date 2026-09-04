import { SITE_URL } from "@/lib/site";

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
        <span className="font-mono uppercase text-muted">{hex}</span>, otherwise
        its last known position · map and data by{" "}
        <a
          href={`https://globe.adsb.fi/?icao=${hex}`}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:text-ink hover:underline"
        >
          adsb.fi
        </a>
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

/**
 * Live ship position, embedded from VesselFinder.
 *
 * Ships broadcast AIS the way aircraft broadcast ADS-B, and the same logic
 * applies as for the flight map: VesselFinder already renders the map, sets
 * no X-Frame-Options on this endpoint, and their own widget builds exactly
 * this URL — so we embed theirs rather than rebuild it.
 *
 * Every parameter here is one their aismap.js generator writes. `ra` is the
 * embedding page and is REQUIRED — without it the endpoint answers 400. That
 * also means the referrer stays off: the URL already says who we are.
 */
export function ShipTrackEmbed({ mmsi }: { mmsi: string }) {
  const id = mmsi.trim();
  const src =
    "https://www.vesselfinder.com/aismap" +
    `?zoom=undefined&lat=undefined&lon=undefined` +
    `&width=${encodeURIComponent("100%")}&height=460` +
    `&names=false&mmsi=${id}&track=true` +
    `&fleet=false&fleet_name=false&fleet_hide_old_positions=false` +
    `&clicktoact=false&store_pos=true` +
    `&ra=${encodeURIComponent(SITE_URL)}`;

  return (
    <div className="overflow-hidden rounded-2xl bg-elevated">
      <iframe
        src={src}
        title={`Live position for vessel ${id}`}
        loading="lazy"
        className="h-[380px] w-full border-0 sm:h-[460px]"
        // The frame needs nothing from the page and should get nothing.
        sandbox="allow-scripts allow-same-origin"
        referrerPolicy="no-referrer"
      />
      <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-faint">
        Latest AIS position for MMSI{" "}
        <span className="font-mono text-muted">{id}</span>, with its recent
        track · map and data by{" "}
        <a
          href={`https://www.vesselfinder.com/?mmsi=${id}`}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:text-ink hover:underline"
        >
          VesselFinder
        </a>
      </p>
    </div>
  );
}

/** A yacht with a nine-digit MMSI can be shown on the ship map. */
export function isTrackableShip(category: string, mmsi: unknown): boolean {
  return (
    category === "yacht" &&
    typeof mmsi === "string" &&
    /^\d{9}$/.test(mmsi.trim())
  );
}
