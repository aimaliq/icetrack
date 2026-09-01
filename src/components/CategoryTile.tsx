import Link from "next/link";
import type { AssetCategory } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";

export function CategoryTile({
  category,
  count,
}: {
  category: AssetCategory;
  count: number;
}) {
  const meta = CATEGORY_META[category];

  return (
    <Link
      href={`/assets?category=${category}`}
      className="focus-ring group flex flex-col items-center gap-3 rounded-2xl
                 bg-elevated p-5 text-center transition-shadow duration-200 ease-out-strong
                 hover:shadow-lg hover:shadow-black/5 sm:p-6"
    >
      {/* Fixed box with overflow hidden: the artwork varies from wide (jet) to
          tall (watch), and object-contain keeps every one inside the same
          footprint instead of pushing into the label. */}
      <div className="h-20 w-full overflow-hidden sm:h-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-contain transition duration-500
                     group-hover:scale-105"
        />
      </div>

      <span className="text-[15px] font-medium sm:text-[16px]">{meta.plural}</span>
      <span className="text-[13px] tabular-nums text-faint sm:text-[14px]">
        {count}
      </span>
    </Link>
  );
}
