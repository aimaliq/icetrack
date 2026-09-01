/**
 * Validates every data file against the JSON schemas and the IceTrack
 * editorial rules. Run with `npm run validate`.
 */
import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ROOT = process.cwd();
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const assetSchema = JSON.parse(
  fs.readFileSync(path.join(ROOT, "schema/asset.schema.json"), "utf8"),
);
const celebSchema = JSON.parse(
  fs.readFileSync(path.join(ROOT, "schema/celebrity.schema.json"), "utf8"),
);

const validateAsset = ajv.compile(assetSchema);
const validateCeleb = ajv.compile(celebSchema);

const errors: string[] = [];
const warnings: string[] = [];

function read(dir: string) {
  const full = path.join(ROOT, "data", dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      file: `data/${dir}/${f}`,
      json: JSON.parse(fs.readFileSync(path.join(full, f), "utf8")),
    }));
}

const celebs = read("celebrities");
const assets = read("assets");
const celebIds = new Set(celebs.map((c) => c.json.id));

for (const { file, json } of celebs) {
  if (!validateCeleb(json)) {
    for (const e of validateCeleb.errors ?? []) {
      errors.push(`${file}: ${e.instancePath || "/"} ${e.message}`);
    }
  }
  const expected = `data/celebrities/${json.id}.json`;
  if (json.id && file !== expected) {
    errors.push(`${file}: filename must match id (expected ${expected})`);
  }
}

for (const { file, json } of assets) {
  if (!validateAsset(json)) {
    for (const e of validateAsset.errors ?? []) {
      errors.push(`${file}: ${e.instancePath || "/"} ${e.message}`);
    }
  }

  const expected = `data/assets/${json.id}.json`;
  if (json.id && file !== expected) {
    errors.push(`${file}: filename must match id (expected ${expected})`);
  }

  if (json.ownerId && !celebIds.has(json.ownerId)) {
    errors.push(`${file}: ownerId "${json.ownerId}" has no celebrity file`);
  }

  // Editorial rule: a published claim needs a real citation.
  const sources = Array.isArray(json.sources) ? json.sources : [];
  const real = sources.filter(
    (s: { url?: string }) =>
      typeof s.url === "string" && !s.url.trim().toUpperCase().startsWith("TODO"),
  );
  const published = json.status === "verified" || json.status === "reported";

  if (published && real.length === 0) {
    errors.push(
      `${file}: status "${json.status}" requires at least one non-TODO source`,
    );
  }
  if (real.length === 0) {
    warnings.push(`${file}: no real source yet (status: ${json.status})`);
  }

  // Privacy rule: never store a precise location.
  const haystack = `${json.region ?? ""} ${json.summary ?? ""}`;
  if (/\d+\s+[A-Z][a-z]+\s+(Street|St|Road|Rd|Avenue|Ave|Drive|Dr|Lane|Boulevard|Blvd)\b/.test(haystack)) {
    errors.push(`${file}: looks like a street address — precise locations are not allowed`);
  }
}

for (const w of warnings) console.warn(`  warn  ${w}`);

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  error  ${e}`);
  process.exit(1);
}

console.log(
  `\nOK — ${celebs.length} celebrities, ${assets.length} assets, ${warnings.length} warning(s).`,
);
