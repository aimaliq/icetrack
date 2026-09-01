import Link from "next/link";
import { getAssets, getCelebritiesWithAssets, getStats } from "@/lib/data";
import { CATEGORY_ORDER } from "@/lib/categories";
import { CategoryTile } from "@/components/CategoryTile";
import { AssetCard } from "@/components/AssetCard";
import { Avatar } from "@/components/Avatar";
import { formatValue, totalValue } from "@/lib/format";

export default function Home() {
  const stats = getStats();
  const celebrities = getCelebritiesWithAssets();
  const assets = getAssets();
  const byId = new Map(celebrities.map((c) => [c.id, c]));
  const tracked = formatValue(totalValue(assets));

  const counts = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, assets.filter((a) => a.category === c).length]),
  ) as Record<string, number>;

  const top = [...celebrities]
    .sort((a, b) => totalValue(b.assets) - totalValue(a.assets))
    .slice(0, 4);

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pb-14 pt-14 text-center sm:px-6 sm:pb-20 sm:pt-24">
        <p className="animate-fade-up text-[11px] uppercase tracking-[0.24em] text-accent sm:text-[12px]">
          Open source · Community sourced
        </p>

        <h1 className="mt-5 text-[2.5rem] font-semibold leading-[1.05] tracking-tightest sm:mt-6 sm:text-6xl lg:text-7xl">
          Mapping VIP
          <br />
          premium assets
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted sm:mt-7 sm:text-[17px]">
          The jets, supercars, watches and yachts behind the world&apos;s
          biggest names — catalogued, sourced, and open to everyone.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
          <Link
            href="/celebrities"
            className="focus-ring rounded-full bg-ink px-6 py-3 text-[15px] font-medium
                       text-surface transition hover:opacity-90 sm:py-2.5 sm:text-[14px]"
          >
            Explore the database
          </Link>
          <Link
            href="/about"
            className="focus-ring rounded-full border border-line px-6 py-3 text-[15px]
                       transition hover:bg-sunken sm:py-2.5 sm:text-[14px]"
          >
            How it works
          </Link>
        </div>

        <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden
                       rounded-2xl border border-line bg-line sm:mt-20 sm:grid-cols-4">
          {[
            { label: "Celebrities", value: String(stats.celebrities) },
            { label: "Assets", value: String(stats.assets) },
            { label: "Tracked value", value: tracked ?? "—" },
            { label: "Categories", value: String(CATEGORY_ORDER.length) },
          ].map((s) => (
            <div key={s.label} className="bg-surface px-3 py-6 sm:px-4 sm:py-7">
              <dd
                className={`text-[26px] font-semibold tracking-tight tabular-nums sm:text-[32px] ${
                  s.label === "Tracked value" ? "text-money" : ""
                }`}
              >
                {s.value}
              </dd>
              <dt className="mt-1.5 text-[11px] uppercase tracking-widest text-faint sm:text-[12px]">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
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
            Most tracked
          </h2>
          <Link href="/celebrities" className="focus-ring text-[14px] text-accent hover:underline">
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
                           bg-elevated p-4 text-center transition duration-300
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
            Recently catalogued
          </h2>
          <Link href="/assets" className="focus-ring text-[14px] text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {assets.slice(0, 6).map((a) => (
            <AssetCard key={a.id} asset={a} owner={byId.get(a.ownerId)} />
          ))}
        </div>
      </section>
    </>
  );
}
