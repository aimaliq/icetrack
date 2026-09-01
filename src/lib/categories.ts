import type { AssetCategory, CelebrityCategory } from "./types";

export const CATEGORY_META: Record<
  AssetCategory,
  { label: string; plural: string; icon: string }
> = {
  jet: { label: "Private jet", plural: "Jets", icon: "✈️" },
  car: { label: "Supercar", plural: "Cars", icon: "🏎️" },
  watch: { label: "Watch", plural: "Watches", icon: "⌚" },
  yacht: { label: "Yacht", plural: "Yachts", icon: "🛥️" },
  estate: { label: "Estate", plural: "Estates", icon: "🏛️" },
  jewelry: { label: "Jewelry", plural: "Jewelry", icon: "💎" },
};

export const CATEGORY_ORDER: AssetCategory[] = [
  "jet",
  "car",
  "watch",
  "yacht",
  "estate",
  "jewelry",
];

export const CELEBRITY_CATEGORY_LABEL: Record<CelebrityCategory, string> = {
  music: "Music",
  sports: "Sports",
  film: "Film & TV",
  business: "Business",
  fashion: "Fashion",
  media: "Media",
};
