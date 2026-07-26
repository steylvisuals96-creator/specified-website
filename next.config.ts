import type { NextConfig } from "next";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "https://specified-cms.vercel.app";
const dev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy.
 *
 * script-src heeft 'unsafe-inline' nodig: Next.js zet de hydratiedata in een
 * inline script en Vercel Analytics doet hetzelfde. Dat kan pas weg als er
 * nonces per request worden doorgegeven. De policy blijft ondertussen wel
 * bepalen wáár scripts vandaan mogen komen, en dat is het grootste deel van
 * de winst.
 *
 * img-src staat bewust op https:. Coverafbeeldingen van blogartikelen kunnen
 * een externe URL zijn die de redactie zelf invult; die hosts vooraf opsommen
 * gaat niet.
 */
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 'unsafe-eval' alleen lokaal: React gebruikt eval() in dev-modus voor
  // betere foutmeldingen, in productie nooit.
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${CMS_URL} https://va.vercel-scripts.com https://vitals.vercel-insights.com`,
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Twee jaar HTTPS afdwingen, ook voor subdomeinen.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Geen MIME-sniffing: een geüpload bestand mag niet als script uitgevoerd worden.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Dubbelop met frame-ancestors, voor oudere browsers.
  { key: "X-Frame-Options", value: "DENY" },
  // Externe sites krijgen alleen het domein te zien, niet het volledige pad.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // De site vraagt geen van deze rechten; expliciet dichtzetten.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
