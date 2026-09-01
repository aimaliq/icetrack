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
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        {celebrities.length} public figures on file. Each owns one or more
        luxury assets catalogued from public sources — click through for the
        full breakdown.
      </p>

      <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-2">
        {celebrities.map((c) => {
          const worth = formatValue(totalValue(c.assets));
          const cats = [...new Set(c.assets.map((a) => a.category))];

          return (
            <Link
              key={c.id}
              href={`/celebrities/${c.id}`}
              className="card focus-ring flex flex-col p-4 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <Avatar person={c} size="md" />

                <div className="min-w-0 flex-1">
                  <h2 className="text-[19px] font-semibold leading-tight tracking-tight">
                    {c.name}
                  </h2>
                  <p className="mt-1 text-[11px] uppercase tracking-widest text-faint">
                    {CELEBRITY_CATEGORY_LABEL[c.category]}
                    <span aria-hidden> · </span>
                    {c.assets.length}{" "}
                    {c.assets.length === 1 ? "asset" : "assets"}
                    {c.nationality && (
                      <>
                        <span aria-hidden> · </span>
                        {c.nationality}
                      </>
                    )}
                  </p>
                </div>

                {worth && (
                  <span className="shrink-0 text-right text-[15px] font-semibold tabular-nums">
                    {worth}
                  </span>
                )}
              </div>

              {c.bio && (
                <p className="mt-3.5 line-clamp-2 text-[13px] leading-relaxed text-muted">
                  {c.bio}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <div className="flex gap-1.5" aria-hidden>
                  {cats.map((cat) => (
                    <span
                      key={cat}
                      className="text-[15px]"
                      title={CATEGORY_META[cat].label}
                    >
                      {CATEGORY_META[cat].icon}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] uppercase tracking-widest text-faint">
                  View →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
