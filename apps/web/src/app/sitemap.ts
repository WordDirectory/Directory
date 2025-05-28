import type { MetadataRoute } from "next";
import { getUniqueFirstLetters } from "@/lib/db/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  // Get all letters that have words - using our existing query!
  const letters = await getUniqueFirstLetters();

  // Static routes with a nice object map for maintainability
  const staticRoutes = [
    "", // home
    "about",
    "contact",
    "privacy",
    "terms",
    "roadmap",
  ].map((route) => ({
    url: `${baseUrl}${route ? `/${route}` : ""}`,
    lastModified: new Date(),
    // Static pages change less frequently
    changeFrequency: "monthly" as const,
    // Home page gets highest priority
    priority: route === "" ? 1.0 : 0.7,
  }));

  // Letter-based sitemaps
  const letterSitemaps = letters.map((letter) => ({
    url: `${baseUrl}/words/sitemap/${letter}.xml`,
    lastModified: new Date(),
    // Sitemaps should be checked frequently
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...letterSitemaps];
}
