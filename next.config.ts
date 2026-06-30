import type { NextConfig } from "next";

// Origin of the Emmut public CMS API (kept in sync with src/lib/env.ts). Read
// here too so `next/image` can be told which remote host serves CMS photos.
const CMS_API_FALLBACK = "https://emmut.dfwsc.com";

// `||` (not `??`) so an empty string from a deploy platform also falls back, and
// a guard so a malformed value can't crash `next build` / `next dev` at startup.
function resolveCmsOrigin(): URL {
  const raw = process.env.CMS_API_URL || CMS_API_FALLBACK;
  try {
    return new URL(raw);
  } catch {
    console.warn(`[next.config] Invalid CMS_API_URL "${raw}" — falling back to ${CMS_API_FALLBACK}.`);
    return new URL(CMS_API_FALLBACK);
  }
}

const cmsOrigin = resolveCmsOrigin();

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    // Property/hero photos are downloaded into /public, but allow the original
    // Wix CDN as a fallback for any asset not yet localized.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
        pathname: "/**",
      },
      // Building/unit photos streamed from the Emmut public CMS image route.
      {
        protocol: cmsOrigin.protocol === "http:" ? "http" : "https",
        hostname: cmsOrigin.hostname,
        port: cmsOrigin.port || undefined,
        pathname: "/api/public/cms/images/**",
      },
    ],
  },
  async redirects() {
    // `/properties` is an alias for the canonical `/long-term-rentals` route.
    return [
      {
        source: "/properties",
        destination: "/long-term-rentals",
        permanent: true,
      },
      {
        source: "/properties/:slug",
        destination: "/long-term-rentals/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
