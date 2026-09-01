/**
 * One-off import of the JSON dataset into Supabase.
 *
 * Requires the SERVICE ROLE key, because seeding bypasses RLS. Pass it for the
 * lifetime of the command only — never commit it, never store it in
 * .env.local, and never prefix it with NEXT_PUBLIC_.
 *
 * PowerShell:
 *   $env:SUPABASE_SERVICE_ROLE_KEY = "..."
 *   npx tsx scripts/migrate-to-supabase.ts
 *   Remove-Item Env:\SUPABASE_SERVICE_ROLE_KEY
 *
 * bash / zsh:
 *   SUPABASE_SERVICE_ROLE_KEY="..." npx tsx scripts/migrate-to-supabase.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

/**
 * Load .env.local for the project URL. Only the service role key has to be
 * supplied by hand — it deliberately does not live in any file.
 */
function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n\n" +
      "PowerShell:\n" +
      '  $env:SUPABASE_SERVICE_ROLE_KEY = "your_key"\n' +
      "  npx tsx scripts/migrate-to-supabase.ts\n\n" +
      "bash / zsh:\n" +
      '  SUPABASE_SERVICE_ROLE_KEY="your_key" npx tsx scripts/migrate-to-supabase.ts\n\n' +
      "Find the key in Supabase > Project Settings > API > service_role.",
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
        image_url: c.imageUrl ?? null,
        image_credit: c.imageCredit ?? null,
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
      image_url: a.imageUrl ?? null,
      image_credit: a.imageCredit ?? null,
      image_is_representative: a.imageIsRepresentative ?? false,
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
