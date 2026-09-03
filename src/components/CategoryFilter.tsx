import Link from "next/link";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import type { Asset, AssetCategory } from "@/lib/types";

const pill =
  "focus-ring shrink-0 rounded-full border px-4 py-2 text-[14px] transition-colors duration-150 ease-out-strong";
const on = "border-ink bg-ink text-surface";
const off = "border-line text-muted hover:bg-sunken";

/**
 * Category pills, filtering by query string so each view is a real URL that
 * can be linked and shared.
 *
 * `assets` decides which pills appear: on a person's page, offering Yachts
 * when they own none would be a dead end. The assets list passes nothing and
 * gets the full set, since a category with no entries there still says
 * something true about the database.
 */
export function CategoryFilter({
  basePath,
  active,
  assets,
}: {
  basePath: string;
  active: AssetCategory | null;
  assets?: Asset[];
}) {
  const present = assets ? new Set(assets.map((a) => a.category)) : null;
  const categories = present
    ? CATEGORY_ORDER.filter((c) => present.has(c))
    : CATEGORY_ORDER;

  // One category is not a choice.
  if (present && categories.length < 2) return null;

  return (
    <div className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
      <Link href={basePath} className={`${pill} ${active ? off : on}`}>
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat}
          href={`${basePath}?category=${cat}`}
          className={`${pill} ${active === cat ? on : off}`}
        >
          {CATEGORY_META[cat].plural}
        </Link>
      ))}
    </div>
  );
}
