/**
 * Data access against Supabase.
 *
 * The database is the source of truth; `data/` is kept only as the historical
 * seed. Rows come back in snake_case and are mapped to the camelCase types the
 * UI already speaks, so pages did not have to change when the store did.
 */
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { Asset, Celebrity, CelebrityWithAssets } from "./types";

/**
 * Reads here are public data. Prefer the cookie-backed client so a signed-in
 * user's session applies, but fall back to the anon client in build-time
 * contexts (sitemap, generateStaticParams, OG images) where `cookies()` throws.
 */
async function reader() {
  try {
    await cookies();
    return await createClient();
  } catch {
    return createPublicClient();
  }
}

/** Shape of a celebrities row. */
type CelebRow = {
  id: string;
  slug: string;
  name: string;
  real_name: string | null;
  category: Celebrity["category"];
  nationality: string | null;
  born_year: number | null;
  bio: string | null;
  image_url: string | null;
  image_credit: Celebrity["imageCredit"] | null;
  wikipedia: string | null;
  updated_at: string | null;
};

/** Shape of an assets row. */
type AssetRow = {
  id: string;
  slug: string;
  celebrity_id: string;
  category: Asset["category"];
  name: string;
  make: string | null;
  model: string | null;
  year: number | null;
  registration: string | null;
  estimated_value_usd: number | null;
  acquired_year: number | null;
  status: Asset["status"];
  confidence: Asset["confidence"] | null;
  region: string | null;
  summary: string | null;
  image_url: string | null;
  image_credit: Asset["imageCredit"] | null;
  image_is_representative: boolean | null;
  sources: Asset["sources"] | null;
  updated_at: string | null;
};

const CELEB_COLS =
  "id, slug, name, real_name, category, nationality, born_year, bio, image_url, image_credit, wikipedia, updated_at";

const ASSET_COLS =
  "id, slug, celebrity_id, category, name, make, model, year, registration, estimated_value_usd, acquired_year, status, confidence, region, summary, image_url, image_credit, image_is_representative, sources, updated_at";

/** The UI keys everything off the slug, so `id` carries it. `uuid` is the
 *  database key, needed for edits and revision history. */
function toCelebrity(r: CelebRow): Celebrity & { uuid: string } {
  return {
    uuid: r.id,
    id: r.slug,
    name: r.name,
    realName: r.real_name ?? undefined,
    category: r.category,
    nationality: r.nationality ?? undefined,
    bornYear: r.born_year ?? undefined,
    bio: r.bio ?? undefined,
    imageUrl: r.image_url ?? undefined,
    imageCredit: r.image_credit ?? undefined,
    wikipedia: r.wikipedia ?? undefined,
    updatedAt: r.updated_at ?? undefined,
  };
}

function toAsset(r: AssetRow, ownerSlug: string): Asset & { uuid: string } {
  return {
    uuid: r.id,
    id: r.slug,
    ownerId: ownerSlug,
    category: r.category,
    name: r.name,
    make: r.make ?? undefined,
    model: r.model ?? undefined,
    year: r.year ?? undefined,
    registration: r.registration ?? undefined,
    estimatedValueUsd: r.estimated_value_usd ?? undefined,
    acquiredYear: r.acquired_year ?? undefined,
    status: r.status,
    confidence: r.confidence ?? undefined,
    region: r.region ?? undefined,
    summary: r.summary ?? undefined,
    imageUrl: r.image_url ?? undefined,
    imageCredit: r.image_credit ?? undefined,
    imageIsRepresentative: r.image_is_representative ?? undefined,
    sources: r.sources ?? [],
    updatedAt: r.updated_at ?? undefined,
  };
}

export async function getCelebrities(): Promise<Celebrity[]> {
  const db = await reader();
  const { data, error } = await db
    .from("celebrities")
    .select(CELEB_COLS)
    .order("name");
  if (error) throw new Error(`Failed to load celebrities: ${error.message}`);
  return (data as CelebRow[]).map(toCelebrity);
}

export async function getAssets(): Promise<Asset[]> {
  const db = await reader();
  const [{ data: assets, error }, celebs] = await Promise.all([
    db.from("assets").select(ASSET_COLS).order("name"),
    getCelebrities(),
  ]);
  if (error) throw new Error(`Failed to load assets: ${error.message}`);

  // Assets reference their owner by uuid; the UI needs the slug.
  const slugByUuid = new Map(
    (celebs as (Celebrity & { uuid?: string })[]).map((c) => [c.uuid!, c.id]),
  );
  return (assets as AssetRow[]).map((r) =>
    toAsset(r, slugByUuid.get(r.celebrity_id) ?? ""),
  );
}

export async function getCelebrity(
  slug: string,
): Promise<CelebrityWithAssets | null> {
  const db = await reader();
  const { data, error } = await db
    .from("celebrities")
    .select(`${CELEB_COLS}, assets(${ASSET_COLS})`)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load celebrity: ${error.message}`);
  if (!data) return null;

  const { assets = [], ...row } = data as CelebRow & { assets: AssetRow[] };
  const celeb = toCelebrity(row);
  return {
    ...celeb,
    assets: assets
      .map((a) => toAsset(a, celeb.id))
      .sort((a, b) => a.name.localeCompare(b.name)),
  };
}

export async function getAsset(
  slug: string,
): Promise<{ asset: Asset; owner: Celebrity | null } | null> {
  const db = await reader();
  const { data, error } = await db
    .from("assets")
    .select(`${ASSET_COLS}, celebrities(${CELEB_COLS})`)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load asset: ${error.message}`);
  if (!data) return null;

  // The client types an embedded to-one relation as an array.
  const { celebrities, ...row } = data as unknown as AssetRow & {
    celebrities: CelebRow | CelebRow[] | null;
  };
  const ownerRow = Array.isArray(celebrities) ? celebrities[0] : celebrities;
  const owner = ownerRow ? toCelebrity(ownerRow) : null;
  return { asset: toAsset(row, owner?.id ?? ""), owner };
}

export async function getCelebritiesWithAssets(): Promise<CelebrityWithAssets[]> {
  const db = await reader();
  const { data, error } = await db
    .from("celebrities")
    .select(`${CELEB_COLS}, assets(${ASSET_COLS})`)
    .order("name");
  if (error) throw new Error(`Failed to load celebrities: ${error.message}`);

  return (data as (CelebRow & { assets: AssetRow[] })[]).map((row) => {
    const { assets = [], ...celebRow } = row;
    const celeb = toCelebrity(celebRow);
    return { ...celeb, assets: assets.map((a) => toAsset(a, celeb.id)) };
  });
}

export async function getStats() {
  const celebs = await getCelebritiesWithAssets();
  const assets = celebs.flatMap((c) => c.assets);
  return {
    celebrities: celebs.length,
    assets: assets.length,
    verified: assets.filter((a) => a.status === "verified").length,
    categories: new Set(assets.map((a) => a.category)).size,
  };
}

/** Map a slug to its database uuid — revisions key off the uuid, not the slug. */
export async function getRecordId(
  table: "celebrities" | "assets",
  slug: string,
): Promise<string | null> {
  const db = await reader();
  const { data } = await db.from(table).select("id").eq("slug", slug).maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}
