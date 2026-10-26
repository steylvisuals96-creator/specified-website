import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * Wie een Payload-adminlink bewaard heeft, sturen we door naar het eigen
 * dashboard. Alleen collecties die hier echt bestaan, en per collectie het
 * detailpad dat ze werkelijk heeft — de vorige lijst kwam uit een ander
 * project en verwees naar pagina's die niet bestaan.
 */
type Doorverwijzing = {
  slug: string;
  /** "detail" → /dashboard/x/:id, "edit" → /dashboard/x/:id/edit, geen → alleen de lijst */
  detail?: "detail" | "edit";
  /** Heeft deze collectie een aparte aanmaakpagina? */
  create?: boolean;
};

const doorverwijzingen: Doorverwijzing[] = [
  { slug: "vacatures", detail: "detail" },
  { slug: "kandidaten", detail: "detail" },
  { slug: "bedrijven", detail: "detail" },
  { slug: "sollicitaties", detail: "detail" },
  { slug: "gebruikers", detail: "edit", create: true },
  // Media en activiteiten hebben alleen een overzicht, geen detailpagina.
  { slug: "media", create: true },
  { slug: "activiteiten" },
];

// Beveiligingsheaders voor dashboard, admin en API. Geen volledige CSP: de
// Payload-admin gebruikt inline scripts en stijlen. Wel frame-ancestors, zodat
// niemand de CMS in een frame kan laden (clickjacking op de loginpagina).
const beveiligingsheaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  // Er staat een package.json in de home-map van de ontwikkelaar; zonder dit kiest
  // Turbopack die map als root en leest het verouderde bestanden (bv. de importMap).
  turbopack: { root: process.cwd() },
  async headers() {
    return [{ source: "/:path*", headers: beveiligingsheaders }];
  },
  async redirects() {
    const rules = [
      { source: "/admin/globals/instellingen", destination: "/dashboard/instellingen/edit", permanent: false },
    ];

    // Blog en team gaan de andere kant op: bewerken in Payload (live voorbeeld).
    rules.push(
      { source: "/dashboard/blog/create", destination: "/admin/collections/blog/create", permanent: false },
      { source: "/dashboard/blog/:id/edit", destination: "/admin/collections/blog/:id", permanent: false },
      { source: "/dashboard/team/create", destination: "/admin/collections/team/create", permanent: false },
      { source: "/dashboard/team/:id/edit", destination: "/admin/collections/team/:id", permanent: false },
    );

    for (const { slug, detail, create } of doorverwijzingen) {
      rules.push({ source: `/admin/collections/${slug}`, destination: `/dashboard/${slug}`, permanent: false });
      if (create) {
        rules.push({ source: `/admin/collections/${slug}/create`, destination: `/dashboard/${slug}/create`, permanent: false });
      }
      if (detail) {
        rules.push({
          source: `/admin/collections/${slug}/:id`,
          destination: detail === "edit" ? `/dashboard/${slug}/:id/edit` : `/dashboard/${slug}/:id`,
          permanent: false,
        });
      }
    }

    return rules;
  },
};

export default withPayload(nextConfig);
