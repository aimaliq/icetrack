import Link from "next/link";
import type { Metadata } from "next";
import { getAssets, getCelebrities } from "@/lib/db";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { AssetCard } from "@/components/AssetCard";
import type { AssetCategory } from "@/lib/types";
import { AddButton } from "@/components/AddButton";

export const metadata: Metadata = {
  title: "Assets",
  description:
    "Every tracked asset on IceTrack — private jets, supercars, yachts, estates and accessories — each with its ownership status and sources.",
  alternates: { canonical: "/assets" },
  openGraph: {
    title: "Assets — IceTrack",
    description:
      "Private jets, supercars, yachts, estates and accessories, each with its ownership status and sources.",
    url: "/assets",
  },
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function AssetsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const active = CATEGORY_ORDER.includes(category as AssetCategory)
    ? (category as AssetCategory)
    : null;

  const celebrities = await getCelebrities();
  const byId = new Map(celebrities.map((c) => [c.id, c]));
  const all = await getAssets();
  const assets = active ? all.filter((a) => a.category === active) : all;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">Assets</h1>
        <AddButton href="/assets/new" label="Add an asset" />
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:mt-8 sm:flex-wrap sm:overflow-visible">
        <Link
          href="/assets"
          className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-[14px] transition ${
            active
              ? "border-line text-muted hover:bg-sunken"
              : "border-ink bg-ink text-surface"
          }`}
        >
          All
        </Link>
        {CATEGORY_ORDER.map((cat) => (
          <Link
            key={cat}
            href={`/assets?category=${cat}`}
            className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-[14px] transition ${
              active === cat
                ? "border-ink bg-ink text-surface"
                : "border-line text-muted hover:bg-sunken"
            }`}
          >
            {CATEGORY_META[cat].plural}
          </Link>
        ))}
      </div>

      {assets.length === 0 ? (
        <p className="mt-14 text-[15px] text-muted">
          Nothing catalogued in this category yet.
        </p>
      ) : (
        <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} owner={byId.get(a.ownerId)} />
          ))}
        </div>
      )}
    </div>
  );
}
