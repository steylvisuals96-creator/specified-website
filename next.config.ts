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
  { slug: "blog", detail: "edit", create: true },
  { slug: "team", detail: "edit", create: true },
  { slug: "gebruikers", detail: "edit", create: true },
  // Media en activiteiten hebben alleen een overzicht, geen detailpagina.
  { slug: "media", create: true },
  { slug: "activiteiten" },
];

const nextConfig: NextConfig = {
  async redirects() {
    const rules = [
      { source: "/admin/globals/instellingen", destination: "/dashboard/instellingen/edit", permanent: false },
    ];

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
