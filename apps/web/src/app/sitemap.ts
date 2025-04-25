import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use environment variable with fallback
  const baseUrl = `https://${process.env.NEXT_PUBLIC_SITE_URL}`;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_SITE_URL is not set");
  }

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/roadmap`, lastModified: new Date() },
  ];
}
