"use client";

import { mapPost, formatDatum } from "@/lib/blog";
import { useVoorbeeld } from "@/lib/useVoorbeeld";

const RELATIES = { auteur: "team", cover: "media" };

/**
 * Het live voorbeeld van een blogartikel. Het CMS toont deze pagina in een
 * iframe en stuurt bij elke toetsaanslag de inhoud van het formulier door.
 * Zelfde opmaak als app/blog/[slug]/page.tsx, zonder navigatie en voettekst.
 */
export default function VoorbeeldClient() {
  const { data, wacht } = useVoorbeeld(RELATIES);

  if (!data?.titel && !data?.inhoud) {
    return (
      <main id="inhoud">
        <p className="blog-artikel__inner" style={{ padding: "3rem 1.5rem" }}>
          {wacht ? "Voorbeeld laden…" : "Begin te typen, het voorbeeld verschijnt hier."}
        </p>
      </main>
    );
  }

  const post = mapPost(data);

  return (
    <main id="inhoud">
      <article className="blog-artikel">
        <div className="blog-artikel__inner">
          <div className="blog-artikel__meta">
            {post.publicatiedatum && <span className="blog-datum">{formatDatum(post.publicatiedatum)}</span>}
            {post.auteurNaam && <span className="blog-auteur">door {post.auteurNaam}</span>}
          </div>

          <h1 className="blog-titel">{post.titel}</h1>

          {post.samenvatting && <p className="blog-artikel__samenvatting">{post.samenvatting}</p>}

          {post.coverUrl && (
            <div className="blog-beeld blog-artikel__beeld">
              {/* Gewone img: een nog niet bewaarde externe URL staat niet in remotePatterns. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.coverUrl} alt={post.titel} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          )}

          <div className="blog-inhoud" dangerouslySetInnerHTML={{ __html: post.inhoudHtml }} />
        </div>
      </article>
    </main>
  );
}
