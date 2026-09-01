import type { AssetCategory, CelebrityCategory } from "./types";

export const CATEGORY_META: Record<
  AssetCategory,
  { label: string; plural: string; image: string }
> = {
  jet: { label: "Private jet", plural: "Jets", image: "/categories/jet.webp" },
  car: { label: "Supercar", plural: "Cars", image: "/categories/car.webp" },
  yacht: { label: "Yacht", plural: "Yachts", image: "/categories/yacht.webp" },
  estate: { label: "Estate", plural: "Estates", image: "/categories/house.webp" },
  accessories: {
    label: "Accessory",
    plural: "Accessories",
    image: "/categories/accessories.webp",
  },
};

export const CATEGORY_ORDER: AssetCategory[] = [
  "jet",
  "car",
  "yacht",
  "estate",
  "accessories",
];

export const CELEBRITY_CATEGORY_LABEL: Record<CelebrityCategory, string> = {
  music: "Music",
  sports: "Sports",
  film: "Film & TV",
  business: "Business",
  fashion: "Fashion",
  media: "Media",
};
