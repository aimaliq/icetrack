import Link from "next/link";
import type { Metadata } from "next";
import { getAssets, getCelebrities } from "@/lib/data";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { AssetCard } from "@/components/AssetCard";
import type { AssetCategory } from "@/lib/types";

export const metadata: Metadata = { title: "Assets" };

type Props = { searchParams: Promise<{ category?: string }> };

export default async function AssetsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const active = CATEGORY_ORDER.includes(category as AssetCategory)
    ? (category as AssetCategory)
    : null;

  const celebrities = getCelebrities();
  const byId = new Map(celebrities.map((c) => [c.id, c]));
  const all = getAssets();
  const assets = active ? all.filter((a) => a.category === active) : all;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tightest">Assets</h1>
      <p className="mt-3 text-[15px] text-carbon-400">
        {assets.length} {assets.length === 1 ? "entry" : "entries"}
        {active ? ` in ${CATEGORY_META[active].plural}` : ""}.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/assets"
          className={`rounded-full border px-4 py-1.5 text-[13px] transition ${
            active
              ? "border-white/15 text-carbon-300 hover:bg-white/5"
              : "border-white bg-white text-carbon-950"
          }`}
        >
          All
        </Link>
        {CATEGORY_ORDER.map((cat) => (
          <Link
            key={cat}
            href={`/assets?category=${cat}`}
            className={`rounded-full border px-4 py-1.5 text-[13px] transition ${
              active === cat
                ? "border-white bg-white text-carbon-950"
                : "border-white/15 text-carbon-300 hover:bg-white/5"
            }`}
          >
            {CATEGORY_META[cat].plural}
          </Link>
        ))}
      </div>

      {assets.length === 0 ? (
        <p className="mt-14 text-[15px] text-carbon-400">
          Nothing catalogued in this category yet.
        </p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} owner={byId.get(a.ownerId)} />
          ))}
        </div>
      )}
    </div>
  );
}
