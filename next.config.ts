import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/admin/collections/paginas", destination: "/dashboard/paginas", permanent: false },
      { source: "/admin/collections/nieuws", destination: "/dashboard/nieuws", permanent: false },
      { source: "/admin/collections/team", destination: "/dashboard/team", permanent: false },
      { source: "/admin/collections/testimonials", destination: "/dashboard/getuigenissen", permanent: false },
      { source: "/admin/collections/faq", destination: "/dashboard/faq", permanent: false },
      { source: "/admin/collections/gebruikers", destination: "/dashboard/gebruikers", permanent: false },
      { source: "/admin/collections/leads", destination: "/dashboard/leads", permanent: false },
      { source: "/admin/collections/taken", destination: "/dashboard/taken", permanent: false },
      { source: "/admin/collections/afspraken", destination: "/dashboard/afspraken", permanent: false },
      { source: "/admin/collections/panden", destination: "/dashboard/panden", permanent: false },
      { source: "/admin/collections/media", destination: "/dashboard/media", permanent: false },
      { source: "/admin/globals/instellingen", destination: "/dashboard/instellingen", permanent: false },
    ];
  },
};

export default withPayload(nextConfig);
