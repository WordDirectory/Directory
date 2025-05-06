import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  images: {
    domains: ["unsplash.com"],
  },
};

export default nextConfig;
