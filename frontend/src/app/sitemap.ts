import type { MetadataRoute } from "next";
import { getMoviesForSitemap } from "@/lib/api";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const movies = await getMoviesForSitemap();
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: absoluteUrl("/movies"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/reviews"),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  return [
    ...staticRoutes,
    ...movies.map(({ posterUrl, slug }) => ({
      url: absoluteUrl(`/movies/${slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: posterUrl ? [posterUrl] : undefined,
    })),
  ];
}
