"use client";

import { useEffect, useRef, useState } from "react";
import { mapPost, formatDatum } from "@/lib/blog";
import { CMS_URL } from "@/lib/settings";

const CMS_ORIGIN = (() => {
  try {
    return new URL(CMS_URL).origin;
  } catch {
    return "";
  }
})();

/**
 * Luistert naar de berichten van het Payload-formulier (zelfde protocol als
 * @payloadcms/live-preview-react). Die bibliotheek haalt de relaties op met
 * de login van de bewerker, maar de cookie gaat niet mee naar een ander
 * domein. Auteur en cover zijn publiek leesbaar, dus die halen we zelf op.
 */
function useVoorbeeld() {
  const [data, setData] = useState<any>(null);
  const [wacht, setWacht] = useState(true);
  const cache = useRef(new Map<string, any>());

  useEffect(() => {
    async function haal(collectie: string, id: unknown) {
      if (typeof id !== "string" && typeof id !== "number") return id;
      const sleutel = `${collectie}/${id}`;
      if (!cache.current.has(sleutel)) {
        const doc = await fetch(`${CMS_URL}/api/${collectie}/${id}?depth=0`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null);
        cache.current.set(sleutel, doc);
      }
      return cache.current.get(sleutel);
    }

    async function onMessage(e: MessageEvent) {
      if (e.origin !== CMS_ORIGIN || e.data?.type !== "payload-live-preview" || !e.data.data) return;
      const d = { ...e.data.data };
      const [auteur, cover] = await Promise.all([haal("team", d.auteur), haal("media", d.cover)]);
      setData({ ...d, auteur, cover });
      setWacht(false);
    }

    window.addEventListener("message", onMessage);
    // Zonder dit bericht weet het CMS niet dat de pagina klaar is om te ontvangen.
    window.parent?.postMessage({ type: "payload-live-preview", ready: true }, CMS_ORIGIN);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return { data, wacht };
}

/**
 * Het live voorbeeld van een blogartikel. Het CMS toont deze pagina in een
 * iframe en stuurt bij elke toetsaanslag de inhoud van het formulier door.
 * Zelfde opmaak als app/blog/[slug]/page.tsx, zonder navigatie en voettekst.
 */
export default function VoorbeeldClient() {
  const { data, wacht } = useVoorbeeld();

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
