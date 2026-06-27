"use client";

import { useState, useTransition } from "react";
import { addActiviteit } from "@/app/(app)/dashboard/kandidaten/[id]/addActivity";

const LIME = "#dffd7b";
const S1 = "#27272a";
const S2 = "#323236";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.4)";
const TEXT = "#f0f0f0";

const TYPE_OPTIONS = [
  { label: "📧 E-mail", value: "email" },
  { label: "📞 Telefoon", value: "telefoon" },
  { label: "📅 Meeting", value: "meeting" },
  { label: "📝 Notitie", value: "notitie" },
];

const RICHTING_OPTIONS = [
  { label: "↑ Uitgaand", value: "uitgaand" },
  { label: "↓ Inkomend", value: "inkomend" },
];

const inputStyle: React.CSSProperties = {
  background: S1, border: `1px solid ${S2}`, borderRadius: "4px",
  color: TEXT, fontSize: "0.85rem", padding: "0.45rem 0.65rem",
  fontFamily: "inherit", width: "100%", outline: "none",
};
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666" }}>
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
  const [isPending, startTransition] = useTransition();

  const showRichting = type === "email";
  const showVanNaar = type === "email";

  function reset() {
    setType("email"); setRichting("uitgaand"); setDatum(now);
    setOnderwerp(""); setInhoud("");
    setVan(defaultVan ?? "tom@specified.be");
    setNaar(defaultNaar ?? "");
    setDone(false);
  }

  function handleSave() {
    if (!onderwerp.trim()) return;
    startTransition(async () => {
      await addActiviteit({
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
      setTimeout(() => { setDone(false); setOpen(false); reset(); }, 1200);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: "block", width: "100%", textAlign: "center", padding: "0.5rem", borderRadius: "4px", background: "transparent", color: "#666", fontSize: "0.78rem", fontWeight: 600, border: `1px solid rgba(255,255,255,0.06)`, cursor: "pointer", fontFamily: "inherit" }}
      >
        + Activiteit toevoegen
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(2px)" }} />}

      <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: "420px", background: "#1e1e21", borderLeft: `1px solid ${BORDER}`, zIndex: 50, display: "flex", flexDirection: "column", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)" }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Activiteit toevoegen</div>
          <button onClick={() => { setOpen(false); reset(); }} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "1.2rem", padding: "0.25rem" }}>✕</button>
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
                  style={{ padding: "0.45rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", border: `1px solid ${type === o.value ? `${LIME}60` : S2}`, background: type === o.value ? `${LIME}14` : S1, color: type === o.value ? LIME : MUTED, transition: "all 0.15s" }}
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
                    style={{ padding: "0.45rem 0.5rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit", cursor: "pointer", border: `1px solid ${richting === o.value ? `${LIME}60` : S2}`, background: richting === o.value ? `${LIME}14` : S1, color: richting === o.value ? LIME : MUTED, transition: "all 0.15s" }}
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
        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button
            onClick={handleSave}
            disabled={isPending || !onderwerp.trim()}
            style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "4px", background: done ? "#34d399" : onderwerp.trim() ? LIME : "#333", color: done ? "#fff" : "#1e1e21", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: isPending || !onderwerp.trim() ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}
          >
            {isPending ? "Opslaan…" : done ? "✓ Toegevoegd" : "Opslaan"}
          </button>
          <button
            onClick={() => { setOpen(false); reset(); }}
            style={{ padding: "0.6rem 1rem", borderRadius: "4px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.82rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}
          >
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
