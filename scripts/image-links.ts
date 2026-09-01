/**
 * Prints ready-made search links for every entry that still has no image.
 * Works offline — it only builds URLs. Use it when you want to hunt for
 * photos by hand rather than run the Commons fetcher.
 *
 *   npx tsx scripts/image-links.ts
 */
import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "data");

function read(dir: string) {
  const full = path.join(DATA, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(full, f), "utf8")));
}

// Flickr licence ids: 4 = CC BY, 5 = CC BY-SA, 9 = CC0, 10 = Public Domain.
// NC and ND are deliberately excluded — see docs/IMAGES.md.
const FLICKR_LICENCES = "4,5,9,10";

function links(term: string, wikipedia?: string) {
  const q = encodeURIComponent(term);
  const out = [
    `  Commons  https://commons.wikimedia.org/w/index.php?search=${q}&ns6=1`,
    `  Flickr   https://flickr.com/search/?text=${q}&license=${FLICKR_LICENCES}`,
  ];
  if (wikipedia) out.push(`  Wikipedia ${wikipedia}`);
  return out.join("\n");
}

const celebs = read("celebrities").filter((c) => !c.imageUrl);
const assets = read("assets").filter((a) => !a.imageUrl);

if (celebs.length === 0 && assets.length === 0) {
  console.log("Every entry already has an image.");
  process.exit(0);
}

if (celebs.length) {
  console.log(`\nCELEBRITIES — ${celebs.length} without an image\n`);
  for (const c of celebs) {
    console.log(c.name);
    console.log(links(c.name, c.wikipedia));
    console.log();
  }
}

if (assets.length) {
  console.log(`\nASSETS — ${assets.length} without an image`);
  console.log("Search the model, not the individual example.\n");
  for (const a of assets) {
    const term = [a.make, a.model].filter(Boolean).join(" ") || a.name;
    console.log(`${a.name}  →  searching "${term}"`);
    console.log(links(term));
    console.log();
  }
}

console.log("Usable licences: CC0, Public Domain, CC BY, CC BY-SA.");
console.log("NOT usable: CC BY-NC, CC BY-ND, or anything marked non-free.");
console.log("See docs/IMAGES.md for the full rules.");
