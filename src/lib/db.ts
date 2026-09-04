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
import type { Asset, Celebrity, CelebrityWithAssets, GalleryImage } from "./types";

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
  specs: Asset["specs"] | null;
  gallery: GalleryImage[] | null;
  updated_at: string | null;
};

const CELEB_COLS =
  "id, slug, name, real_name, category, nationality, born_year, bio, image_url, image_credit, wikipedia, updated_at";

const ASSET_COLS =
  "id, slug, celebrity_id, category, name, make, model, year, registration, estimated_value_usd, acquired_year, status, confidence, region, summary, image_url, image_credit, image_is_representative, sources, specs, gallery, updated_at";

/** ASSET_COLS before migration 0015 added `gallery`. */
const ASSET_COLS_LEGACY = ASSET_COLS.replace(", gallery", "");

/**
 * Run an asset query, falling back to the pre-gallery column list when the
 * migration has not been applied yet. Without this, deploying ahead of the
 * SQL would take down every asset read at once — the failure mode that
 * matters on a site that auto-deploys from main.
 */
async function withGalleryFallback<T>(
  // PromiseLike, not Promise: the supabase builder is a lazy thenable.
  run: (cols: string) => PromiseLike<{ data: T; error: { message: string } | null }>,
): Promise<{ data: T; error: { message: string } | null }> {
  const first = await run(ASSET_COLS);
  if (first.error && first.error.message.includes("gallery")) {
    return run(ASSET_COLS_LEGACY);
  }
  return first;
}

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
    specs: r.specs ?? undefined,
    gallery: r.gallery ?? undefined,
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
    withGalleryFallback((cols) => db.from("assets").select(cols).order("name")),
    getCelebrities(),
  ]);
  if (error) throw new Error(`Failed to load assets: ${error.message}`);

  // Assets reference their owner by uuid; the UI needs the slug.
  const slugByUuid = new Map(
    (celebs as (Celebrity & { uuid?: string })[]).map((c) => [c.uuid!, c.id]),
  );
  return (assets as unknown as AssetRow[]).map((r) =>
    toAsset(r, slugByUuid.get(r.celebrity_id) ?? ""),
  );
}

