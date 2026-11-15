import "server-only";

export const SEO_PAGINAS = ["/", "/voor-bedrijven", "/voor-engineers", "/vacatures", "/contact", "/faq", "/blog"] as const;
export type SeoPad = (typeof SEO_PAGINAS)[number];

export type ZoekSignaal = {
  pad: SeoPad;
  zoekterm: string;
  vertoningen: number;
  klikken: number;
  positie: number;
  ctr: number;
};

export type Bron = { url: string; titel: string; fragment: string };
export type Rapport = {
  periode?: { start: string; einde: string };
  signalen?: ZoekSignaal[];
  bronnen?: Pick<Bron, "url" | "titel">[];
  meldingen?: string[];
  cover?: boolean;
};

const geldigAdres = (waarde: string | undefined) => {
  try {
    const url = new URL(waarde ?? "");
    return url.protocol === "https:" && waarde?.replace(/\/$/, "") === url.origin ? url.origin : null;
  } catch {
    return null;
  }
};

export function seoConfig() {
  const google = {
    property: process.env.SEO_GSC_PROPERTY?.trim(),
    email: process.env.SEO_GSC_CLIENT_EMAIL?.trim(),
    sleutel: process.env.SEO_GSC_PRIVATE_KEY?.replace(/\\n/g, "\n").trim(),
  };
  const site = geldigAdres(process.env.SEO_SITE_URL);
  const apify = process.env.SEO_APIFY_TOKEN?.trim();
  const openai = process.env.SEO_OPENAI_API_KEY?.trim();
  const ontbreekt = [
    ...(!site ? ["Publieke website (SEO_SITE_URL)"] : []),
    ...(!google.property || !google.email || !google.sleutel ? ["Google Search Console"] : []),
    ...(!apify ? ["Apify"] : []),
    ...(!openai ? ["OpenAI"] : []),
    ...(!process.env.CRON_SECRET || !process.env.SUPABASE_SECRET_KEY ? ["Vercel Cron / Supabase"] : []),
  ];
  return {
    actief: process.env.SEO_BOT_ENABLED === "1",
    automatisch: process.env.SEO_BOT_AUTO_METADATA === "1",
    beeld: process.env.SEO_BOT_IMAGES === "1",
    site,
    google,
    apify,
    openai,
    ontbreekt,
  };
}
