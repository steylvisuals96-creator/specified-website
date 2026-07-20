import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main>
        <article style={{ paddingTop: "calc(72px + 4rem)", paddingBottom: "6rem" }}>
          <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 clamp(1.5rem, 5vw, 4rem)" }}>
            <Link href="/blog" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>
              ← Terug naar blog
            </Link>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", margin: "2rem 0 1rem", flexWrap: "wrap" }}>
              {post.publicatiedatum && (
                <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--lime)" }}>
                  {formatDatum(post.publicatiedatum)}
                </span>
              )}
              {post.auteurNaam && (
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>door {post.auteurNaam}</span>
              )}
            </div>

            <h1
              className="blog-titel"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(2.8rem, 6vw, 4.5rem)",
                fontWeight: 400,
                letterSpacing: "0.01em",
                lineHeight: 1.0,
                color: "var(--white)",
                marginBottom: "1.5rem",
              }}
            >
              {post.titel}
            </h1>

            {post.samenvatting && (
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", lineHeight: 1.65, marginBottom: "2.5rem" }}>
                {post.samenvatting}
              </p>
            )}

            {post.coverUrl && (
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: "8px", marginBottom: "3rem" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverUrl}
                  alt={post.titel}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            )}

            <div className="blog-inhoud" dangerouslySetInnerHTML={{ __html: post.inhoudHtml }} />
          </div>
        </article>
      </main>
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
