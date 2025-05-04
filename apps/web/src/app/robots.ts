import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api", "/word-limit-reached"],
    },
    sitemap: "https://worddirectory.app/sitemap.xml",
  };
}
