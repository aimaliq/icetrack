import { ImageResponse } from "next/og";
import { getAsset, getAssets } from "@/lib/db";
import { CATEGORY_META } from "@/lib/categories";
import { formatValue } from "@/lib/format";

export const alt = "IceTrack asset";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getAssets()).map((a) => ({ id: a.id }));
}

const STATUS_COLOR: Record<string, string> = {
  verified: "#4ad0a0",
  reported: "#6fc8e9",
  unverified: "#949ca5",
  former: "#949ca5",
  disputed: "#e0a44a",
};

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = await getAsset(id);
  const asset = found?.asset;
  const owner = found?.owner;
  const value = asset?.estimatedValueUsd ? formatValue(asset.estimatedValueUsd) : null;

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
          {asset && (
            <span
              style={{
                display: "flex",
                marginLeft: 12,
                fontSize: 22,
                textTransform: "uppercase",
                letterSpacing: 2,
                color: STATUS_COLOR[asset.status] ?? "#949ca5",
              }}
            >
              {asset.status}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {asset && (
            <div style={{ display: "flex", fontSize: 28, color: "#949ca5" }}>
              {`${CATEGORY_META[asset.category].label}${owner ? ` · ${owner.name}` : ""}`}
            </div>
          )}
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              maxWidth: 1000,
            }}
          >
            {asset?.name ?? "Not found"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end" }}>
          {value && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", fontSize: 22, color: "#6a727b" }}>Estimated value</div>
              <div style={{ display: "flex", fontSize: 52, fontWeight: 700, color: "#4ad0a0" }}>
                {value}
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
