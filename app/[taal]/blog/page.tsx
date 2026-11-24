import { paginaMetadata } from "@/lib/seo-metadata";
import type { Metadata } from "next";
import { BlogOverzichtWeergave } from "@/components/paginas/Weergaven";
import { getBlogPosts } from "@/lib/blog";
import { getPagina } from "@/lib/paginas";
import { getSettings } from "@/lib/settings";
import { huidigeTaal } from "@/lib/taal-server";
import { lokaalPad, taalAlternates } from "@/lib/taal";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const taal = await huidigeTaal();
  const t = await getPagina("blog", taal);
  return paginaMetadata(lokaalPad(taal, "/blog"), {
    title: `${t.titel} | Specified`,
    description: t.inleiding,
    alternates: taalAlternates(taal, "/blog"),
  });
}

export default async function BlogIndex() {
  const taal = await huidigeTaal();
  const [posts, t, s] = await Promise.all([getBlogPosts(), getPagina("blog", taal), getSettings(taal)]);
  return <BlogOverzichtWeergave t={t} taal={taal} posts={posts} footer={{ linkedin: s.linkedin, footerTekst: s.footer_tekst }} />;
}
