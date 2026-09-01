import Link from "next/link";
import type { Metadata } from "next";
import { getCelebritiesWithAssets } from "@/lib/data";
import { CELEBRITY_CATEGORY_LABEL, CATEGORY_META } from "@/lib/categories";

export const metadata: Metadata = { title: "Celebrities" };

export default function CelebritiesPage() {
  const celebrities = getCelebritiesWithAssets();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tightest">Celebrities</h1>
      <p className="mt-3 text-[15px] text-carbon-400">
        {celebrities.length} public figures tracked.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {celebrities.map((c) => (
          <Link
            key={c.id}
            href={`/celebrities/${c.id}`}
            className="card block p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-ice-300">
                {CELEBRITY_CATEGORY_LABEL[c.category]}
              </span>
              <span className="text-[12px] text-carbon-500">
                {c.assets.length} {c.assets.length === 1 ? "asset" : "assets"}
              </span>
            </div>

            <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">
              {c.name}
            </h2>
            {c.nationality && (
              <p className="mt-1 text-[13px] text-carbon-400">{c.nationality}</p>
            )}

            <div className="mt-5 flex gap-1.5">
              {[...new Set(c.assets.map((a) => a.category))].map((cat) => (
                <span key={cat} className="text-lg" title={CATEGORY_META[cat].label}>
                  {CATEGORY_META[cat].icon}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
