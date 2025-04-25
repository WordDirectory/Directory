import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WordDirectory",
    short_name: "WordDirectory",
    description:
      "Words explained like a human would - definitions that actually make sense without using other complex words you don't know",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/og/default.png",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}