export async function getCelebrity(
  slug: string,
): Promise<CelebrityWithAssets | null> {
  const db = await reader();
  const { data, error } = await withGalleryFallback((cols) =>
    db
      .from("celebrities")
      .select(`${CELEB_COLS}, assets(${cols})`)
      .eq("slug", slug)
      .maybeSingle(),
  );
  if (error) throw new Error(`Failed to load celebrity: ${error.message}`);
  if (!data) return null;

  const { assets = [], ...row } = data as unknown as CelebRow & {
    assets: AssetRow[];
  };
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
  const { data, error } = await withGalleryFallback((cols) =>
    db
      .from("assets")
      .select(`${cols}, celebrities(${CELEB_COLS})`)
      .eq("slug", slug)
      .maybeSingle(),
  );
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
  const { data, error } = await withGalleryFallback((cols) =>
    db
      .from("celebrities")
      .select(`${CELEB_COLS}, assets(${cols})`)
      .order("name"),
  );
  if (error) throw new Error(`Failed to load celebrities: ${error.message}`);

  return (data as unknown as (CelebRow & { assets: AssetRow[] })[]).map((row) => {
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

/**
 * Reaction counts for every asset at once, keyed by asset uuid then emoji.
 * One query for a listing page — the per-asset variant would be N.
 */
export async function getAllReactions(): Promise<
  Record<string, Record<string, number>>
> {
  const db = await reader();
  const { data, error } = await db
    .from("reactions")
    .select("asset_id, emoji, count");
  if (error) return {};

  const out: Record<string, Record<string, number>> = {};
  for (const r of data as { asset_id: string; emoji: string; count: number }[]) {
    (out[r.asset_id] ??= {})[r.emoji] = r.count;
  }
  return out;
}

/** Reaction counts for one asset, keyed by emoji. */
export async function getReactions(
  assetUuid: string,
): Promise<Record<string, number>> {
  if (!assetUuid) return {};
  const db = await reader();

  const { data, error } = await db
    .from("reactions")
    .select("emoji, count")
    .eq("asset_id", assetUuid);

  if (error) return {};
  return Object.fromEntries(
    (data as { emoji: string; count: number }[]).map((r) => [r.emoji, r.count]),
  );
}

/**
 * View counts for a whole table, keyed by slug.
 *
 * One query for the listing rather than one per row. Pages nobody has opened
 * have no row at all, so callers should read a missing slug as zero.
 */
export async function getAllViews(
  table: "celebrities" | "assets",
): Promise<Record<string, number>> {
  const db = await reader();
  const { data, error } = await db
    .from("page_views")
    .select("slug, count")
    .eq("table_name", table);

  // A missing table (migration not yet applied) should leave the listing
  // working with every count at zero, not break the page.
  if (error) return {};
  return Object.fromEntries(
    (data as { slug: string; count: number }[]).map((r) => [r.slug, r.count]),
  );
}

/** One comment in an asset's discussion, author resolved to a username. */
export type CommentRow = {
  id: string;
  parentId: string | null;
  body: string;
  author: string;
  isDeleted: boolean;
  createdAt: string;
  score: number;
  /** How the signed-in reader voted: 1, -1, or 0 for not at all. */
  myVote: -1 | 0 | 1;
};

/**
 * The discussion under one asset, oldest first — the tree is built by the
 * component. Returns nothing when the migration is missing, so the page
 * works before the SQL has run.
 */
export async function getComments(assetUuid: string): Promise<CommentRow[]> {
  if (!assetUuid) return [];
  const db = await reader();
  const { data, error } = await db
    .from("comments")
    // The FK is named: since comment_votes arrived there are two paths from
    // comments to profiles (author, and voters), and an unnamed embed is
    // ambiguous - PostgREST refuses it outright.
    .select(
      "id, parent_id, body, is_deleted, created_at, profiles!comments_author_id_fkey(username)",
    )
    .eq("asset_id", assetUuid)
    .order("created_at");
  if (error) return [];

  const rows = data as unknown as {
    id: string;
    parent_id: string | null;
    body: string;
    is_deleted: boolean;
    created_at: string;
    profiles: { username: string } | { username: string }[] | null;
  }[];
  const ids = rows.map((r) => r.id);

  // Totals come from the aggregate view; which way *I* voted comes straight
  // from the votes table, which RLS trims to my own rows. Either query
  // failing (migration not run, signed out) degrades to zeros.
  const scores: Record<string, number> = {};
  const mine: Record<string, number> = {};
  if (ids.length > 0) {
    const [scoreRes, mineRes] = await Promise.all([
      db.from("comment_scores").select("comment_id, score").in("comment_id", ids),
      db.from("comment_votes").select("comment_id, value").in("comment_id", ids),
    ]);
    for (const r of (scoreRes.data ?? []) as { comment_id: string; score: number }[]) {
      scores[r.comment_id] = r.score;
    }
    for (const r of (mineRes.data ?? []) as { comment_id: string; value: number }[]) {
      mine[r.comment_id] = r.value;
    }
  }

  return rows.map((r) => {
    const p = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    return {
      id: r.id,
      parentId: r.parent_id,
      body: r.is_deleted ? "" : r.body,
      author: p?.username ?? "unknown",
      isDeleted: r.is_deleted,
      createdAt: r.created_at,
      score: scores[r.id] ?? 0,
      myVote: (mine[r.id] ?? 0) as -1 | 0 | 1,
    };
  });
}

/** How many times a page has been viewed. */
export async function getViews(
  table: "celebrities" | "assets",
  slug: string,
): Promise<number> {
  const db = await reader();
  const { data } = await db
    .from("page_views")
    .select("count")
    .eq("table_name", table)
    .eq("slug", slug)
    .maybeSingle();

  return (data as { count: number } | null)?.count ?? 0;
}
