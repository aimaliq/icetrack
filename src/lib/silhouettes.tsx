import type { ReactNode } from "react";
import type { AssetCategory } from "./types";

const P = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

/**
 * Line-art marks for each category. Monochrome and stroke-based so they take
 * the theme's colour and stay crisp at any size — sized by the caller.
 */
export const CATEGORY_SILHOUETTE: Record<AssetCategory, ReactNode> = {
  jet: (
    <svg viewBox="0 0 48 48" className="h-full w-full" {...P} aria-hidden>
      <path d="M3 27.5 20 24l7.5-15.5a3 3 0 0 1 5.4 0L40.5 24 45 27.5l-19 4.5-6 9h-4.5l2-9L3 27.5Z" />
      <path d="M20 24h13" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 48 48" className="h-full w-full" {...P} aria-hidden>
      <path d="M5 31v-4.5l3.6-8.4A4 4 0 0 1 12.3 16h23.4a4 4 0 0 1 3.7 2.1L43 26.5V31" />
      <path d="M5 31h38M11 19h26M5 31v3h5v-3M43 31v3h-5v-3" />
      <circle cx="14" cy="31" r="3.6" />
      <circle cx="34" cy="31" r="3.6" />
    </svg>
  ),
  watch: (
    <svg viewBox="0 0 48 48" className="h-full w-full" {...P} aria-hidden>
      <circle cx="24" cy="24" r="10" />
      <path d="M24 19v5l3.5 2.4M18.5 14.5 17.5 5h13l-1 9.5M18.5 33.5l-1 9.5h13l-1-9.5M34 21h2.5v6H34" />
    </svg>
  ),
  yacht: (
    <svg viewBox="0 0 48 48" className="h-full w-full" {...P} aria-hidden>
      <path d="M4 34h40l-4.5 7h-31L4 34ZM9 28h30l-3-6H12l-3 6ZM24 22V5l12 10H24" />
    </svg>
  ),
  estate: (
    <svg viewBox="0 0 48 48" className="h-full w-full" {...P} aria-hidden>
      <path d="M4 42V20L24 6l20 14v22M4 42h40" />
      <path d="M17 42V29h14v13M11 24v5M37 24v5" />
    </svg>
  ),
  jewelry: (
    <svg viewBox="0 0 48 48" className="h-full w-full" {...P} aria-hidden>
      <path d="M13 7h22l8 12-19 24L5 19 13 7ZM5 19h38M18 7l6 12 6-12M24 19v24" />
    </svg>
  ),
};
