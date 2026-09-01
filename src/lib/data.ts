import fs from "node:fs";
import path from "node:path";
import type { Asset, Celebrity, CelebrityWithAssets } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readJsonDir<T>(dir: string): T[] {
  const full = path.join(DATA_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(full, f), "utf8")) as T);
}

export function getCelebrities(): Celebrity[] {
  return readJsonDir<Celebrity>("celebrities").sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function getAssets(): Asset[] {
  return readJsonDir<Asset>("assets").sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function getCelebrity(id: string): CelebrityWithAssets | null {
  const celeb = getCelebrities().find((c) => c.id === id);
  if (!celeb) return null;
  return { ...celeb, assets: getAssets().filter((a) => a.ownerId === id) };
}

export function getAsset(id: string): { asset: Asset; owner: Celebrity | null } | null {
  const asset = getAssets().find((a) => a.id === id);
  if (!asset) return null;
  return {
    asset,
    owner: getCelebrities().find((c) => c.id === asset.ownerId) ?? null,
  };
}

export function getCelebritiesWithAssets(): CelebrityWithAssets[] {
  const assets = getAssets();
  return getCelebrities().map((c) => ({
    ...c,
    assets: assets.filter((a) => a.ownerId === c.id),
  }));
}

export function getStats() {
  const assets = getAssets();
  return {
    celebrities: getCelebrities().length,
    assets: assets.length,
    verified: assets.filter((a) => a.status === "verified").length,
    categories: new Set(assets.map((a) => a.category)).size,
  };
}

