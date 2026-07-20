import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/blog";

const SITE_URL = "https://specified-website.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();

  const vaste: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vacatures`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const artikels: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.publicatiedatum ? new Date(p.publicatiedatum) : undefined,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...vaste, ...artikels];
}
