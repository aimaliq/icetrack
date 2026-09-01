export type AssetCategory =
  | "jet"
  | "car"
  | "watch"
  | "yacht"
  | "estate"
  | "jewelry";

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
