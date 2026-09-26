"use client";

import { knopSecundair } from "@/lib/knoppen";

import { useState, useTransition } from "react";
import { addActiviteit } from "@/app/(app)/dashboard/actions/activiteit";

const LIME = "#dffd7b";
const S1 = "var(--ink-800)";
const S2 = "var(--olive-600)";
const BORDER = "var(--line)";
const MUTED = "var(--bone-400)";
const TEXT = "var(--bone-100)";

const TYPE_OPTIONS = [
  { label: "E-mail", value: "email" },
  { label: "Telefoon", value: "telefoon" },
  { label: "Afspraak", value: "meeting" },
  { label: "Notitie", value: "notitie" },
];

const RICHTING_OPTIONS = [
  { label: "Uitgaand", value: "uitgaand" },
  { label: "Inkomend", value: "inkomend" },
];

const inputStyle: React.CSSProperties = {
  background: S1, border: `1px solid ${S2}`, borderRadius: "2px",
  color: TEXT, fontSize: "0.875rem", padding: "0.45rem 0.65rem",
  fontFamily: "inherit", width: "100%", outline: "none",
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

type Props = {
  kandidaatId?: string;
  bedrijfId?: string;
  defaultVan?: string;
  defaultNaar?: string;
};

export default function ActiviteitAddDrawer({ kandidaatId, bedrijfId, defaultVan, defaultNaar }: Props) {
  const now = new Date().toISOString().slice(0, 16);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("email");
  const [richting, setRichting] = useState("uitgaand");
  const [datum, setDatum] = useState(now);
  const [onderwerp, setOnderwerp] = useState("");
  const [inhoud, setInhoud] = useState("");
  const [van, setVan] = useState(defaultVan ?? "tom@specified.be");
  const [naar, setNaar] = useState(defaultNaar ?? "");
  const [done, setDone] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const showRichting = type === "email";
  const showVanNaar = type === "email";

  function reset() {
    setType("email"); setRichting("uitgaand"); setDatum(now);
    setOnderwerp(""); setInhoud("");
    setVan(defaultVan ?? "tom@specified.be");
    setNaar(defaultNaar ?? "");
    setDone(false); setSavedId(null);
  }

  function handleSave() {
    if (!onderwerp.trim()) return;
    startTransition(async () => {
      const result = await addActiviteit({
        type,
        richting: showRichting ? richting : undefined,
        datum: new Date(datum).toISOString(),
        onderwerp: onderwerp.trim(),
        inhoud: inhoud.trim() || undefined,
        van: showVanNaar ? van : undefined,
        naar: showVanNaar ? naar : undefined,
        kandidaat: kandidaatId,
        bedrijf: bedrijfId,
      });
      setDone(true);
      if (type === "meeting" && result?.id) setSavedId(result.id);
      else setTimeout(() => { setDone(false); setOpen(false); reset(); }, 1200);
    });
  }

  function googleUrl() {
    const start = new Date(datum);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(onderwerp)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(inhoud)}`;
  }

  function outlookUrl() {
    const start = new Date(datum);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(onderwerp)}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${encodeURIComponent(inhoud)}`;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={knopSecundair}
      >
        Activiteit toevoegen
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgb(20 20 14 / 0.72)", zIndex: 40, backdropFilter: "blur(2px)" }} />}

      <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: "420px", background: "var(--ink-900)", borderLeft: `1px solid ${BORDER}`, zIndex: 50, display: "flex", flexDirection: "column", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Activiteit toevoegen</div>
          <button onClick={() => { setOpen(false); reset(); }} style={{ background: "transparent", border: "none", color: "var(--bone-400)", cursor: "pointer", fontSize: "1.2rem", padding: "0.25rem" }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>

          {/* Type selector */}
          <Field label="Type">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
              {TYPE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setType(o.value)}
                  style={{ padding: "0.45rem 0.5rem", borderRadius: "2px", fontSize: "0.875rem", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", border: `1px solid ${type === o.value ? `${LIME}60` : S2}`, background: type === o.value ? `${LIME}14` : S1, color: type === o.value ? LIME : MUTED, transition: "all 0.15s" }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Richting (only for email) */}
          {showRichting && (
            <Field label="Richting">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                {RICHTING_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setRichting(o.value)}
                    style={{ padding: "0.45rem 0.5rem", borderRadius: "2px", fontSize: "0.875rem", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", border: `1px solid ${richting === o.value ? `${LIME}60` : S2}`, background: richting === o.value ? `${LIME}14` : S1, color: richting === o.value ? LIME : MUTED, transition: "all 0.15s" }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Field>
          )}

          <Field label="Datum & tijd">
            <input style={inputStyle} type="datetime-local" value={datum} onChange={(e) => setDatum(e.target.value)} />
          </Field>

          <Field label="Onderwerp *">
            <input style={inputStyle} placeholder="bv. Telefonische screening" value={onderwerp} onChange={(e) => setOnderwerp(e.target.value)} />
          </Field>

          {showVanNaar && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="Van">
                <input style={inputStyle} type="email" value={van} onChange={(e) => setVan(e.target.value)} />
              </Field>
              <Field label="Naar">
                <input style={inputStyle} type="email" value={naar} onChange={(e) => setNaar(e.target.value)} />
              </Field>
            </div>
          )}

          <Field label="Inhoud / samenvatting">
            <textarea
              style={{ ...inputStyle, minHeight: "120px", resize: "vertical", lineHeight: 1.6 }}
              placeholder="Noteer hier de inhoud of samenvatting…"
              value={inhoud}
              onChange={(e) => setInhoud(e.target.value)}
            />
          </Field>
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, flexShrink: 0 }}>
          {/* Calendar export — shown after saving a meeting */}
          {done && type === "meeting" && (
            <div style={{ marginBottom: "0.75rem", padding: "0.75rem", background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "2px" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#9bd17f", marginBottom: "0.5rem" }}>Afspraak opgeslagen. Zet hem ook in je agenda:</div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <a href={googleUrl()} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.75rem", borderRadius: "2px", fontSize: "0.8125rem", fontWeight: 600, color: "#8fb3d9", background: "rgba(66,133,244,0.12)", border: "1px solid rgba(66,133,244,0.3)", textDecoration: "none" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#8fb3d9"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google Calendar
                </a>
                <a href={outlookUrl()} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.75rem", borderRadius: "2px", fontSize: "0.8125rem", fontWeight: 600, color: "#8fb3d9", background: "rgba(0,120,212,0.12)", border: "1px solid rgba(0,120,212,0.3)", textDecoration: "none" }}>
                  Outlook
                </a>
                {savedId && (
                  <a href={`/api/agenda/ics/${savedId}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.35rem 0.75rem", borderRadius: "2px", fontSize: "0.8125rem", fontWeight: 600, color: "var(--bone-400)", background: "var(--ink-800)", border: `1px solid ${BORDER}`, textDecoration: "none" }}>
                    Als .ics downloaden (Outlook, Apple)
                  </a>
                )}
              </div>
              <button onClick={() => { setDone(false); setOpen(false); reset(); }} style={{ marginTop: "0.6rem", background: "transparent", border: "none", color: "var(--bone-400)", fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit", padding: 0 }}>Sluiten</button>
            </div>
          )}

          {!done && (
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleSave}
                disabled={isPending || !onderwerp.trim()}
                style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "2px", background: onderwerp.trim() ? LIME : "var(--olive-600)", color: "var(--ink-900)", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: isPending || !onderwerp.trim() ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {isPending ? "Opslaan…" : "Opslaan"}
              </button>
              <button
                onClick={() => { setOpen(false); reset(); }}
                style={{ padding: "0.6rem 1rem", borderRadius: "2px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.875rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}
              >
                Annuleren
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
