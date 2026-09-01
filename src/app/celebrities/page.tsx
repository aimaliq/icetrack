import Link from "next/link";
import type { Metadata } from "next";
import { getCelebritiesWithAssets } from "@/lib/db";
import { CELEBRITY_CATEGORY_LABEL, CATEGORY_META } from "@/lib/categories";
import { Avatar } from "@/components/Avatar";
import { formatValue, totalValue } from "@/lib/format";
import { AddButton } from "@/components/AddButton";

export const metadata: Metadata = {
  title: "Celebrities",
  description:
    "Public figures tracked on IceTrack, ranked by the estimated value of their documented luxury assets.",
  alternates: { canonical: "/celebrities" },
  openGraph: {
    title: "Celebrities — IceTrack",
    description:
      "Public figures ranked by the estimated value of their documented luxury assets.",
    url: "/celebrities",
  },
};

export default async function CelebritiesPage() {
  const celebrities = (await getCelebritiesWithAssets()).sort(
    (a, b) => totalValue(b.assets) - totalValue(a.assets),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tightest sm:text-4xl">
          Celebrities
        </h1>
        <AddButton href="/celebrities/new" label="Add a person" />
      </div>

      <div className="mt-8 grid gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-2">
        {celebrities.map((c) => {
          const worth = formatValue(totalValue(c.assets));
          const cats = [...new Set(c.assets.map((a) => a.category))];

          return (
            <Link
              key={c.id}
              href={`/celebrities/${c.id}`}
              className="focus-ring group flex flex-col rounded-2xl bg-elevated p-4
                         transition-shadow duration-200 ease-out-strong hover:shadow-lg hover:shadow-black/5 sm:p-5"
            >
              <div className="flex items-start gap-4">
                <Avatar person={c} size="md" />

                <div className="min-w-0 flex-1">
                  <h2 className="text-[19px] font-semibold leading-tight tracking-tight">
                    {c.name}
                  </h2>
                  <p className="mt-1.5 text-[12px] uppercase tracking-widest text-faint">
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
                  <span className="shrink-0 text-right text-[20px] font-semibold tabular-nums text-money">
                    {worth}
                  </span>
                )}
              </div>

              {c.bio && (
                <p className="mt-3.5 line-clamp-2 text-[14px] leading-relaxed text-muted">
                  {c.bio}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <div className="flex items-center gap-2.5" aria-hidden>
                  {cats.map((cat) => (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={cat}
                      src={CATEGORY_META[cat].image}
                      alt=""
                      title={CATEGORY_META[cat].label}
                      loading="lazy"
                      className="h-5 w-7 object-contain opacity-70"
                    />
                  ))}
                </div>
                <span className="text-[12px] uppercase tracking-widest text-faint">
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
