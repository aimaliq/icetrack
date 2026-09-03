import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCelebrities, getCelebrity } from "@/lib/db";
import { CELEBRITY_CATEGORY_LABEL, CATEGORY_ORDER } from "@/lib/categories";
import type { AssetCategory } from "@/lib/types";
import { AssetCard } from "@/components/AssetCard";
import { Avatar } from "@/components/Avatar";
import { ImageCredit } from "@/components/ImageCredit";
import { formatValue, formatValueExact, totalValue } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { EditButton } from "@/components/EditButton";
import { AddButton } from "@/components/AddButton";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
};

export async function generateStaticParams() {
  return (await getCelebrities()).map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const celeb = await getCelebrity(id);
  if (!celeb) return { title: "Not found", robots: { index: false } };

  const total = formatValue(totalValue(celeb.assets));
  const count = celeb.assets.length;
  const description =
    `${count} tracked ${count === 1 ? "asset" : "assets"}` +
    (total ? ` worth an estimated ${total}` : "") +
    `. Sourced, publicly reported ownership records for ${celeb.name} on IceTrack.`;

  return {
    title: celeb.name,
    description,
    alternates: { canonical: `/celebrities/${celeb.id}` },
    openGraph: {
      type: "profile",
      title: `${celeb.name} — IceTrack`,
      description,
      url: `/celebrities/${celeb.id}`,
      images: [{ url: `/celebrities/${celeb.id}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${celeb.name} — IceTrack`,
      description,
    },
  };
}

export default async function CelebrityPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { category } = await searchParams;
  const celeb = await getCelebrity(id);
  if (!celeb) notFound();

  const active = CATEGORY_ORDER.includes(category as AssetCategory)
    ? (category as AssetCategory)
    : null;
  const shown = active
    ? celeb.assets.filter((a) => a.category === active)
    : celeb.assets;

  const total = totalValue(celeb.assets);
  const valued = celeb.assets.filter((a) => a.estimatedValueUsd);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: celeb.name,
    ...(celeb.realName ? { alternateName: celeb.realName } : {}),
    ...(celeb.bio ? { description: celeb.bio } : {}),
    ...(celeb.nationality ? { nationality: celeb.nationality } : {}),
    ...(celeb.bornYear ? { birthDate: String(celeb.bornYear) } : {}),
    ...(celeb.imageUrl ? { image: celeb.imageUrl } : {}),
    ...(celeb.wikipedia ? { sameAs: [celeb.wikipedia] } : {}),
    url: `${SITE_URL}/celebrities/${celeb.id}`,
    // Only assets we actually stand behind are asserted as owned.
    owns: celeb.assets
      .filter((a) => a.status === "verified" || a.status === "reported")
      .map((a) => ({
        "@type": "Product",
        name: a.name,
        url: `${SITE_URL}/assets/${a.id}`,
      })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <JsonLd data={jsonLd} />
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/celebrities"
          className="focus-ring text-[15px] text-muted transition-colors duration-150 ease-out-strong hover:text-ink"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/celebrities/${celeb.id}/history`}
            className="focus-ring rounded-full px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out-strong hover:text-ink"
          >
            History
          </Link>
          <EditButton href={`/celebrities/${celeb.id}/edit`} />
        </div>
      </div>

      <header className="mt-6 border-b border-line pb-8 sm:mt-8 sm:pb-10">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:gap-7 sm:text-left">
          <div className="shrink-0">
            <Avatar person={celeb} size="lg" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.24em] text-accent">
              {CELEBRITY_CATEGORY_LABEL[celeb.category]}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tightest sm:text-5xl">
              {celeb.name}
            </h1>

            {celeb.bio && (
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
                {celeb.bio}
              </p>
            )}

            {celeb.wikipedia && (
              <a
                href={celeb.wikipedia}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-4 inline-block text-[13px] text-accent hover:underline"
              >
                Wikipedia ↗
              </a>
            )}
            <ImageCredit credit={celeb.imageCredit} />
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl
                       bg-elevated text-center sm:grid-cols-4">
          {[
            {
              label: "Tracked value",
              value: total > 0 ? formatValue(total)! : "—",
              title: total > 0 ? formatValueExact(total) : undefined,
            },
            { label: "Assets", value: String(celeb.assets.length) },
            { label: "Valued", value: `${valued.length}/${celeb.assets.length}` },
            { label: "Nationality", value: celeb.nationality ?? "—" },
          ].map((s) => (
            <div key={s.label} className="px-3 py-5 sm:px-4">
              <dd
                className={`text-xl font-semibold tracking-tight tabular-nums sm:text-2xl ${
                  s.label === "Tracked value" ? "text-money" : ""
                }`}
                title={s.title}
              >
                {s.value}
              </dd>
              <dt className="mt-1 text-[10px] uppercase tracking-widest text-faint sm:text-[11px]">
                {s.label}
              </dt>
            </div>
          ))}
        </dl>
      </header>

      <section className="mt-10 sm:mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Assets</h2>
          <AddButton
            href={`/assets/new?owner=${celeb.id}`}
            label="Add an asset"
          />
        </div>
        <CategoryFilter
          basePath={`/celebrities/${celeb.id}`}
          active={active}
          assets={celeb.assets}
        />

        {shown.length === 0 ? (
          <p className="mt-6 text-[15px] text-muted">
            {celeb.assets.length === 0
              ? "No assets catalogued yet."
              : "Nothing in this category."}
          </p>
        ) : (
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {shown.map((a) => (
              <AssetCard key={a.id} asset={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
