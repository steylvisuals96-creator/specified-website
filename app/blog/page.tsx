import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Cover from "@/components/Cover";
import { getBlogPosts, formatDatum } from "@/lib/blog";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const naam = s.naam || "Specified";
  return {
    title: `Blog - ${naam}`,
    description: "Inzichten, tips en verhalen over engineering, consultancy en carrière.",
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogIndex() {
  const [posts, settings] = await Promise.all([getBlogPosts(), getSettings()]);

  return (
    <>
      <Nav />
      <main id="inhoud">
        <section className="pagina">
          <div className="pagina__inner">
            <div className="pagina__kop">
              <h1 className="pagina__titel">Blog</h1>
              <p className="pagina__intro">Inzichten, tips en verhalen over engineering, consultancy en carrière.</p>
            </div>

            {posts.length === 0 ? (
              <p className="pagina__leeg">Binnenkort verschijnen hier de eerste artikels.</p>
            ) : (
              <div className="blog-grid">
                {posts.map((post, i) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="blog-kaart">
                    {post.coverUrl && (
                      <div className="blog-beeld">
                        <Cover src={post.coverUrl} alt={post.titel} sizes="(min-width: 900px) 33vw, 100vw" priority={i === 0} />
                      </div>
                    )}
                    <div className="blog-kaart__tekst">
                      {post.publicatiedatum && <span className="blog-datum">{formatDatum(post.publicatiedatum)}</span>}
                      <h2 className="blog-kaart__titel">{post.titel}</h2>
                      {post.samenvatting && <p className="blog-kaart__samenvatting">{post.samenvatting}</p>}
                      <span className="blog-kaart__lees">Lees artikel</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer linkedin={settings.linkedin} footerTekst={settings.footer_tekst} />
    </>
  );
}
