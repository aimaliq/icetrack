import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCelebrities, getCelebrity } from "@/lib/data";
import { CELEBRITY_CATEGORY_LABEL } from "@/lib/categories";
import { AssetCard } from "@/components/AssetCard";

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

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Link
        href="/celebrities"
        className="text-[13px] text-carbon-400 transition hover:text-white"
      >
        ← Celebrities
      </Link>

      <header className="mt-8 border-b border-white/10 pb-10">
        <p className="text-[12px] uppercase tracking-[0.28em] text-ice-300">
          {CELEBRITY_CATEGORY_LABEL[celeb.category]}
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tightest">
          {celeb.name}
        </h1>

        {celeb.bio && (
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-carbon-300">
            {celeb.bio}
          </p>
        )}

        <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-[13px]">
          {celeb.realName && (
            <div>
              <dt className="text-carbon-500">Full name</dt>
              <dd className="mt-0.5 text-white">{celeb.realName}</dd>
            </div>
          )}
          {celeb.nationality && (
            <div>
              <dt className="text-carbon-500">Nationality</dt>
              <dd className="mt-0.5 text-white">{celeb.nationality}</dd>
            </div>
          )}
          {celeb.bornYear && (
            <div>
              <dt className="text-carbon-500">Born</dt>
              <dd className="mt-0.5 text-white">{celeb.bornYear}</dd>
            </div>
          )}
          <div>
            <dt className="text-carbon-500">Tracked assets</dt>
            <dd className="mt-0.5 text-white">{celeb.assets.length}</dd>
          </div>
        </dl>

        {celeb.wikipedia && (
          <a
            href={celeb.wikipedia}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block text-[13px] text-ice-300 transition hover:text-white"
          >
            Wikipedia ↗
          </a>
        )}
      </header>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold tracking-tight">Assets</h2>
        {celeb.assets.length === 0 ? (
          <p className="mt-6 text-[15px] text-carbon-400">
            No assets catalogued yet.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {celeb.assets.map((a) => (
              <AssetCard key={a.id} asset={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
