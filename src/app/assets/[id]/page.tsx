import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAsset, getAssets } from "@/lib/data";
import { CATEGORY_META } from "@/lib/categories";
import { StatusBadge } from "@/components/StatusBadge";
import { isPlaceholderSource } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getAssets().map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = getAsset(id);
  return { title: found?.asset.name ?? "Not found" };
}

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default async function AssetPage({ params }: Props) {
  const { id } = await params;
  const found = getAsset(id);
  if (!found) notFound();

  const { asset, owner } = found;
  const meta = CATEGORY_META[asset.category];
  const realSources = asset.sources.filter((s) => !isPlaceholderSource(s));

  const specs = [
    ["Category", meta.label],
    ["Make", asset.make],
    ["Model", asset.model],
    ["Year", asset.year],
    ["Registration", asset.registration],
    ["Acquired", asset.acquiredYear],
    ["Region", asset.region],
    [
      "Est. value",
      asset.estimatedValueUsd ? USD.format(asset.estimatedValueUsd) : undefined,
    ],
    ["Confidence", asset.confidence],
  ].filter(([, v]) => v !== undefined && v !== null && v !== "") as [
    string,
    string | number,
  ][];

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <Link
        href="/assets"
        className="text-[13px] text-carbon-400 transition hover:text-white"
      >
        ← Assets
      </Link>

      <header className="mt-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {meta.icon}
          </span>
          <StatusBadge status={asset.status} />
        </div>

        <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tightest">
          {asset.name}
        </h1>

        {owner && (
          <Link
            href={`/celebrities/${owner.id}`}
            className="mt-3 inline-block text-[15px] text-ice-300 transition hover:text-white"
          >
            {owner.name} →
          </Link>
        )}

        {asset.summary && (
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-carbon-300">
            {asset.summary}
          </p>
        )}
      </header>

      {realSources.length === 0 && (
        <div className="mt-10 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-5">
          <p className="text-[13px] font-medium text-amber-300">
            This entry has no verified source yet.
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-amber-200/70">
            It is published as a research placeholder and should not be treated
            as fact. Help us source it — see the contribution guide.
          </p>
        </div>
      )}

      {specs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-[11px] uppercase tracking-[0.24em] text-carbon-500">
            Specifications
          </h2>
          <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 py-3.5">
                <dt className="text-[14px] text-carbon-400">{label}</dt>
                <dd className="text-right text-[14px] text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-12">
        <h2 className="text-[11px] uppercase tracking-[0.24em] text-carbon-500">
          Sources
        </h2>
        <ul className="mt-5 space-y-3">
          {asset.sources.map((s, i) => {
            const placeholder = isPlaceholderSource(s);
            return (
              <li
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                {placeholder ? (
                  <>
                    <p className="text-[14px] text-carbon-400">{s.title}</p>
                    <p className="mt-1 font-mono text-[12px] text-carbon-500">
                      {s.url}
                    </p>
                  </>
                ) : (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group"
                  >
                    <p className="text-[14px] text-white group-hover:text-ice-300">
                      {s.title} ↗
                    </p>
                    <p className="mt-1 text-[12px] text-carbon-500">
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
        <p className="mt-12 text-[12px] text-carbon-500">
          Last updated {asset.updatedAt}
        </p>
      )}
    </div>
  );
}
