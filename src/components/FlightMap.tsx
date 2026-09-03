"use client";

import { useEffect, useRef } from "react";
import type { StoredFlight } from "@/lib/flights/store";

/**
 * Flight paths on a map.
 *
 * Leaflet is loaded on the client only: it reaches for `window` at import
 * time, so it cannot be part of the server bundle. Tiles come from
 * OpenStreetMap, which needs no key.
 *
 * Each flight gets its own colour so overlapping routes stay separable.
 */
const COLOURS = [
  "#2563eb", "#dc2626", "#ca8a04", "#7c3aed",
  "#0d9488", "#db2777", "#ea580c", "#4338ca",
];

export function FlightMap({ flights }: { flights: StoredFlight[] }) {
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!holder.current || map.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !holder.current) return;

      const m = L.map(holder.current, {
        scrollWheelZoom: false, // A map inside a page should not hijack scrolling.
        attributionControl: true,
      }).setView([30, 0], 2);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 12,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(m);

      const bounds: [number, number][] = [];

      flights.forEach((flight, i) => {
        const points = (flight.path ?? [])
          .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
          .map((p) => [p.lat, p.lon] as [number, number]);
        if (points.length < 2) return;

        const colour = COLOURS[i % COLOURS.length];
        L.polyline(points, { color: colour, weight: 2, opacity: 0.8 }).addTo(m);

        // Mark the ends, which is where the flight actually says something.
        for (const end of [points[0], points[points.length - 1]]) {
          L.circleMarker(end, {
            radius: 3.5,
            color: colour,
            fillColor: colour,
            fillOpacity: 1,
            weight: 0,
          }).addTo(m);
        }

        bounds.push(...points);
      });

      if (bounds.length > 0) m.fitBounds(bounds, { padding: [24, 24] });
      map.current = m;
    })();

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [flights]);

  const withPath = flights.filter((f) => (f.path?.length ?? 0) > 1).length;

  return (
    <div className="overflow-hidden rounded-2xl bg-elevated">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={holder} className="h-[380px] w-full sm:h-[460px]" />
      <p className="px-4 py-3 text-[12px] text-faint">
        {withPath} flight{withPath === 1 ? "" : "s"} in the last 30 days. Each
        colour is one flight; dots are its start and end. Positions are ADS-B
        broadcasts collected by{" "}
        <a
          href="https://opensky-network.org"
          target="_blank"
          rel="noreferrer"
          className="hover:text-ink"
        >
          OpenSky Network
        </a>
        .
      </p>
    </div>
  );
}
