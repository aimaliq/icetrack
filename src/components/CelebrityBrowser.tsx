"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { CELEBRITY_CATEGORY_LABEL, CATEGORY_META } from "@/lib/categories";
import { formatCount, formatValue, totalValue } from "@/lib/format";
import type { CelebrityWithAssets } from "@/lib/types";

/**
 * Search and sort over the people list.
 *
 * Filtering runs in the browser over the already-loaded set rather than as a
 * query string round trip. The whole list is on the page anyway, so a server
 * hop per keystroke would only add latency to something that should feel
 * instant — and it keeps the list usable while typing.
 */
type Sort = "value" | "views" | "assets" | "recent" | "name";

const SORTS: { key: Sort; label: string }[] = [
  { key: "value", label: "Net worth" },
  { key: "views", label: "Most viewed" },
  { key: "assets", label: "Most assets" },
  { key: "recent", label: "Recently updated" },
  { key: "name", label: "A–Z" },
];

const pill =
  "focus-ring shrink-0 rounded-full border px-4 py-2 text-[14px] transition-colors duration-150 ease-out-strong";
const on = "border-ink bg-ink text-surface";
const off = "border-line text-muted hover:bg-sunken";

/** Fold accents so "Beyoncé" is found by typing "beyonce". */
function normalise(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CelebrityBrowser({
  celebrities,
  views,
}: {
  celebrities: CelebrityWithAssets[];
  views: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("value");

  // Precomputed once: sorting recalculates on every keystroke otherwise.
  const rows = useMemo(
    () =>
      celebrities.map((c) => ({
        celeb: c,
        worth: totalValue(c.assets),
        views: views[c.id] ?? 0,
        // Everything a search should match, flattened to one string.
        haystack: normalise(
          [
            c.name,
            c.realName,
            c.nationality,
            CELEBRITY_CATEGORY_LABEL[c.category],
            ...c.assets.map((a) => `${a.name} ${a.make ?? ""} ${a.model ?? ""}`),
          ]
            .filter(Boolean)
            .join(" "),
        ),
      })),
    [celebrities, views],
  );

  const shown = useMemo(() => {
    const q = normalise(query.trim());
    const matched = q ? rows.filter((r) => r.haystack.includes(q)) : rows;

    return [...matched].sort((a, b) => {
      switch (sort) {
        case "views":
          return b.views - a.views || b.worth - a.worth;
        case "assets":
          return b.celeb.assets.length - a.celeb.assets.length || b.worth - a.worth;
        case "recent":
          return (
            (b.celeb.updatedAt ?? "").localeCompare(a.celeb.updatedAt ?? "") ||
            b.worth - a.worth
          );
        case "name":
          return a.celeb.name.localeCompare(b.celeb.name);
        default:
          return b.worth - a.worth;
      }
    });
  }, [rows, query, sort]);

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:mt-8">
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people, nationalities or assets…"
            aria-label="Search celebrities"
            className="focus-ring w-full rounded-full border border-line bg-elevated
                       py-3 pl-11 pr-11 text-[15px] placeholder:text-faint
                       [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="focus-ring absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2
                         place-items-center rounded-full text-faint
                         transition-colors duration-150 ease-out-strong hover:bg-sunken hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              aria-pressed={sort === s.key}
              className={`${pill} ${sort === s.key ? on : off}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[13px] text-faint" aria-live="polite">
        {shown.length} {shown.length === 1 ? "person" : "people"}
        {query && " matching"}
      </p>

      {shown.length === 0 ? (
        <p className="mt-10 text-[15px] text-muted">
          Nobody matches “{query}”. Try a different name, or{" "}
          <Link href="/celebrities/new" className="text-accent hover:underline">
            add them
          </Link>
          .
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-2">
          {shown.map(({ celeb: c, worth, views: seen }) => {
            const money = formatValue(worth);
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

                  {money && (
                    <span className="shrink-0 text-right text-[20px] font-semibold tabular-nums text-money">
                      {money}
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
                    {/* Only worth showing while it is what the list is ranked
                        by — otherwise it is a number competing with the value. */}
                    {sort === "views" && seen > 0
                      ? `${formatCount(seen)} views`
                      : "View →"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
