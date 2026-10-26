import Link from "next/link";
import Cover from "@/components/Cover";
import { formatDatum, type BlogPost } from "@/lib/blog";

/**
 * Het artikel zelf: datum, titel, samenvatting, cover en tekst. Gedeeld door
 * de echte pagina (app/blog/[slug]) en het live voorbeeld in het CMS
 * (app/blog/voorbeeld), zodat het voorbeeld nooit afwijkt van de site.
 */
export default function ArtikelWeergave({ post }: { post: BlogPost }) {
  return (
    <article style={{ paddingTop: "calc(72px + 4rem)", paddingBottom: "6rem" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 clamp(1.5rem, 5vw, 4rem)" }}>
        <Link href="/blog" style={{ color: "var(--muted)", fontSize: "0.85rem", textDecoration: "none" }}>
          Terug naar blog
        </Link>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center", margin: "2rem 0 1rem", flexWrap: "wrap" }}>
          {post.publicatiedatum && (
            <span style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0", color: "var(--lime)" }}>
              {formatDatum(post.publicatiedatum)}
            </span>
          )}
          {post.auteurNaam && <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>door {post.auteurNaam}</span>}
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
          <p style={{ color: "var(--bone-soft)", fontSize: "1.1rem", lineHeight: 1.65, marginBottom: "2.5rem" }}>
            {post.samenvatting}
          </p>
        )}

        {post.coverUrl && (
          <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden", borderRadius: 0, marginBottom: "3rem" }}>
            <Cover src={post.coverUrl} alt={post.titel} sizes="(min-width: 900px) 800px, 100vw" priority />
          </div>
        )}

        <div className="blog-inhoud" dangerouslySetInnerHTML={{ __html: post.inhoudHtml }} />
      </div>
    </article>
  );
}
