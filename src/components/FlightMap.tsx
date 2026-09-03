"use client";

import { useEffect, useRef, useState } from "react";
import type { StoredFlight } from "@/lib/flights/store";

/**
 * Flight paths on a map.
 *
 * Leaflet is imported on the client only: it touches `window` at module scope,
 * so it cannot be part of the server bundle.
 *
 * Tiles come from Esri's light and dark grey canvases: near-monochrome, so
 * they stay quiet under the flight lines, and free without a key. CARTO's
 * equivalents look better still but stamp "API KEY REQUIRED" across every tile
 * when a browser sends a Referer, which a curl check does not reveal.
 *
 * The map renders even with nothing to draw. An empty frame says the feature
 * exists and this aircraft simply has not been seen; no frame at all says
 * nothing.
 */
const COLOURS = [
  "#2563eb", "#dc2626", "#ca8a04", "#7c3aed",
  "#0d9488", "#db2777", "#ea580c", "#4338ca",
];

const TILES = {
  light:
    "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  dark: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

export function FlightMap({ flights }: { flights: StoredFlight[] }) {
  const holder = useRef<HTMLDivElement>(null);
  const map = useRef<import("leaflet").Map | null>(null);
  const [ready, setReady] = useState(false);

  const drawable = flights.filter((f) => (f.path?.length ?? 0) > 1);

  useEffect(() => {
    if (!holder.current || map.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !holder.current) return;

      const dark =
        document.documentElement.dataset.theme === "dark" ||
        (!document.documentElement.dataset.theme &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      const m = L.map(holder.current, {
        // A map inside an article should never swallow the page scroll.
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      }).setView([25, 5], 2);

      L.tileLayer(dark ? TILES.dark : TILES.light, {
        maxZoom: 11,
        attribution: "Tiles &copy; Esri",
      }).addTo(m);

      const bounds: [number, number][] = [];

      drawable.forEach((flight, i) => {
        const points = flight.path
          .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
          .map((p) => [p.lat, p.lon] as [number, number]);
        if (points.length < 2) return;

        const colour = COLOURS[i % COLOURS.length];

        // A wider, faint line under the sharp one lifts the route off the map
        // where several cross.
        L.polyline(points, { color: colour, weight: 6, opacity: 0.12 }).addTo(m);
        L.polyline(points, { color: colour, weight: 1.75, opacity: 0.95 }).addTo(m);

        for (const end of [points[0], points[points.length - 1]]) {
          L.circleMarker(end, {
            radius: 4,
            color: "#fff",
            weight: 1.5,
            fillColor: colour,
            fillOpacity: 1,
          }).addTo(m);
        }

        bounds.push(...points);
      });

      if (bounds.length > 0) m.fitBounds(bounds, { padding: [28, 28] });

      map.current = m;
      setReady(true);
    })();

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [drawable]);

  return (
    <div className="overflow-hidden rounded-2xl bg-elevated">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      <div className="relative">
        <div ref={holder} className="h-[380px] w-full sm:h-[440px]" />

        {/* Sits over the map until it draws, and stays over an empty one. */}
        {(!ready || drawable.length === 0) && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {drawable.length === 0 && ready && (
              <div className="rounded-2xl bg-surface/85 px-5 py-4 text-center backdrop-blur">
                <p className="text-[14px] font-medium">No flights recorded yet</p>
                <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-muted">
                  This aircraft has not been picked up by the receiver network in
                  the last 30 days.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-faint">
        {drawable.length > 0 ? (
          <>
            {drawable.length} flight{drawable.length === 1 ? "" : "s"} in the last
            30 days · each colour is one flight
          </>
        ) : (
          <>Last 30 days</>
        )}{" "}
        · positions broadcast by the aircraft, collected by{" "}
        <a
          href="https://opensky-network.org"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:text-ink hover:underline"
        >
          OpenSky Network
        </a>
      </p>
    </div>
  );
}
