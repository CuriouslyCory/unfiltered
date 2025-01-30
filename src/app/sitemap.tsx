import type { MetadataRoute } from "next";
import { api } from "~/trpc/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [
    {
      url: "https://slak.me",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://slak.me/about",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: "https://slak.me/contact",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];

  const documents = await api.document.getAll();

  documents.forEach((document) => {
    sitemap.push({
      url: `https://slak.me/eo-summary/${document.slug}`,
      lastModified: document.updatedAt,
      changeFrequency: "daily",
      priority: 0.5,
    });
  });

  return sitemap;
}
