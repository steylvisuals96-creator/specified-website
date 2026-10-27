"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FormShell, { SaveBtn } from "./FormShell";

const WEBSITE = process.env.NEXT_PUBLIC_WEBSITE_URL ?? "https://specified-website.vercel.app";

type Veld = { label: string; max: number; lang?: boolean };

/** De teksten die op de pagina aanklikbaar zijn (data-bewerk op de website). */
const VELDEN: Record<string, Veld> = {
  "hero.prefix": { label: "Eerste woord van de kop", max: 20 },
  "hero.woord": { label: "Accentwoord (in limoen)", max: 24 },
  "hero.suffix": { label: "Tweede regel van de kop", max: 30 },
  "hero.ctaBedrijven": { label: "Knop voor bedrijven", max: 40 },
  "hero.ctaEngineers": { label: "Knop voor engineers", max: 40 },
  "tekening.intro": { label: "Inleiding", max: 140, lang: true },
  "tekening.scrollHint": { label: "Scrollhint", max: 60 },
  "consultants.titel": { label: "Titel", max: 20 },
  "consultants.accent": { label: "Accentwoord (in limoen)", max: 24 },
  "consultants.tekst": { label: "Tekst", max: 220, lang: true },
  "diensten_bedrijven.kop": { label: "Kop", max: 30 },
  "diensten_bedrijven.titel": { label: "Titel", max: 60 },
  "diensten_bedrijven.tekst": { label: "Tekst", max: 450, lang: true },
  "diensten_bedrijven.cta": { label: "Knop", max: 40 },
  "diensten_engineers.kop": { label: "Kop", max: 30 },
  "diensten_engineers.titel": { label: "Titel", max: 60 },
  "diensten_engineers.tekst": { label: "Tekst", max: 450, lang: true },
  "diensten_engineers.cta": { label: "Knop", max: 40 },
  "jobs.titel": { label: "Titel vacatures", max: 40 },
  "jobs.linkTekst": { label: "Link naar alle vacatures", max: 40 },
};

function haal(obj: any, pad: string): string {
  const v = pad.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  return typeof v === "string" ? v : "";
}

function zet(obj: any, pad: string, waarde: string) {
  const kopie = structuredClone(obj ?? {});
  const delen = pad.split(".");
  let o = kopie;
  delen.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
  o[delen[delen.length - 1]] = waarde;
  return kopie;
}

const BREEDTES = [
  { naam: "Desktop", breedte: "100%" },
  { naam: "Tablet", breedte: "768px" },
  { naam: "Mobiel", breedte: "390px" },
];

const invoer: React.CSSProperties = {
  background: "var(--ink-800)", border: "1px solid rgba(255,255,255,0.14)", color: "var(--bone-100)",
  borderRadius: "2px", padding: "0.55rem 0.75rem", fontSize: "0.9rem", fontFamily: "inherit", width: "100%",
};

/**
 * De homepage zoals bezoekers hem zien, met klikbare teksten. Een klik opent
 * een pop-up om die tekst aan te passen; het voorbeeld verandert meteen en
 * "Opslaan" zet het live. De website kent geen login: dit scherm (dat die wel
 * heeft) stuurt de gegevens naar de voorbeeldpagina in het frame.
 */
