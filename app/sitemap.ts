import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getBlogPosts } from "@/lib/blog";
import { getVacatures } from "@/lib/vacatures";
import { lokaalPad } from "@/lib/taal";

export const revalidate = 3600;

/** Beide talen van een pagina, met hreflang zodat Google ze aan elkaar koppelt. */
function inBeideTalen(nlPad: string, rest: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">): MetadataRoute.Sitemap {
  const nl = `${SITE_URL}${nlPad}`;
  const en = `${SITE_URL}${lokaalPad("en", nlPad)}`;
  const alternates = { languages: { "nl-BE": nl, en } };
  return [
    { url: nl, alternates, ...rest },
    { url: en, alternates, ...rest },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, vacatures] = await Promise.all([getBlogPosts(), getVacatures()]);

  const vaste: MetadataRoute.Sitemap = [
    ...inBeideTalen("/", { changeFrequency: "weekly", priority: 1 }),
    ...inBeideTalen("/vacatures", { changeFrequency: "daily", priority: 0.9 }),
    ...inBeideTalen("/voor-bedrijven", { changeFrequency: "monthly", priority: 0.9 }),
    ...inBeideTalen("/voor-engineers", { changeFrequency: "monthly", priority: 0.9 }),
    ...inBeideTalen("/open-sollicitatie", { changeFrequency: "yearly", priority: 0.6 }),
    ...inBeideTalen("/blog", { changeFrequency: "weekly", priority: 0.8 }),
    ...inBeideTalen("/faq", { changeFrequency: "monthly", priority: 0.5 }),
    ...inBeideTalen("/contact", { changeFrequency: "yearly", priority: 0.6 }),
    ...inBeideTalen("/disclaimer", { changeFrequency: "yearly", priority: 0.2 }),
    ...inBeideTalen("/toegankelijkheid", { changeFrequency: "yearly", priority: 0.2 }),
    ...inBeideTalen("/privacy", { changeFrequency: "yearly", priority: 0.2 }),
    ...inBeideTalen("/cookies", { changeFrequency: "yearly", priority: 0.2 }),
  ];

  // Artikels en vacatures staan in één taal: alleen de Nederlandse pagina (de
  // Engelse verwijst ernaar met canonical).
  const artikels: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publicatiedatum ? new Date(p.publicatiedatum) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // Ingevulde vacatures blijven bereikbaar, maar horen niet in de sitemap.
  const jobs: MetadataRoute.Sitemap = vacatures
    .filter((v) => !v.ingevuld)
    .map((v) => ({
      url: `${SITE_URL}/vacatures/${v.slug}`,
      lastModified: v.geplaatst ? new Date(v.geplaatst) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  return [...vaste, ...jobs, ...artikels];
}
