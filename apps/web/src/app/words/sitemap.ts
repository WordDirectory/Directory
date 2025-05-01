import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export async function generateSitemaps() {
  const letters = ["a"];
  return letters.map((letter) => ({ id: letter }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? `http://${process.env.NEXT_PUBLIC_SITE_URL}`
      : `https://${process.env.NEXT_PUBLIC_SITE_URL}`;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  // Simplest possible query just to test connection
  const result = await db.query.words.findFirst();

  if (!result) {
    return [];
  }

  // Just return a single item sitemap
  return [
    {
      url: `${baseUrl}/words/${encodeURIComponent(result.word)}`,
      lastModified: result.updatedAt || new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];
}
