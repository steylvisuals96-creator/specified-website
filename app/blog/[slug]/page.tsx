import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ArtikelWeergave from "@/components/ArtikelWeergave";
import { getBlogPost, getBlogPosts, formatDatum } from "@/lib/blog";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const revalidate = 60;

const SITE_URL = "https://specified-website.vercel.app";

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Artikel niet gevonden" };

  const titel = post.metaTitel || post.titel;
  const beschrijving = post.metaBeschrijving || post.samenvatting || "";

  return {
    title: titel,
    description: beschrijving,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: titel,
      description: beschrijving,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.publicatiedatum,
      images: post.coverUrl ? [{ url: post.coverUrl }] : undefined,
    },
    twitter: {
      card: post.coverUrl ? "summary_large_image" : "summary",
      title: titel,
      description: beschrijving,
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  };
}

export default async function BlogArtikel({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getBlogPost(slug), getSettings()]);
  if (!post) notFound();

  // Gestructureerde data — helpt Google het artikel te begrijpen
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.titel,
    description: post.metaBeschrijving || post.samenvatting || undefined,
    image: post.coverUrl ? [post.coverUrl] : undefined,
    datePublished: post.publicatiedatum,
    author: post.auteurNaam
      ? { "@type": "Person", name: post.auteurNaam }
      : { "@type": "Organization", name: settings.naam || "Specified" },
    publisher: { "@type": "Organization", name: settings.naam || "Specified" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Nav />
      <main id="inhoud">
        <ArtikelWeergave post={post} />
      </main>
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
