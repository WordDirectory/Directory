import { MetadataRoute } from "next";
import { getWordsByLetter } from "@/lib/db/queries";

export async function generateSitemaps() {
  const letters = ["a"];
  return letters.map((letter) => ({ id: letter }));
}

export default async function sitemap({
  id,
}: {
  id: string;
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    throw new Error("SITE_URL is not set");
  }

  // Use the TypeScript function instead of raw SQL
  const words = await getWordsByLetter(id);

  return words.map((word) => ({
    url: `${baseUrl}/words/${encodeURIComponent(word.word)}`,
    lastModified: word.updatedAt || new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
}
