import type { Metadata } from "next";
import { BlogOverzichtWeergave } from "@/components/paginas/Weergaven";
import { getBlogPosts } from "@/lib/blog";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getPagina("blog");
  return {
    title: `${t.titel} — Specified`,
    description: t.inleiding,
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogIndex() {
  const [posts, t, s] = await Promise.all([getBlogPosts(), getPagina("blog"), getSettings()]);
  return <BlogOverzichtWeergave t={t} posts={posts} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
