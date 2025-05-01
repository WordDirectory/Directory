import type { MetadataRoute } from "next";
import { getWordsByLetter, getUniqueFirstLetters } from "@/lib/db/queries";

export async function generateSitemaps() {
  const letters = await getUniqueFirstLetters();
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

  const words = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
  ];

  return words.map((word) => ({
    // url: `${baseUrl}/words/${encodeURIComponent(word.word)}`,
    url: `${baseUrl}/words/${encodeURIComponent(word)}`,
    // lastModified: word.updatedAt || new Date(),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
}
