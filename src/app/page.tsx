import Link from "next/link";
import { getAssets, getCelebrities, getStats } from "@/lib/data";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { AssetCard } from "@/components/AssetCard";

export default function Home() {
  const stats = getStats();
  const celebrities = getCelebrities();
  const assets = getAssets();
  const byId = new Map(celebrities.map((c) => [c.id, c]));

  const counts = Object.fromEntries(
    CATEGORY_ORDER.map((c) => [c, assets.filter((a) => a.category === c).length]),
  ) as Record<string, number>;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 h-[500px] opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(83,175,209,0.35), transparent)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-24 text-center sm:pt-32">
          <p className="animate-fade-up text-[12px] uppercase tracking-[0.28em] text-ice-300">
            Open source · Community sourced
          </p>

          <h1 className="ice-gradient-text animate-shimmer mt-6 text-5xl font-semibold leading-[1.05] tracking-tightest sm:text-7xl">
            Mapping VIP
            <br />
            premium assets
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-[17px] leading-relaxed text-carbon-300">
            The jets, supercars, watches and yachts behind the world&apos;s
            biggest names — catalogued, sourced, and open to everyone.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/celebrities"
              className="rounded-full bg-white px-6 py-2.5 text-[14px] font-medium text-carbon-950 transition hover:bg-ice-100"
            >
              Explore the database
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-white/15 px-6 py-2.5 text-[14px] text-white transition hover:bg-white/5"
            >
              How it works
            </Link>
          </div>

          {/* Stats */}
          <dl className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            {[
              { label: "Celebrities", value: stats.celebrities },
              { label: "Assets", value: stats.assets },
              { label: "Categories", value: CATEGORY_ORDER.length },
              { label: "Verified", value: stats.verified },
            ].map((s) => (
              <div key={s.label} className="bg-carbon-950 px-4 py-7">
                <dd className="text-3xl font-semibold tracking-tight text-white">
                  {s.value}
                </dd>
                <dt className="mt-1 text-[11px] uppercase tracking-widest text-carbon-500">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORY_ORDER.map((cat) => (
            <Link
              key={cat}
              href={`/assets?category=${cat}`}
              className="card flex flex-col items-center gap-2 p-6 text-center"
            >
              <span className="text-3xl" aria-hidden>
                {CATEGORY_META[cat].icon}
              </span>
              <span className="text-[13px] font-medium text-white">
                {CATEGORY_META[cat].plural}
              </span>
              <span className="text-[11px] text-carbon-500">
                {counts[cat] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Latest */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Recently catalogued
          </h2>
          <Link
            href="/assets"
            className="text-[13px] text-ice-300 transition hover:text-white"
          >
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.slice(0, 6).map((a) => (
            <AssetCard key={a.id} asset={a} owner={byId.get(a.ownerId)} />
          ))}
        </div>
      </section>
    </>
  );
}
