import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getBlogPosts, formatDatum } from "@/lib/blog";
import { getSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const naam = s.naam || "Specified";
  return {
    title: `Blog — ${naam}`,
    description: "Inzichten, tips en verhalen over engineering, carrière en recruitment.",
    alternates: { canonical: "/blog" },
  };
}

export default async function BlogIndex() {
  const [posts, settings] = await Promise.all([getBlogPosts(), getSettings()]);

  return (
    <>
      <Nav />
      <main>
        <section style={{ paddingTop: "calc(72px + 4rem)", paddingBottom: "6rem", minHeight: "100svh" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.5rem, 5vw, 4rem)" }}>
            <h1
              className="vac-title"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(4rem, 9vw, 8rem)",
                fontWeight: 400,
                letterSpacing: "0.01em",
                lineHeight: 0.95,
                color: "var(--white)",
                marginBottom: "1.5rem",
              }}
            >
              Blog
            </h1>
            <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "520px", lineHeight: 1.6, marginBottom: "3.5rem" }}>
              Inzichten, tips en verhalen over engineering, carrière en recruitment.
            </p>

            {posts.length === 0 ? (
              <p style={{ color: "var(--muted)", padding: "2rem 0" }}>
                Binnenkort verschijnen hier de eerste artikels.
              </p>
            ) : (
              <div className="blog-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      textDecoration: "none",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      backgroundColor: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {post.coverUrl && (
                      <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.coverUrl}
                          alt={post.titel}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {post.publicatiedatum && (
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--lime)" }}>
                          {formatDatum(post.publicatiedatum)}
                        </span>
                      )}
                      <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.9rem", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.05, color: "var(--white)" }}>
                        {post.titel}
                      </h2>
                      {post.samenvatting && (
                        <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.65 }}>{post.samenvatting}</p>
                      )}
                      <span style={{ color: "var(--lime)", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.25rem" }}>
                        Lees artikel
                      </span>
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
