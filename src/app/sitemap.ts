import type { MetadataRoute } from "next";
import { getAssets, getCelebrities } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/celebrities", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/assets", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.4, changeFrequency: "monthly" as const },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const celebrities = getCelebrities().map((c) => ({
    url: `${SITE_URL}/celebrities/${c.id}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const assets = getAssets().map((a) => ({
    url: `${SITE_URL}/assets/${a.id}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...celebrities, ...assets];
}