export default function PaginaEditor({
  begin, userName, rol, opslaan,
}: {
  begin: Record<string, any>;
  userName: string;
  rol?: string | null;
  opslaan: (data: Record<string, any>) => Promise<{ ok: boolean; fout?: string }>;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const klaar = useRef(false);
  const laatste = useRef("");
  const origin = useMemo(() => new URL(WEBSITE).origin, []);
  const [data, setData] = useState(begin);
  const [bewaard, setBewaard] = useState(JSON.stringify(begin));
  const [breedte, setBreedte] = useState("100%");
  const [popup, setPopup] = useState<{ velden: string[]; waarden: Record<string, string> } | null>(null);
  const [melding, setMelding] = useState<{ soort: "ok" | "fout"; tekst: string } | null>(null);
  const [bezig, setBezig] = useState(false);

  const gewijzigd = JSON.stringify(data) !== bewaard;

  // Klik op een tekst in de pagina: pop-up openen.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== origin || e.source !== frame.current?.contentWindow) return;
      const m = e.data;
      if (m?.type === "payload-live-preview" && m.ready) {
        klaar.current = true;
        laatste.current = "";
      }
      if (m?.type === "specified-bewerken" && m.actie === "kies" && Array.isArray(m.velden)) {
        const velden = (m.velden as string[]).filter((v) => VELDEN[v]);
        if (velden.length === 0) return;
        setMelding(null);
        setPopup({ velden, waarden: Object.fromEntries(velden.map((v) => [v, haal(dataRef.current, v)])) });
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [origin]);

  const dataRef = useRef(data);
  dataRef.current = data;

  // De huidige teksten naar de pagina sturen; opnieuw tot de pagina zich gemeld heeft.
  useEffect(() => {
    let pogingen = 0;
    const stuur = () => {
      const json = JSON.stringify(dataRef.current);
      const wacht = !klaar.current && pogingen < 60;
      if (json === laatste.current && !wacht) return;
      if (wacht) pogingen++;
      laatste.current = json;
      frame.current?.contentWindow?.postMessage({ type: "payload-live-preview", data: dataRef.current }, origin);
    };
    stuur();
    const t = setInterval(stuur, 350);
    return () => clearInterval(t);
  }, [origin]);

  // Niet-opgeslagen wijzigingen: browser waarschuwt bij weggaan.
  useEffect(() => {
    if (!gewijzigd) return;
    const f = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [gewijzigd]);

  useEffect(() => {
    if (!popup) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && setPopup(null);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [popup]);

  const toepassen = () => {
    if (!popup) return;
    setData((d) => popup.velden.reduce((acc, v) => zet(acc, v, popup.waarden[v].trim()), d));
    setPopup(null);
  };

  const bewaren = async () => {
    setBezig(true);
    setMelding(null);
    const r = await opslaan(data);
    setBezig(false);
    if (r.ok) {
      setBewaard(JSON.stringify(data));
      setMelding({ soort: "ok", tekst: "Opgeslagen. De site toont het binnen een minuut." });
    } else {
      setMelding({ soort: "fout", tekst: `Niet opgeslagen: ${r.fout}` });
    }
  };

  return (
    <FormShell
      wide
      activePath="/dashboard/homepage"
      userName={userName}
      rol={rol}
      title="Homepage: op de pagina bewerken"
      backHref="/dashboard/homepage"
      actions={
        <button
          type="button"
          onClick={bewaren}
          disabled={!gewijzigd || bezig}
          style={{
            background: gewijzigd && !bezig ? "#dffd7b" : "rgba(223,253,123,0.25)", color: "var(--ink-900)", border: "none",
            borderRadius: "2px", padding: "0.55rem 1.25rem", fontWeight: 700, fontSize: "0.875rem",
            cursor: gewijzigd && !bezig ? "pointer" : "default", fontFamily: "inherit",
          }}
        >
          {bezig ? "Bezig…" : "Opslaan"}
        </button>
      }
    >
      <div style={{ padding: "1rem 2rem 2rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--bone-400)" }}>
            Klik op een tekst om hem aan te passen. {gewijzigd ? "Er zijn niet-opgeslagen wijzigingen." : ""}
          </span>
          <span style={{ flex: 1 }} />
          {BREEDTES.map((b) => (
            <button
              key={b.naam}
              type="button"
              onClick={() => setBreedte(b.breedte)}
              style={{
                background: breedte === b.breedte ? "#dffd7b" : "transparent",
                color: breedte === b.breedte ? "var(--ink-900)" : "var(--bone-400)",
                border: "1px solid var(--line)", borderRadius: "2px", padding: "0.25rem 0.7rem",
                fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {b.naam}
            </button>
          ))}
        </div>
        {melding && (
          <p
            role={melding.soort === "fout" ? "alert" : "status"}
            style={{
              background: melding.soort === "ok" ? "rgba(155,209,127,0.12)" : "rgba(239,68,68,0.12)",
              border: `1px solid ${melding.soort === "ok" ? "#9bd17f66" : "#ef444466"}`,
              color: melding.soort === "ok" ? "#9bd17f" : "#f87171",
              padding: "0.6rem 0.9rem", borderRadius: "2px", fontSize: "0.875rem", marginBottom: "0.75rem",
            }}
          >
            {melding.tekst}
          </p>
        )}
        <div style={{ background: "#1b1b1d", border: "1px solid var(--line)", display: "flex", justifyContent: "center", height: "calc(100vh - 12rem)", overflow: "auto" }}>
          <iframe
            ref={frame}
            src={`${WEBSITE}/voorbeeld/home?bewerken=1`}
            title="De homepage"
            style={{ width: breedte, maxWidth: "100%", height: "100%", border: 0, background: "#fff" }}
          />
        </div>
      </div>

      {popup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tekst aanpassen"
          onClick={(e) => e.target === e.currentTarget && setPopup(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 100, padding: "1rem" }}
        >
          <form
            onSubmit={(e) => { e.preventDefault(); toepassen(); }}
            style={{ background: "var(--ink-900)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: "2px", padding: "1.5rem", width: "min(520px, 100%)", maxHeight: "90vh", overflow: "auto" }}
          >
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#dffd7b", marginBottom: "1rem" }}>Tekst aanpassen</div>
            {popup.velden.map((v, i) => {
              const veld = VELDEN[v];
              const waarde = popup.waarden[v];
              const zetWaarde = (x: string) => setPopup((p) => p && { ...p, waarden: { ...p.waarden, [v]: x } });
              return (
                <label key={v} style={{ display: "block", marginBottom: "1rem" }}>
                  <span style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)", marginBottom: "0.35rem" }}>
                    {veld.label}
                    <span style={{ fontWeight: 400, color: waarde.length >= veld.max ? "#f87171" : "var(--bone-600)" }}>{waarde.length}/{veld.max}</span>
                  </span>
                  {veld.lang ? (
                    <textarea autoFocus={i === 0} rows={5} maxLength={veld.max} value={waarde} onChange={(e) => zetWaarde(e.target.value)} style={{ ...invoer, resize: "vertical", lineHeight: 1.6 }} />
                  ) : (
                    <input autoFocus={i === 0} maxLength={veld.max} value={waarde} onChange={(e) => zetWaarde(e.target.value)} style={invoer} />
                  )}
                </label>
              );
            })}
            <p style={{ fontSize: "0.75rem", color: "var(--bone-600)", margin: "0 0 1rem" }}>Een leeg veld toont de standaardtekst van de website.</p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setPopup(null)} style={{ background: "transparent", color: "var(--bone-400)", border: "1px solid var(--line)", borderRadius: "2px", padding: "0.5rem 1rem", fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit" }}>
                Annuleren
              </button>
              <SaveBtn label="Toepassen" />
            </div>
          </form>
        </div>
      )}
    </FormShell>
  );
}
