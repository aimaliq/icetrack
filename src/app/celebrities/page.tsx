import Link from "next/link";
import type { Metadata } from "next";
import { getCelebritiesWithAssets } from "@/lib/data";
import { CELEBRITY_CATEGORY_LABEL, CATEGORY_META } from "@/lib/categories";
import { Avatar } from "@/components/Avatar";
import { formatValue, totalValue } from "@/lib/format";

export const metadata: Metadata = { title: "Celebrities" };

export default function CelebritiesPage() {
  const celebrities = getCelebritiesWithAssets().sort(
    (a, b) => totalValue(b.assets) - totalValue(a.assets),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">
        Celebrities
      </h1>
      <p className="mt-2 text-[14px] text-muted sm:mt-3 sm:text-[15px]">
        {celebrities.length} public figures tracked.
      </p>

      <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {celebrities.map((c) => {
          const worth = formatValue(totalValue(c.assets));
          const cats = [...new Set(c.assets.map((a) => a.category))];

          return (
            <Link
              key={c.id}
              href={`/celebrities/${c.id}`}
              className="card focus-ring flex gap-4 p-4 sm:p-5"
            >
              <Avatar person={c} size="md" />

              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-widest text-accent">
                  {CELEBRITY_CATEGORY_LABEL[c.category]}
                </p>
                <h2 className="mt-1 truncate text-[17px] font-semibold tracking-tight">
                  {c.name}
                </h2>

                <div className="mt-2 flex items-baseline gap-2">
                  {worth && (
                    <span className="text-[15px] font-semibold tabular-nums">
                      {worth}
                    </span>
                  )}
                  <span className="text-[12px] text-faint">
                    {c.assets.length} {c.assets.length === 1 ? "asset" : "assets"}
                  </span>
                </div>

                <div className="mt-2.5 flex gap-1.5" aria-hidden>
                  {cats.map((cat) => (
                    <span key={cat} className="text-base" title={CATEGORY_META[cat].label}>
                      {CATEGORY_META[cat].icon}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
