import Link from "next/link";
import type { Asset, Celebrity } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";
import { formatValue } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { AssetImage } from "./AssetImage";

export function AssetCard({
  asset,
  owner,
}: {
  asset: Asset;
  owner?: Celebrity | null;
}) {
  const value = formatValue(asset.estimatedValueUsd);

  return (
    <Link
      href={`/assets/${asset.id}`}
      className="focus-ring group flex h-full flex-col overflow-hidden rounded-2xl
                 bg-elevated transition-shadow duration-200 ease-out-strong
                 hover:shadow-lg hover:shadow-black/5"
    >
      {/* Image fills the top half, edge to edge. */}
      <AssetImage asset={asset} bleed />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[16px] font-semibold leading-snug tracking-tight">
            {asset.name}
          </h3>
          <StatusBadge status={asset.status} />
        </div>

        {owner && <p className="mt-1 text-[14px] text-muted">{owner.name}</p>}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-[12px] uppercase tracking-widest text-faint">
            {CATEGORY_META[asset.category].label}
            {asset.year ? ` · ${asset.year}` : ""}
          </span>
          {value && (
            <span className="text-[17px] font-semibold tabular-nums text-money">{value}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
