import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCelebrities, getCelebrity } from "@/lib/data";
import { CELEBRITY_CATEGORY_LABEL } from "@/lib/categories";
import { AssetCard } from "@/components/AssetCard";
import { Avatar } from "@/components/Avatar";
import { ImageCredit } from "@/components/ImageCredit";
import { formatValue, formatValueExact, totalValue } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return getCelebrities().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const celeb = getCelebrity(id);
  return { title: celeb?.name ?? "Not found" };
}

export default async function CelebrityPage({ params }: Props) {
  const { id } = await params;
  const celeb = getCelebrity(id);
  if (!celeb) notFound();

  const total = totalValue(celeb.assets);
  const valued = celeb.assets.filter((a) => a.estimatedValueUsd);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-16">
      <Link
        href="/celebrities"
        className="focus-ring text-[13px] text-muted transition hover:text-ink"
      >
        ← Celebrities
      </Link>

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

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl
                       border border-line bg-line sm:grid-cols-4">
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
            <div key={s.label} className="bg-surface px-3 py-5 sm:px-4">
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
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Assets</h2>
        {celeb.assets.length === 0 ? (
          <p className="mt-6 text-[15px] text-muted">No assets catalogued yet.</p>
        ) : (
          <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {celeb.assets.map((a) => (
              <AssetCard key={a.id} asset={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
