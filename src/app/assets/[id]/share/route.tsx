import { ImageResponse } from "next/og";
import { getAsset } from "@/lib/db";
import { CATEGORY_META } from "@/lib/categories";
import { STOPS, breakdown, money } from "@/lib/earnings";

/**
 * The share card for the earnings breakdown.
 *
 * The entry's own OG card states the price. This one states the wage, because
 * that is what the person sharing it is reacting to — a card showing only the
 * price would drop the whole point of what they clicked share on.
 *
 * The chosen span rides in the query string, so a link shared at "10 years"
 * shows the ten-year figures rather than a default nobody picked.
 *
 * Satori needs an explicit `display` on every element with more than one
 * child. Omitting one fails the production build and not dev.
 */

export const contentType = "image/png";
const size = { width: 1200, height: 630 };

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const found = await getAsset(id);
  const value = found?.asset.estimatedValueUsd;

  // Nothing to divide, nothing to draw.
  if (!found || !value) {
    return new Response("No value to break down", { status: 404 });
  }

  const { asset, owner } = found;

  // Clamp rather than trust: the index arrives from a URL anyone can edit.
  const raw = Number(new URL(request.url).searchParams.get("t"));
  const index =
    Number.isInteger(raw) && raw >= 0 && raw < STOPS.length ? raw : 3;
  const stop = STOPS[index];

  // Satori decodes PNG and JPEG only — a WebP source renders nothing and
  // takes the whole card down with it, so it is left off rather than risked.
  // The layout reads correctly either way; the photo is a bonus, not the
  // point, and the figures are what the card is for.
  const photo = /\.(png|jpe?g)(\?|$)/i.test(asset.imageUrl ?? "")
    ? asset.imageUrl
    : null;

  const rows = breakdown(value, stop.months);
  const perDay = rows.find((r) => r.label === "Per day")!.amount;

  // The three that carry the point. Per-second is the one people quote.
  const tiles = rows.filter((r) =>
    ["Per month", "Per hour", "Per second"].includes(r.label),
  );

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
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26 }}>
          <span>💎</span>
          <span style={{ display: "flex", fontWeight: 600 }}>IceTrack</span>
          <span
            style={{
              display: "flex",
              marginLeft: 12,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: 2,
              color: "#6a727b",
            }}
          >
            {CATEGORY_META[asset.category].label}
          </span>
        </div>

        {/* Photo and figures sit side by side in the flow. Absolute
            positioning would be simpler but the card has a fixed height, so an
            out-of-flow photo overlaps the tiles the moment a name wraps. */}
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div style={{ display: "flex", fontSize: 34, letterSpacing: -1 }}>
              {asset.name}
              {owner ? ` · ${owner.name}` : ""}
            </div>

            <div style={{ display: "flex", fontSize: 24, color: "#c3ccd4" }}>
              {`To buy it in ${stop.label}, you'd need`}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                marginTop: 2,
              }}
            >
              <span
                style={{
                  display: "flex",
                  fontSize: 96,
                  fontWeight: 700,
                  letterSpacing: -4,
                  lineHeight: 1,
                  color: "#4ad0a0",
                }}
              >
                {money(perDay)}
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 26,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  color: "#6a727b",
                }}
              >
                a day
              </span>
            </div>
          </div>

          {photo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={photo}
              alt=""
              width={300}
              height={200}
              style={{
                width: 300,
                height: 200,
                objectFit: "cover",
                borderRadius: 18,
              }}
            />
          )}
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {tiles.map((t) => (
            <div
              key={t.label}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                flex: 1,
                background: "#131619",
                borderRadius: 18,
                padding: "20px 24px",
              }}
            >
              <span style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
                {money(t.amount)}
              </span>
              <span
                style={{
                  display: "flex",
                  fontSize: 18,
                  textTransform: "uppercase",
                  letterSpacing: 2,
                  color: "#6a727b",
                }}
              >
                {t.label.replace("Per ", "a ")}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", fontSize: 22 }}>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ display: "flex", color: "#c3ccd4" }}>
              {money(value)}
            </span>
            <span style={{ display: "flex", color: "#6a727b" }}>
              {`· listed as ${asset.status}`}
            </span>
          </span>
          <span style={{ display: "flex", marginLeft: "auto", color: "#6a727b" }}>
            icetrack.vip
          </span>
        </div>
      </div>
    ),
    size,
  );
}
