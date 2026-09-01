import type { ReactNode } from "react";
import type { AssetCategory } from "./types";

const P = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const box = "h-12 w-12";

/** Line-art placeholders shown when an asset has no photograph. */
export const CATEGORY_SILHOUETTE: Record<AssetCategory, ReactNode> = {
  jet: (
    <svg viewBox="0 0 24 24" className={box} {...P} aria-hidden>
      <path d="M2 13.5 11 12l3.5-7.5a1.6 1.6 0 0 1 3 0L21 12l1 1.5-10 2-3 4.5H7l1-4.5-6-1.5Z" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" className={box} {...P} aria-hidden>
      <path d="M3 15.5v-2l1.8-4.2A2 2 0 0 1 6.6 8h10.8a2 2 0 0 1 1.8 1.3L21 13.5v2" />
      <path d="M3 15.5h18M6 9.5h12" />
      <circle cx="7" cy="16" r="1.8" />
      <circle cx="17" cy="16" r="1.8" />
    </svg>
  ),
  watch: (
    <svg viewBox="0 0 24 24" className={box} {...P} aria-hidden>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 9.5V12l1.8 1.2M9.5 7 9 3h6l-.5 4M9.5 17l-.5 4h6l-.5-4" />
    </svg>
  ),
  yacht: (
    <svg viewBox="0 0 24 24" className={box} {...P} aria-hidden>
      <path d="M3 17h18l-2 3H5l-2-3ZM5 14h14l-1.5-3H6.5L5 14ZM12 11V3l6 5h-6" />
    </svg>
  ),
  estate: (
    <svg viewBox="0 0 24 24" className={box} {...P} aria-hidden>
      <path d="M3 20V10l9-6 9 6v10M3 20h18M9 20v-6h6v6" />
    </svg>
  ),
  jewelry: (
    <svg viewBox="0 0 24 24" className={box} {...P} aria-hidden>
      <path d="M6 3h12l3 5-9 13L3 8l3-5ZM3 8h18M9 3l3 5 3-5M12 8v13" />
    </svg>
  ),
};
