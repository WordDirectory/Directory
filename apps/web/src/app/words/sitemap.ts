import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

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
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  // Call the database function directly
  const results = await db.execute(
    sql`SELECT * FROM get_words_by_letter(${id})`
  );

  return results.rows.map((word: any) => ({
    url: `${baseUrl}/words/${encodeURIComponent(word.word)}`,
    lastModified: word.updated_at || new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
}
