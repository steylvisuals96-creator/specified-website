import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  async redirects() {
    const collections: [string, string][] = [
      ["paginas", "paginas"],
      ["nieuws", "nieuws"],
      ["team", "team"],
      ["testimonials", "getuigenissen"],
      ["faq", "faq"],
      ["gebruikers", "gebruikers"],
      ["leads", "leads"],
      ["taken", "taken"],
      ["afspraken", "afspraken"],
      ["panden", "panden"],
      ["media", "media"],
    ];

    const rules: any[] = [
      { source: "/admin/globals/instellingen", destination: "/dashboard/instellingen/edit", permanent: false },
    ];

    for (const [slug, dash] of collections) {
      // List page
      rules.push({ source: `/admin/collections/${slug}`, destination: `/dashboard/${dash}`, permanent: false });
      // Create page
      rules.push({ source: `/admin/collections/${slug}/create`, destination: `/dashboard/${dash}/create`, permanent: false });
      // Edit/detail pages — map to our custom edit page
      rules.push({ source: `/admin/collections/${slug}/:id`, destination: `/dashboard/${dash}/:id/edit`, permanent: false });
    }

    return rules;
  },
};

export default withPayload(nextConfig);
