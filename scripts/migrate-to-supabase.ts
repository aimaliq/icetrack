/**
 * One-off import of the JSON dataset into Supabase.
 *
 * Requires the SERVICE ROLE key, because seeding bypasses RLS. Pass it as an
 * environment variable — never commit it, and never put it in a NEXT_PUBLIC_
 * variable:
 *
 *   SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/migrate-to-supabase.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Run: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/migrate-to-supabase.ts",
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const DATA = path.join(process.cwd(), "data");

function read<T>(dir: string): T[] {
  const full = path.join(DATA, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(full, f), "utf8")) as T);
}

async function main() {
  const celebs = read<Record<string, unknown>>("celebrities");
  const assets = read<Record<string, unknown>>("assets");

  console.log(`Importing ${celebs.length} celebrities, ${assets.length} assets…`);

  const { data: insertedCelebs, error: celebErr } = await db
    .from("celebrities")
    .upsert(
      celebs.map((c) => ({
        slug: c.id,
        name: c.name,
        real_name: c.realName ?? null,
        category: c.category,
        nationality: c.nationality ?? null,
        born_year: c.bornYear ?? null,
        bio: c.bio ?? null,
        wikipedia: c.wikipedia ?? null,
      })),
      { onConflict: "slug" },
    )
    .select("id, slug");

  if (celebErr) {
    console.error("Celebrity import failed:", celebErr.message);
    process.exit(1);
  }

  const idBySlug = new Map(insertedCelebs!.map((c) => [c.slug, c.id]));
  console.log(`  ${insertedCelebs!.length} celebrities OK`);

  const rows = assets.map((a) => {
    const celebId = idBySlug.get(a.ownerId as string);
    if (!celebId) throw new Error(`No celebrity for ownerId "${a.ownerId}"`);
    return {
      slug: a.id,
      celebrity_id: celebId,
      category: a.category,
      name: a.name,
      make: a.make ?? null,
      model: a.model ?? null,
      year: a.year ?? null,
      registration: a.registration ?? null,
      estimated_value_usd: a.estimatedValueUsd ?? null,
      acquired_year: a.acquiredYear ?? null,
      status: a.status,
      confidence: a.confidence ?? null,
      region: a.region ?? null,
      summary: a.summary ?? null,
      sources: a.sources ?? [],
    };
  });

  const { error: assetErr, count } = await db
    .from("assets")
    .upsert(rows, { onConflict: "slug", count: "exact" });

  if (assetErr) {
    console.error("Asset import failed:", assetErr.message);
    process.exit(1);
  }

  console.log(`  ${count ?? rows.length} assets OK`);
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
