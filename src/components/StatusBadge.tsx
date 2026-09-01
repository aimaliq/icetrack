import type { AssetStatus } from "@/lib/types";

const STYLES: Record<AssetStatus, { label: string; className: string }> = {
  verified: {
    label: "Verified",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  reported: {
    label: "Reported",
    className: "border-ice-300/30 bg-ice-300/10 text-ice-200",
  },
  unverified: {
    label: "Unverified",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  former: {
    label: "Former",
    className: "border-white/15 bg-white/5 text-carbon-300",
  },
  disputed: {
    label: "Disputed",
    className: "border-rose-400/30 bg-rose-400/10 text-rose-300",
  },
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${s.className}`}
    >
      {s.label}
    </span>
  );
}
