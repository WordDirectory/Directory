import type { MetadataRoute } from "next";
import { words } from "@/data/words";

async function fetchWords() {
  return Object.keys(words);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://worddirectory.app";
  const staticLinks = [
    { url: baseUrl, lastModified: new Date().toISOString() },
  ];

  const wordList = await fetchWords();
  const currentDate = new Date().toISOString();

  const wordLinks = wordList.map((word) => ({
    url: `${baseUrl}/words/${word}`,
    lastModified: currentDate,
  }));

  return [...staticLinks, ...wordLinks];
}
