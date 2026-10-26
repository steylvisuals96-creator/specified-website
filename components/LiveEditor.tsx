"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { htmlToLexical } from "@/lib/lexical";
import { unflatten } from "@/lib/vormdata";

const WEBSITE = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://specified-website.vercel.app";

export type EditorSoort = "blog" | "team" | "homepage";

const BREEDTES = [
  { naam: "Desktop", breedte: "100%" },
  { naam: "Tablet", breedte: "768px" },
  { naam: "Mobiel", breedte: "390px" },
];

/** Vertaalt de velden van het formulier naar wat de voorbeeldpagina op de website verwacht. */
function maakData(soort: EditorSoort, fd: FormData) {
  const data = unflatten(fd.entries() as Iterable<[string, unknown]>);
  const leegAlsNull = (...velden: string[]) => velden.forEach((v) => data[v] === "" && (data[v] = null));
  if (soort === "blog") {
    data.inhoud = htmlToLexical(typeof data.inhoud === "string" ? data.inhoud : "");
    leegAlsNull("cover", "auteur");
  }
  if (soort === "team") leegAlsNull("foto");
  return data;
}

/**
 * Het formulier links, de echte website rechts. Elke wijziging in het
 * formulier gaat meteen naar de voorbeeldpagina van de website (zelfde
 * berichten als Payloads live preview). We kijken elke 350 ms naar het
 * formulier in plaats van naar invoer-events, want de tekstverwerker en de
 * uploadknop zetten hun waarde via React en geven geen browserevent.
 */
export default function LiveEditor({
  soort,
  voorbeeldPad,
  children,
}: {
  soort: EditorSoort;
  voorbeeldPad: string;
  children: React.ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const laatste = useRef("");
  const klaarRef = useRef(false);
  const [breedte, setBreedte] = useState("100%");
  const origin = useMemo(() => new URL(WEBSITE).origin, []);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "payload-live-preview" && e.data.ready) {
        // Pagina (opnieuw) geladen: de volgende ronde stuurt alles opnieuw.
        laatste.current = "";
        klaarRef.current = true;
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin]);

  useEffect(() => {
    // De website meldt zich pas als hij geladen is, en dat kan vóór dit
    // scherm klaar is met laden. Tot de melding binnen is sturen we daarom
    // elke ronde opnieuw (maximaal 60 keer); de voorbeeldpagina negeert wat
    // ze nog niet kan ontvangen.
    let pogingen = 0;
    const stuur = () => {
      const form = wrap.current?.querySelector("form");
      if (!form) return;
      const data = maakData(soort, new FormData(form));
      const json = JSON.stringify(data);
      const wacht = !klaarRef.current && pogingen < 60;
      if (json === laatste.current && !wacht) return;
      if (wacht) pogingen++;
      laatste.current = json;
      frame.current?.contentWindow?.postMessage(
        { type: "payload-live-preview", collectionSlug: soort === "homepage" ? undefined : soort, data },
        origin,
      );
    };
    stuur();
    const t = setInterval(stuur, 350);
    return () => clearInterval(t);
  }, [soort, origin]);

  return (
    <>
      <style>{`
        .live-editor { display: grid; grid-template-columns: minmax(340px, 500px) minmax(0, 1fr); gap: 1.5rem; align-items: start; padding: 1.5rem 2rem 3rem; }
        .live-editor__voorbeeld { position: sticky; top: 5.5rem; }
        .live-editor__kader { height: calc(100vh - 11rem); }
        @media (max-width: 1100px) {
          .live-editor { grid-template-columns: 1fr; padding: 1rem; }
          .live-editor__voorbeeld { position: static; }
          .live-editor__kader { height: 70vh; }
        }
      `}</style>
      <div className="live-editor">
        <div ref={wrap}>{children}</div>
        <div className="live-editor__voorbeeld">
          <div style={{ display: "flex", gap: "0.35rem", marginBottom: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", marginRight: "0.5rem" }}>Voorbeeld</span>
            {BREEDTES.map((b) => (
              <button
                key={b.naam}
                type="button"
                onClick={() => setBreedte(b.breedte)}
                style={{
                  background: breedte === b.breedte ? "#dffd7b" : "transparent",
                  color: breedte === b.breedte ? "var(--ink-900)" : "var(--bone-400)",
                  border: "1px solid var(--line)",
                  borderRadius: "2px",
                  padding: "0.25rem 0.7rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {b.naam}
              </button>
            ))}
          </div>
          <div
            className="live-editor__kader"
            style={{ background: "#1b1b1d", border: "1px solid var(--line)", display: "flex", justifyContent: "center", overflow: "auto" }}
          >
            <iframe
              ref={frame}
              src={`${WEBSITE}${voorbeeldPad}`}
              title="Voorbeeld van de website"
              style={{ width: breedte, maxWidth: "100%", height: "100%", border: 0, background: "#fff" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
