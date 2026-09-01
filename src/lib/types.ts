export type AssetCategory =
  | "jet"
  | "car"
  | "accessories"
  | "yacht"
  | "estate";

export type AssetStatus =
  | "verified"
  | "reported"
  | "unverified"
  | "former"
  | "disputed";

export type Confidence = "high" | "medium" | "low";

export type CelebrityCategory =
  | "music"
  | "sports"
  | "film"
  | "business"
  | "fashion"
  | "media";

/**
 * Image credit. Wikimedia Commons licences (CC BY-SA and friends) require
 * attribution, so an image without these fields cannot legally be published.
 */
export interface ImageCredit {
  url: string;
  author?: string;
  license?: string;
  sourcePage?: string;
}

export interface Source {
  title: string;
  url: string;
  publisher?: string;
  retrieved?: string;
}

export interface Asset {
  id: string;
  ownerId: string;
  category: AssetCategory;
  name: string;
  make?: string;
  model?: string;
  year?: number;
  registration?: string;
  estimatedValueUsd?: number;
  acquiredYear?: number;
  status: AssetStatus;
  confidence?: Confidence;
  region?: string;
  summary?: string;
  imageUrl?: string;
  imageCredit?: ImageCredit;
  /** True when the photo shows the model generally, not this exact item. */
  imageIsRepresentative?: boolean;
  sources: Source[];
  updatedAt?: string;
}

export interface Celebrity {
  id: string;
  name: string;
  realName?: string;
  category: CelebrityCategory;
  nationality?: string;
  bornYear?: number;
  bio?: string;
  imageUrl?: string;
  imageCredit?: ImageCredit;
  wikipedia?: string;
  updatedAt?: string;
}

export interface CelebrityWithAssets extends Celebrity {
  assets: Asset[];
}

/** A source still carrying a TODO placeholder is not a real citation. */
export function isPlaceholderSource(source: Source): boolean {
  return source.url.trim().toUpperCase().startsWith("TODO");
}

export function isSourced(asset: Asset): boolean {
  return asset.sources.some((s) => !isPlaceholderSource(s));
}
