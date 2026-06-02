import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Property/hero photos are downloaded into /public, but allow the original
    // Wix CDN as a fallback for any asset not yet localized.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
