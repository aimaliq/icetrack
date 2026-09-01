import type { AssetStatus } from "@/lib/types";

const STYLES: Record<AssetStatus, string> = {
  verified:
    "border-emerald-600/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  reported: "border-accent/30 bg-accent-soft text-accent",
  unverified:
    "border-amber-600/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  former: "border-line bg-sunken text-muted",
  disputed:
    "border-rose-600/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

const LABELS: Record<AssetStatus, string> = {
  verified: "Verified",
  reported: "Reported",
  unverified: "Unverified",
  former: "Former",
  disputed: "Disputed",
};

export function StatusBadge({ status }: { status: AssetStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5
                  text-[11px] font-medium tracking-wide ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
