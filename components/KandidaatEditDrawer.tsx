"use client";

import { useState, useTransition } from "react";
import { updateKandidaat } from "@/app/(app)/dashboard/kandidaten/[id]/actions";

const LIME = "#dffd7b";
const DARK = "#1e1e21";
const S1 = "#27272a";
const S2 = "#323236";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.4)";
const TEXT = "#f0f0f0";

const SECTOR_OPTIONS = [
  { label: "Civiele techniek", value: "civiel" },
  { label: "Elektrotechniek", value: "elektro" },
  { label: "Werktuigbouwkunde", value: "werktuig" },
  { label: "IT & Software", value: "it" },
  { label: "Bouw & Infrastructuur", value: "bouw" },
  { label: "Energie & Utilities", value: "energie" },
  { label: "Industrie & Productie", value: "industrie" },
  { label: "Projectmanagement", value: "projectmanagement" },
];

const NIVEAU_OPTIONS = [
  { label: "Junior (0–2 jaar)", value: "junior" },
  { label: "Medior (2–5 jaar)", value: "medior" },
  { label: "Senior (5+ jaar)", value: "senior" },
  { label: "Lead / Expert", value: "lead" },
];

const BESCHIKBAARHEID_OPTIONS = [
  { label: "Onmiddellijk", value: "onmiddellijk" },
  { label: "1 maand opzeg", value: "1_maand" },
  { label: "3 maanden opzeg", value: "3_maanden" },
  { label: "Passief zoekend", value: "passief" },
];

const STATUS_OPTIONS = [
  { label: "Nieuw", value: "nieuw" },
  { label: "Gescreend", value: "gescreend" },
  { label: "In gesprek", value: "in_gesprek" },
  { label: "Voorgesteld aan klant", value: "voorgesteld" },
  { label: "Interview bij klant", value: "interview_klant" },
  { label: "Geplaatst", value: "geplaatst" },
  { label: "Niet weerhouden", value: "afgewezen" },
  { label: "On hold", value: "on_hold" },
];

const BRON_OPTIONS = [
  { label: "LinkedIn", value: "linkedin" },
  { label: "Website", value: "website" },
  { label: "Aanbeveling", value: "aanbeveling" },
  { label: "Netwerk", value: "netwerk" },
  { label: "Jobboard", value: "jobboard" },
  { label: "Spontane sollicitatie", value: "spontaan" },
];

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

const inputStyle: React.CSSProperties = {
  background: S1,
  border: `1px solid ${S2}`,
  borderRadius: "4px",
  color: TEXT,
  fontSize: "0.85rem",
  padding: "0.45rem 0.65rem",
  fontFamily: "inherit",
  width: "100%",
  outline: "none",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

export type KandidaatData = {
  voornaam?: string;
  achternaam?: string;
  email?: string;
  telefoon?: string;
  sector?: string;
  ervaringsniveau?: string;
  beschikbaarheid?: string;
  functietitel?: string;
  huidige_werkgever?: string;
  jaren_ervaring?: number | null;
  linkedin?: string;
  status?: string;
  gewenst_salaris?: string;
  notities?: string;
  bron?: string;
};

export default function KandidaatEditDrawer({
  id,
  initial,
  autoOpen,
}: {
  id: string;
  initial: KandidaatData;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(autoOpen ?? false);
  const [form, setForm] = useState<KandidaatData>(initial);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set(key: keyof KandidaatData, value: any) {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateKandidaat(id, form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        style={{ display: "block", width: "100%", textAlign: "center", padding: "0.5rem", borderRadius: "4px", background: `${LIME}14`, color: LIME, fontSize: "0.78rem", fontWeight: 600, border: `1px solid ${LIME}30`, cursor: "pointer", fontFamily: "inherit" }}
      >
        ✏️ Bewerken
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "420px",
        background: "#1e1e21", borderLeft: `1px solid ${BORDER}`,
        zIndex: 50, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Kandidaat bewerken</div>
            <div style={{ fontSize: "0.73rem", color: "#555", marginTop: "0.1rem" }}>{form.voornaam} {form.achternaam}</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        {/* Form */}
        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          {/* Naam */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Voornaam">
              <input style={inputStyle} value={form.voornaam ?? ""} onChange={(e) => set("voornaam", e.target.value)} />
            </Field>
            <Field label="Achternaam">
              <input style={inputStyle} value={form.achternaam ?? ""} onChange={(e) => set("achternaam", e.target.value)} />
            </Field>
          </div>

          {/* Contact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="E-mail">
              <input style={inputStyle} type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
            </Field>
            <Field label="Telefoon">
              <input style={inputStyle} value={form.telefoon ?? ""} onChange={(e) => set("telefoon", e.target.value)} />
            </Field>
          </div>

          {/* Pipeline status */}
          <Field label="Pipeline status">
            <select style={selectStyle} value={form.status ?? ""} onChange={(e) => set("status", e.target.value)}>
              <option value="">— Kies status —</option>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          {/* Sector + Niveau */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Sector">
              <select style={selectStyle} value={form.sector ?? ""} onChange={(e) => set("sector", e.target.value)}>
                <option value="">— Sector —</option>
                {SECTOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Niveau">
              <select style={selectStyle} value={form.ervaringsniveau ?? ""} onChange={(e) => set("ervaringsniveau", e.target.value)}>
                <option value="">— Niveau —</option>
                {NIVEAU_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          {/* Beschikbaarheid */}
          <Field label="Beschikbaarheid">
            <select style={selectStyle} value={form.beschikbaarheid ?? ""} onChange={(e) => set("beschikbaarheid", e.target.value)}>
              <option value="">— Beschikbaarheid —</option>
              {BESCHIKBAARHEID_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          {/* Functie + werkgever */}
          <Field label="Huidige functietitel">
            <input style={inputStyle} value={form.functietitel ?? ""} onChange={(e) => set("functietitel", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Huidige werkgever">
              <input style={inputStyle} value={form.huidige_werkgever ?? ""} onChange={(e) => set("huidige_werkgever", e.target.value)} />
            </Field>
            <Field label="Jaren ervaring">
              <input style={inputStyle} type="number" min={0} max={50} value={form.jaren_ervaring ?? ""} onChange={(e) => set("jaren_ervaring", e.target.value ? Number(e.target.value) : null)} />
            </Field>
          </div>

          {/* Salaris + bron */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Gewenst salaris">
              <input style={inputStyle} placeholder="bv. €4.500/maand" value={form.gewenst_salaris ?? ""} onChange={(e) => set("gewenst_salaris", e.target.value)} />
            </Field>
            <Field label="Herkomst">
              <select style={selectStyle} value={form.bron ?? ""} onChange={(e) => set("bron", e.target.value)}>
                <option value="">— Bron —</option>
                {BRON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          {/* LinkedIn */}
          <Field label="LinkedIn URL">
            <input style={inputStyle} placeholder="https://linkedin.com/in/..." value={form.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} />
          </Field>

          {/* Notities */}
          <Field label="Interne notities">
            <textarea
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical", lineHeight: 1.6 }}
              value={form.notities ?? ""}
              onChange={(e) => set("notities", e.target.value)}
            />
          </Field>
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "4px", background: saved ? "#34d399" : LIME, color: "#1e1e21", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}
          >
            {isPending ? "Opslaan…" : saved ? "✓ Opgeslagen" : "Opslaan"}
          </button>
          <button
            onClick={() => { setForm(initial); setOpen(false); }}
            style={{ padding: "0.6rem 1rem", borderRadius: "4px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.82rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}
          >
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
