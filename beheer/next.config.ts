import type { NextConfig } from "next";

const dev = process.env.NODE_ENV !== "production";
const WEBSITE = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://specified-website.vercel.app";
const websiteOrigin = (() => {
  try {
    return new URL(WEBSITE).origin;
  } catch {
    return "";
  }
})();

// Het beheer laadt niets van buiten, behalve het websitevoorbeeld in een frame
// en coverbeelden (externe https-links en ondertekende R2-links).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self'",
  `frame-src ${websiteOrigin}${dev ? " http://localhost:3000" : ""}`,
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Het beheer staat in een submap van de repo; zonder dit neemt Turbopack de
  // repo-map als root en pikt het bestanden van de website op (instrumentation.ts).
  turbopack: { root: process.cwd() },
  experimental: {
    // Blogartikels met opmaak passen ruim in 2 MB; uploads gaan via /api/upload.
    serverActions: { bodySizeLimit: "2mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
