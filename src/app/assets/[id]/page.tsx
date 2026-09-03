import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAsset, getAssets, getReactions } from "@/lib/db";
import { ViewCounter } from "@/components/ViewCounter";
import { CATEGORY_META } from "@/lib/categories";
import { readSpecs } from "@/lib/specs";
import { LiveTrackEmbed, isTrackable } from "@/components/LiveTrackEmbed";
import { Reactions } from "@/components/Reactions";
import { StatusBadge } from "@/components/StatusBadge";
import { AssetImage } from "@/components/AssetImage";
import { Avatar } from "@/components/Avatar";
import { ImageCredit } from "@/components/ImageCredit";
import { isPlaceholderSource } from "@/lib/types";
import { formatValueExact } from "@/lib/format";
import { JsonLd } from "@/components/JsonLd";
import { EditButton } from "@/components/EditButton";
import { SITE_URL } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return (await getAssets()).map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = await getAsset(id);
  if (!found) return { title: "Not found", robots: { index: false } };

  const { asset, owner } = found;
  const value = asset.estimatedValueUsd
    ? ` Estimated at ${formatValueExact(asset.estimatedValueUsd)}.`
    : "";

  // The status is stated up front: an unverified entry must not read as a
  // confirmed claim in a search result or a social card.
  const description =
    `${CATEGORY_META[asset.category].label} ${
      owner ? `attributed to ${owner.name}` : "entry"
    }, listed as ${asset.status} on IceTrack.${value}`;

  return {
    title: owner ? `${asset.name} — ${owner.name}` : asset.name,
    description,
    alternates: { canonical: `/assets/${asset.id}` },
    openGraph: {
      type: "article",
      title: `${asset.name}${owner ? ` — ${owner.name}` : ""}`,
      description,
      url: `/assets/${asset.id}`,
      images: [{ url: `/assets/${asset.id}/opengraph-image` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${asset.name}${owner ? ` — ${owner.name}` : ""}`,
      description,
    },
  };
}

export default async function AssetPage({ params }: Props) {
  const { id } = await params;
  const found = await getAsset(id);
  if (!found) notFound();

  const { asset, owner } = found;
  const meta = CATEGORY_META[asset.category];
  const realSources = asset.sources.filter((s) => !isPlaceholderSource(s));

  // What every asset has, whatever it is.
  const general = [
    ["Category", meta.label],
    ["Make", asset.make],
    ["Model", asset.model],
    ["Year", asset.year],
    ["Registration", asset.registration],
    ["Acquired", asset.acquiredYear],
    ["Region", asset.region],
    ["Confidence", asset.confidence],
  ].filter(([, v]) => v !== undefined && v !== null && v !== "") as [
    string,
    string | number,
  ][];

  // What only this kind of asset has: passengers and range for a jet, cabins
  // and length for a yacht, floor area and bedrooms for a house.
  const specs = readSpecs(asset.category, asset.specs);

  // Aircraft that broadcast a transponder address can be shown on a map.
  const icao24 = String(asset.specs?.icao24 ?? "").trim();
  const trackable = isTrackable(asset.category, icao24);
  const reactions = await getReactions(asset.uuid ?? "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: asset.name,
    category: meta.label,
    ...(asset.make ? { brand: { "@type": "Brand", name: asset.make } } : {}),
    ...(asset.model ? { model: asset.model } : {}),
    ...(asset.summary ? { description: asset.summary } : {}),
    ...(asset.imageUrl ? { image: asset.imageUrl } : {}),
    url: `${SITE_URL}/assets/${asset.id}`,
    ...(asset.estimatedValueUsd
      ? {
          offers: {
            "@type": "Offer",
            price: asset.estimatedValueUsd,
            priceCurrency: "USD",
            availability: "https://schema.org/OutOfStock",
          },
        }
      : {}),
    ...(owner && (asset.status === "verified" || asset.status === "reported")
      ? {
          owner: {
            "@type": "Person",
            name: owner.name,
            url: `${SITE_URL}/celebrities/${owner.id}`,
          },
        }
      : {}),
    ...(realSources.length > 0
      ? {
          citation: realSources.map((src) => ({
            "@type": "CreativeWork",
            name: src.title,
            url: src.url,
            ...(src.publisher
              ? { publisher: { "@type": "Organization", name: src.publisher } }
              : {}),
          })),
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 pb-8 pt-5 sm:px-6 sm:pb-16 sm:pt-6">
      <JsonLd data={jsonLd} />
      <ViewCounter table="assets" slug={asset.id} />
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/assets"
          className="focus-ring text-[13px] text-muted transition-colors duration-150 ease-out-strong hover:text-ink"
        >
          ← Assets
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/assets/${asset.id}/history`}
            className="focus-ring rounded-full px-3 py-1.5 text-[13px] text-muted transition-colors duration-150 ease-out-strong hover:text-ink"
          >
            History
          </Link>
          <EditButton href={`/assets/${asset.id}/edit`} />
        </div>
      </div>

      <header className="mt-6 sm:mt-8">
        {/* Name and value first: the photo is usually of the model rather than
            this particular item, so it illustrates the entry instead of
            identifying it. */}
        <div className="flex flex-wrap items-center gap-2.5">
          <StatusBadge status={asset.status} />
          <span className="text-[11px] uppercase tracking-widest text-faint">
            {meta.label}
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tightest sm:text-4xl">
          {asset.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
          {asset.estimatedValueUsd ? (
            <p className="text-[26px] font-semibold tabular-nums text-money sm:text-[32px]">
              {formatValueExact(asset.estimatedValueUsd)}
              <span className="ml-2 align-middle text-[11px] font-normal uppercase tracking-widest text-faint">
                est.
              </span>
            </p>
          ) : (
            <span />
          )}

          <Reactions slug={asset.id} initial={reactions} />
        </div>

        <div className="mt-6">
          <AssetImage asset={asset} size="lg" />
          <ImageCredit credit={asset.imageCredit} />
        </div>

        {owner && (
          <Link
            href={`/celebrities/${owner.id}`}
            className="focus-ring mt-5 flex items-center gap-3 rounded-2xl bg-elevated
                       p-3 transition-shadow duration-200 ease-out-strong hover:shadow-lg hover:shadow-black/5"
          >
            <Avatar person={owner} size="sm" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-faint">Owner</p>
              <p className="truncate text-[15px] font-medium">{owner.name}</p>
            </div>
            <span className="ml-auto text-muted" aria-hidden>→</span>
          </Link>
        )}

        {asset.summary && (
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-muted sm:text-[16px]">
            {asset.summary}
          </p>
        )}

      </header>

      {realSources.length === 0 && (
        <div className="mt-8 rounded-2xl border border-amber-600/25 bg-amber-500/[0.08] p-4 sm:mt-10 sm:p-5">
          <p className="text-[13px] font-medium text-amber-700 dark:text-amber-300">
            This entry has no verified source yet.
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-amber-800/75 dark:text-amber-200/70">
            It is published as a research placeholder and should not be treated
            as fact. The value shown is an unconfirmed press estimate.
          </p>
        </div>
      )}

      {specs.length > 0 && (
        <section className="mt-10 sm:mt-12">
          <h2 className="text-[11px] uppercase tracking-[0.24em] text-faint">
            {meta.label} details
          </h2>
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-3">
            {specs.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl bg-elevated px-4 py-4 text-center"
              >
                <dd className="text-[18px] font-semibold tracking-tight tabular-nums">
                  {s.value}
                </dd>
                <dt className="mt-0.5 text-[11px] uppercase tracking-widest text-faint">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </section>
      )}

      {general.length > 0 && (
        <section className="mt-10 sm:mt-12">
          <h2 className="text-[11px] uppercase tracking-[0.24em] text-faint">
            Record
          </h2>
          <dl className="mt-4 divide-y divide-line border-y border-line sm:mt-5">
            {general.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 py-3.5">
                <dt className="text-[14px] text-muted">{label}</dt>
                <dd className="text-right text-[14px]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {trackable && (
        <section className="mt-10 sm:mt-12">
          <h2 className="text-[11px] uppercase tracking-[0.24em] text-faint">
            Live tracking
          </h2>
          <div className="mt-4 sm:mt-5">
            <LiveTrackEmbed icao24={icao24} />
          </div>
        </section>
      )}

      <section className="mt-10 sm:mt-12">
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-faint">Sources</h2>
        <ul className="mt-4 space-y-3 sm:mt-5">
          {asset.sources.map((s, i) => {
            const placeholder = isPlaceholderSource(s);
            return (
              <li key={i} className="rounded-xl border border-line bg-elevated p-4">
                {placeholder ? (
                  <>
                    <p className="text-[14px] text-muted">{s.title}</p>
                    <p className="mt-1 break-all font-mono text-[12px] text-faint">
                      {s.url}
                    </p>
                  </>
                ) : (
                  <a href={s.url} target="_blank" rel="noreferrer" className="focus-ring group block">
                    <p className="text-[14px] group-hover:text-accent">{s.title} ↗</p>
                    <p className="mt-1 text-[12px] text-faint">
                      {[s.publisher, s.retrieved].filter(Boolean).join(" · ")}
                    </p>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {asset.updatedAt && (
        <p className="mt-10 text-[12px] text-faint sm:mt-12">
          Last updated {asset.updatedAt}
        </p>
      )}
    </div>
  );
}
