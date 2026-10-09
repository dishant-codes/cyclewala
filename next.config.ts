import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  // browsers ignore HSTS over plain http, so this only bites once the site is on https
  ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // lets a production build run beside the dev server (NEXT_DIST_DIR=.next-prod) for speed testing
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  // the MongoDB driver is loaded by Node at runtime, not bundled
  serverExternalPackages: ["mongodb"],
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // brand photos and logos rarely change: let browsers and the CDN keep them
        source: "/:dir(images|oykid|neufman|schnell|hero|keysto|hercules|radiant|bsa|kross|allwyn|firefox|corrado|gang|avon)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        // the admin area and its API: never cached, never indexed
        source: "/(admin|api/admin)/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
