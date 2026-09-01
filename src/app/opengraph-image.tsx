import { ImageResponse } from "next/og";
import { getStats } from "@/lib/db";

export const alt = "IceTrack — Mapping VIP premium assets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const stats = await getStats();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08090a",
          color: "#f2f8fb",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", fontSize: 40 }}>💎</div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>
            IceTrack
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 78,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Mapping VIP premium assets
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#949ca5", maxWidth: 860 }}>
            An open database of the jets, cars, yachts and estates owned by
            public figures. Every entry carries its source.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 40, fontSize: 26 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ display: "flex", color: "#6fc8e9", fontWeight: 700 }}>
              {stats.celebrities}
            </span>
            <span style={{ display: "flex", color: "#949ca5" }}>figures</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ display: "flex", color: "#6fc8e9", fontWeight: 700 }}>
              {stats.assets}
            </span>
            <span style={{ display: "flex", color: "#949ca5" }}>assets</span>
          </div>
          <div style={{ display: "flex", marginLeft: "auto", color: "#6a727b" }}>icetrack.vip</div>
        </div>
      </div>
    ),
    size,
  );
}
