import type { MetadataRoute } from "next";

import { siteUrl } from "@/config/site";
import gameServices from "@/features/game/game.services";

// The public case list is loaded through the Supabase server client, which
// reads cookies — so this route renders dynamically on each request instead
// of being frozen at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: siteUrl("/store"), changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/create"), changeFrequency: "monthly", priority: 0.7 },
    { url: siteUrl("/guide"), changeFrequency: "monthly", priority: 0.7 },
  ];

  try {
    const games = await gameServices.findPublic();
    const caseEntries: MetadataRoute.Sitemap = games.map((game) => {
      const lastModified = new Date(game.created_at);
      return {
        url: siteUrl(`/case/${game.id}`),
        lastModified: Number.isNaN(lastModified.getTime())
          ? undefined
          : lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      };
    });
    return [...staticEntries, ...caseEntries];
  } catch (error) {
    console.error("sitemap: failed to load public cases", error);
    return staticEntries;
  }
}
