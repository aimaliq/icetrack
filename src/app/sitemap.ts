import type { MetadataRoute } from "next";
import { getAssets, getCelebrities } from "@/lib/db";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1, changeFrequency: "daily" as const },
    { path: "/celebrities", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/assets", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/contributors", priority: 0.6, changeFrequency: "daily" as const },
    { path: "/changes", priority: 0.5, changeFrequency: "hourly" as const },
    { path: "/about", priority: 0.4, changeFrequency: "monthly" as const },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const celebrities = (await getCelebrities()).map((c) => ({
    url: `${SITE_URL}/celebrities/${c.id}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const assets = (await getAssets()).map((a) => ({
    url: `${SITE_URL}/assets/${a.id}`,
    lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...celebrities, ...assets];
}
