import Link from "next/link";
import type { Asset, Celebrity } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { StatusBadge } from "./StatusBadge";

export function AssetCard({
  asset,
  owner,
}: {
  asset: Asset;
  owner?: Celebrity | null;
}) {
  const meta = CATEGORY_META[asset.category];

  return (
    <Link href={`/assets/${asset.id}`} className="card group block p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl" aria-hidden>
          {meta.icon}
        </span>
        <StatusBadge status={asset.status} />
      </div>

      <h3 className="mt-4 text-[15px] font-semibold leading-snug tracking-tight text-white">
        {asset.name}
      </h3>

      {owner && (
        <p className="mt-1 text-[13px] text-carbon-400">{owner.name}</p>
      )}

      <p className="mt-4 text-[11px] uppercase tracking-widest text-carbon-500">
        {meta.label}
        {asset.year ? ` · ${asset.year}` : ""}
      </p>
    </Link>
  );
}
