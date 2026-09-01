import Link from "next/link";
import type { AssetCategory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { CATEGORY_SILHOUETTE } from "@/lib/silhouettes";

export function CategoryTile({
  category,
  count,
}: {
  category: AssetCategory;
  count: number;
}) {
  return (
    <Link
      href={`/assets?category=${category}`}
      className="focus-ring group flex flex-col items-center gap-3 rounded-2xl
                 bg-elevated p-5 text-center transition duration-300
                 hover:shadow-lg hover:shadow-black/5 sm:p-6"
    >
      <span
        className="h-12 w-12 text-faint transition duration-300
                   group-hover:text-accent sm:h-14 sm:w-14"
        aria-hidden
      >
        {CATEGORY_SILHOUETTE[category]}
      </span>

      <span className="text-[15px] font-medium sm:text-[16px]">
        {CATEGORY_META[category].plural}
      </span>
      <span className="text-[13px] tabular-nums text-faint sm:text-[14px]">
        {count}
      </span>
    </Link>
  );
}
