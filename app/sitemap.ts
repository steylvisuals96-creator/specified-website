import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getBlogPosts } from "@/lib/blog";
import { getVacatures } from "@/lib/vacatures";


export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, vacatures] = await Promise.all([getBlogPosts(), getVacatures()]);

  const vaste: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vacatures`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/voor-bedrijven`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/voor-engineers`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/open-sollicitatie`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/disclaimer`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/toegankelijkheid`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];

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
