import { ImageResponse } from "next/og";
import { getCelebrities, getCelebrity } from "@/lib/data";
import { CATEGORY_META } from "@/lib/categories";
import { formatValue, totalValue } from "@/lib/format";

export const alt = "IceTrack celebrity profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getCelebrities().map((c) => ({ id: c.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const celeb = getCelebrity(id);

  const total = celeb ? formatValue(totalValue(celeb.assets)) : null;
  const categories = celeb
    ? [...new Set(celeb.assets.map((a) => CATEGORY_META[a.category].plural))]
    : [];

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
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28 }}>
          <span>💎</span>
          <span style={{ display: "flex", fontWeight: 600 }}>IceTrack</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {celeb?.name ?? "Not found"}
          </div>
          {categories.length > 0 && (
            <div style={{ display: "flex", fontSize: 30, color: "#949ca5" }}>
              {categories.join(" · ")}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", fontSize: 22, color: "#6a727b" }}>Tracked assets</div>
            <div style={{ display: "flex", fontSize: 46, fontWeight: 700 }}>
              {celeb?.assets.length ?? 0}
            </div>
          </div>
          {total && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", fontSize: 22, color: "#6a727b" }}>Estimated value</div>
              <div style={{ display: "flex", fontSize: 46, fontWeight: 700, color: "#4ad0a0" }}>
                {total}
              </div>
            </div>
          )}
          <div style={{ display: "flex", marginLeft: "auto", fontSize: 24, color: "#6a727b" }}>
            icetrack.vip
          </div>
        </div>
      </div>
    ),
    size,
  );
}
