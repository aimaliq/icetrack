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
    <Link href={`/assets/${asset.id}`} className="card focus-ring block p-3 sm:p-4">
      <AssetImage asset={asset} />

      <div className="mt-3.5 flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight">
          {asset.name}
        </h3>
        <StatusBadge status={asset.status} />
      </div>

      {owner && <p className="mt-1 text-[13px] text-muted">{owner.name}</p>}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-faint">
          {CATEGORY_META[asset.category].label}
          {asset.year ? ` · ${asset.year}` : ""}
        </span>
        {value && (
          <span className="text-[13px] font-semibold tabular-nums">{value}</span>
        )}
      </div>
    </Link>
  );
}
