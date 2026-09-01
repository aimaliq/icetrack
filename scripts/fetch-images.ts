/**
 * Pulls freely-licensed images from Wikimedia Commons into the dataset.
 *
 *   npx tsx scripts/fetch-images.ts            # celebrities + assets
 *   npx tsx scripts/fetch-images.ts --dry-run  # show what it would do
 *
 * Only images whose licence permits reuse are accepted, and the author and
 * licence are recorded alongside the URL — CC BY-SA requires attribution, so
 * an image without credit cannot legally be published.
 *
 * Needs network access. Run it yourself; it is not part of the build.
 */
import fs from "node:fs";
import path from "node:path";

const DRY = process.argv.includes("--dry-run");
const DATA = path.join(process.cwd(), "data");
const UA = "IceTrack/0.1 (https://github.com/aimaliq/icetrack)";

/** Licences that allow reuse with attribution. */
const ALLOWED = /^(cc0|cc-by|cc-by-sa|public domain|pd)/i;

interface CommonsImage {
  url: string;
  author?: string;
  license?: string;
  sourcePage?: string;
}

async function api(params: Record<string, string>): Promise<any> {
  const qs = new URLSearchParams({ format: "json", origin: "*", ...params });
  const res = await fetch(`https://commons.wikimedia.org/w/api.php?${qs}`, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

/** Finds the lead image of a Wikipedia article, which is usually the best one. */
async function fromWikipedia(title: string): Promise<string | null> {
  const qs = new URLSearchParams({
    format: "json",
    origin: "*",
    action: "query",
    prop: "pageimages",
    piprop: "name",
    titles: title,
  });
  const res = await fetch(`https://en.wikipedia.org/w/api.php?${qs}`, {
    headers: { "User-Agent": UA },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const pages = json?.query?.pages ?? {};
  const first: any = Object.values(pages)[0];
  return first?.pageimage ? `File:${first.pageimage}` : null;
}

async function search(term: string): Promise<string | null> {
  const json = await api({
    action: "query",
    list: "search",
    srsearch: `${term} filetype:bitmap`,
    srnamespace: "6",
    srlimit: "1",
  });
  return json?.query?.search?.[0]?.title ?? null;
}

async function details(file: string): Promise<CommonsImage | null> {
  const json = await api({
    action: "query",
    titles: file,
    prop: "imageinfo",
    iiprop: "url|extmetadata",
    iiurlwidth: "800",
  });
  const page: any = Object.values(json?.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;

  const meta = info.extmetadata ?? {};
  const license: string | undefined =
    meta.LicenseShortName?.value ?? meta.License?.value;

  if (!license || !ALLOWED.test(license.replace(/\s/g, "-"))) {
    console.log(`    skipped — licence "${license ?? "unknown"}" not permissive`);
    return null;
  }

  return {
    url: info.thumburl ?? info.url,
    author: strip(meta.Artist?.value),
    license,
    sourcePage: info.descriptionurl,
  };
}

function strip(html?: string): string | undefined {
  if (!html) return undefined;
  const text = html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return text.slice(0, 120) || undefined;
}

function readDir(dir: string) {
  const full = path.join(DATA, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      file: path.join(full, f),
      json: JSON.parse(fs.readFileSync(path.join(full, f), "utf8")),
    }));
}

async function fillImages(dir: string, queryOf: (j: any) => string, wiki: (j: any) => string | null) {
  for (const { file, json } of readDir(dir)) {
    if (json.imageUrl) {
      console.log(`  = ${json.id} — already has an image`);
      continue;
    }
    console.log(`  · ${json.id}`);

    let target: string | null = null;
    const article = wiki(json);
    if (article) target = await fromWikipedia(article);
    if (!target) target = await search(queryOf(json));

    if (!target) {
      console.log("    no candidate found");
      continue;
    }

    const img = await details(target);
    if (!img) continue;

    console.log(`    found: ${img.license} — ${img.author ?? "unknown author"}`);
    if (!DRY) {
      json.imageUrl = img.url;
      json.imageCredit = {
        url: img.url,
        author: img.author,
        license: img.license,
        sourcePage: img.sourcePage,
      };
      fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n");
    }
    // Commons asks for gentle pacing from scripted clients.
    await new Promise((r) => setTimeout(r, 400));
  }
}

async function main() {
  if (DRY) console.log("DRY RUN — no files will be written\n");

  console.log("Celebrities:");
  await fillImages(
    "celebrities",
    (j) => j.name,
    (j) => (j.wikipedia ? decodeURIComponent(j.wikipedia.split("/wiki/")[1] ?? "") : null),
  );

  console.log("\nAssets:");
  await fillImages(
    "assets",
    (j) => [j.make, j.model].filter(Boolean).join(" ") || j.name,
    () => null,
  );

  console.log("\nDone. Review the credits before publishing.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
