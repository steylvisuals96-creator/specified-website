import type { NextConfig } from "next";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "https://specified-cms.vercel.app";
// Het nieuwe beheer (map beheer/) en de database waar het voorbeeld uit leest.
const BEHEER_URL = process.env.NEXT_PUBLIC_BEHEER_URL ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const dev = process.env.NODE_ENV !== "production";

const origin = (url: string) => {
  try {
    return new URL(url).origin;
  } catch {
    return "";
  }
};
const host = (url: string, standaard: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return standaard;
  }
};

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
function maakCsp(frameAncestors: string) {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    `frame-ancestors ${frameAncestors}`,
    "form-action 'self'",
    // 'unsafe-eval' alleen lokaal: React gebruikt eval() in dev-modus voor
    // betere foutmeldingen, in productie nooit.
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
    "style-src 'self' 'unsafe-inline'",
    // Lokaal draait het beheer op http (poort 3004); in productie is alles https.
    `img-src 'self' data: blob: https:${dev ? " http://localhost:3004" : ""}`,
    "font-src 'self' data:",
    `connect-src 'self' ${CMS_URL} ${origin(SUPABASE_URL)} https://va.vercel-scripts.com https://vitals.vercel-insights.com`.replace(/\s+/g, " "),
    "upgrade-insecure-requests",
  ].join("; ");
}

/** Alleen de voorbeeldpagina mag in een frame, en alleen van de oude CMS en het nieuwe beheer. */
const VOORBEELD_PADEN = ["/blog/voorbeeld", "/voorbeeld/:pad*", "/en/blog/voorbeeld", "/en/voorbeeld/:pad*"];
const csp = maakCsp("'none'");
const voorbeeldCsp = maakCsp(
  [origin(CMS_URL), origin(BEHEER_URL), ...(dev ? ["http://localhost:3003", "http://localhost:3004"] : [])].filter(Boolean).join(" ") || "'none'",
);

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

const cmsHost = host(CMS_URL, "specified-cms.vercel.app");
const beheerHost = host(BEHEER_URL, "");

const nextConfig: NextConfig = {
  // Geen "x-powered-by: Next.js": verklapt niets nuttigs aan bezoekers.
  poweredByHeader: false,
  // Coverbeelden van de blog: alleen deze hosts via next/image (components/Cover.tsx).
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 70, 75],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: cmsHost, pathname: "/api/media/**" },
      // Beelden uit het nieuwe beheer: /m/<id> stuurt door naar een ondertekende R2-link.
      ...(beheerHost ? [{ protocol: "https" as const, hostname: beheerHost, pathname: "/m/**" }] : []),
    ],
  },
  // Er staat een package.json in de home-map van de ontwikkelaar; zonder dit kiest
  // Turbopack die map als root en mist het wijzigingen in dit project.
  turbopack: { root: process.cwd() },
  // De vorige site op specified.be was Engelstalig. Zijn 18 adressen (sitemap
  // van 2026-11-22) sturen permanent door naar de Engelse versie van de nieuwe
  // pagina's (onder /en, sinds 2026-11-23), zodat Google de posities overdraagt
  // en oude links (vacatures, LinkedIn) werken.
  // De oude adressen eindigden op een slash: Next haalt die eerst weg (308),
  // daarna volgt deze doorverwijzing (308). Twee sprongen, voor Google geen probleem.
  async redirects() {
    const oud: [string, string][] = [
      ["/about-us", "/en#over-ons"],
      ["/services", "/en/for-companies"],
      ["/services/engineering-partner", "/en/for-companies"],
      ["/services/career-partner", "/en/for-engineers"],
      ["/jobs", "/en/jobs"],
      ["/jobs/spontaneous-application", "/en/open-application"],
      ["/jobs/thanks-for-your-sollicitation", "/en/jobs"],
      ["/job", "/en/jobs"],
      // Oude vacatures hebben andere adressen; ze landen op het overzicht.
      ["/job/:slug", "/en/jobs"],
      ["/contact/thank-you", "/en/contact"],
      ["/privacy-policy", "/en/privacy"],
      ["/cookie-policy", "/en/cookies"],
      ["/test-slider-home", "/en"],
    ];
    return oud.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    // De voorbeeldpagina krijgt dezelfde headers, behalve frame-ancestors en
    // X-Frame-Options: die zouden het tonen in het CMS blokkeren.
    const voorbeeldHeaders = [
      ...securityHeaders
        .filter((h) => h.key !== "X-Frame-Options")
        .map((h) => (h.key === "Content-Security-Policy" ? { ...h, value: voorbeeldCsp } : h)),
      // Nooit in de browser bewaren: een bewaarde kopie hield een oude frame-ancestors
      // vast, waardoor het voorbeeld in het beheer geweigerd werd (2026-11-15).
      { key: "Cache-Control", value: "no-store, max-age=0" },
    ];
    return [
      { source: "/((?!(?:en/)?blog/voorbeeld$|(?:en/)?voorbeeld/).*)", headers: securityHeaders },
      ...VOORBEELD_PADEN.map((source) => ({ source, headers: voorbeeldHeaders })),
      // Het vercel.app-adres hoort niet in Google: vóór de livegang niet onder het
      // verkeerde domein, daarna geen dubbele inhoud naast specified.be.
      { source: "/:pad*", has: [{ type: "host" as const, value: ".*\\.vercel\\.app" }], headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
