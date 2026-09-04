import Link from "next/link";
import { getAssets, getCelebritiesWithAssets, getStats, getAllReactions } from "@/lib/db";
import { CATEGORY_ORDER } from "@/lib/categories";
import { CategoryTile } from "@/components/CategoryTile";
import { AssetCard } from "@/components/AssetCard";
import { CountUp } from "@/components/CountUp";
import { AssetMarquee } from "@/components/AssetMarquee";
import { RotatingWord } from "@/components/RotatingWord";
import { Avatar } from "@/components/Avatar";
import { formatValue, totalValue } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

export default async function Home() {
  const stats = await getStats();
  const celebrities = await getCelebritiesWithAssets();
  const assets = await getAssets();
  const traction = await getAllReactions();
  const byId = new Map(celebrities.map((c) => [c.id, c]));

  const counts = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, assets.filter((a) => a.category === c).length]),
  ) as Record<string, number>;

  const ownerBySlug = new Map(celebrities.map((c) => [c.id, c]));
  // The ten most valuable, not the first ten alphabetically: the strip is the
  // first thing a visitor sees, so it should lead with the Eclipses and the
  // Antilias. Ten is enough to fill the window twice over and few enough that
  // the loop comes round rather than reading as an endless list.
  const marqueeAssets = (() => {
    const ranked = [...assets].sort(
      (a, b) => (b.estimatedValueUsd ?? 0) - (a.estimatedValueUsd ?? 0),
    );
    return ranked.length >= 4 ? ranked.slice(0, 10) : [...ranked, ...ranked];
  })();

  const top = [...celebrities]
    .sort((a, b) => totalValue(b.assets) - totalValue(a.assets))
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "IceTrack",
    alternateName: "IceTrack — Mapping VIP premium assets",
    url: SITE_URL,
    description:
      "A community-built database mapping the luxury assets of public figures.",
    license: "https://creativecommons.org/licenses/by-sa/4.0/",
    isAccessibleForFree: true,
    creator: { "@type": "Organization", name: "IceTrack", url: SITE_URL },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_minmax(0,420px)] lg:gap-14">
          {/* Left: the pitch. */}
          <div className="text-center lg:text-left">
            <p className="animate-fade-up text-[11px] uppercase tracking-[0.24em] text-accent sm:text-[12px]">
              Community sourced
            </p>

            <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.05] tracking-tightest sm:mt-6 sm:text-6xl">
              Tracking VIP
              <br />
              <RotatingWord
                words={["Jets", "Yachts", "Mansions", "Cars", "Watches"]}
                className="text-accent"
              />
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted sm:mt-6 sm:text-[17px] lg:mx-0">
              Jets, yachts, supercars and watches owned by the world&apos;s
              biggest names.
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3
                            sm:flex-row sm:items-center lg:justify-start">
              <Link
                href="/celebrities"
                className="focus-ring rounded-full bg-ink px-6 py-3 text-[15px] font-medium
                           text-surface transition-opacity duration-150 ease-out-strong hover:opacity-90 sm:py-2.5 sm:text-[14px]"
              >
                Explore
              </Link>
              <Link
                href="/about"
                className="focus-ring rounded-full border border-line px-6 py-3 text-[15px]
                           transition-colors duration-150 ease-out-strong hover:bg-sunken sm:py-2.5 sm:text-[14px]"
              >
                How it works
              </Link>
            </div>

            <dl className="mx-auto mt-10 grid max-w-lg grid-cols-3 overflow-hidden
                           rounded-2xl bg-elevated text-center sm:mt-12 lg:mx-0">
              {[
                {
                  label: "Tracked value",
                  value: totalValue(assets),
                  kind: "money" as const,
                },
                { label: "Assets", value: stats.assets, kind: "plain" as const },
                {
                  label: "Celebrities",
                  value: stats.celebrities,
                  kind: "plain" as const,
                },
              ].map((s) => (
                <div key={s.label} className="px-3 py-5 sm:px-4 sm:py-6">
                  <dd
                    className={`text-[22px] font-semibold tracking-tight tabular-nums sm:text-[26px] ${
                      s.label === "Tracked value" ? "text-money" : ""
                    }`}
                  >
                    <CountUp value={s.value} kind={s.kind} />
                  </dd>
                  <dt className="mt-1 text-[10px] uppercase tracking-widest text-faint sm:text-[11px]">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: what is actually in the database, moving. */}
          <div className="hidden lg:block">
            <AssetMarquee assets={marqueeAssets} owners={ownerBySlug} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">Categories</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {CATEGORY_ORDER.map((cat) => (
            <CategoryTile key={cat} category={cat} count={counts[cat] ?? 0} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Most relevant
          </h2>
          <Link href="/celebrities" className="focus-ring text-[15px] text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-4">
          {top.map((c) => {
            const worth = formatValue(totalValue(c.assets));
            return (
              <Link
                key={c.id}
                href={`/celebrities/${c.id}`}
                className="focus-ring group flex flex-col items-center gap-3 rounded-2xl
                           bg-elevated p-4 text-center transition-shadow duration-200 ease-out-strong
                           hover:shadow-lg hover:shadow-black/5 sm:p-6"
              >
                <Avatar person={c} size="md" />
                <div>
                  <p className="text-[15px] font-semibold tracking-tight">{c.name}</p>
                  <p className="mt-0.5 text-[13px] text-faint">
                    {c.assets.length} {c.assets.length === 1 ? "asset" : "assets"}
                  </p>
                </div>
                {worth && (
                  <p className="text-[20px] font-semibold tabular-nums text-money sm:text-[22px]">{worth}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[22px] font-semibold tracking-tight sm:text-[26px]">
            Recently added
          </h2>
          <Link href="/assets" className="focus-ring text-[15px] text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {assets.slice(0, 6).map((a) => (
            <AssetCard
              key={a.id}
              asset={a}
              owner={byId.get(a.ownerId)}
              reactions={traction[a.uuid ?? ""]}
            />
          ))}
        </div>
      </section>
    </>
  );
}
