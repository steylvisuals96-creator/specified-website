"use client";

import { knopPrimair } from "@/lib/knoppen";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBedrijf } from "@/app/(app)/dashboard/actions/create";

const LIME = "#dffd7b";
const S1 = "var(--ink-800)";
const S2 = "var(--olive-600)";
const BORDER = "var(--line)";
const MUTED = "var(--bone-400)";
const TEXT = "var(--bone-100)";

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

const STATUS_OPTIONS = [
  { label: "Prospect", value: "prospect" },
  { label: "Actief", value: "actief" },
  { label: "Slapend", value: "slapend" },
  { label: "Voormalig", value: "voormalig" },
];

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)" }}>
        {label}{required && <span style={{ color: LIME, marginLeft: "0.25rem" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: S1, border: `1px solid ${S2}`, borderRadius: "2px",
  color: TEXT, fontSize: "0.875rem", padding: "0.45rem 0.65rem",
  fontFamily: "inherit", width: "100%", outline: "none",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

const empty = { naam: "", sector: "", contactpersoon: "", email: "", telefoon: "", website: "", locatie: "", relatiestatus: "actief" };

export default function BedrijfCreateDrawer() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set(key: string, value: string) {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCreate() {
    if (!form.naam) { setError("Bedrijfsnaam is verplicht."); return; }
    startTransition(async () => {
      const result = await createBedrijf(form);
      setForm({ ...empty });
      setOpen(false);
      router.push(`/dashboard/bedrijven/${result.id}`);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={knopPrimair}
      >
        Bedrijf toevoegen
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgb(20 20 14 / 0.72)", zIndex: 40, backdropFilter: "blur(2px)" }} />}

      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "440px",
        background: "var(--ink-900)", borderLeft: `1px solid ${BORDER}`,
        zIndex: 50, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Bedrijf toevoegen</div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "var(--bone-400)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <Field label="Bedrijfsnaam" required><input style={inputStyle} value={form.naam} onChange={(e) => set("naam", e.target.value)} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Sector">
              <select style={selectStyle} value={form.sector} onChange={(e) => set("sector", e.target.value)}>
                <option value="">— Sector —</option>
                {SECTOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Relatiestatus">
              <select style={selectStyle} value={form.relatiestatus} onChange={(e) => set("relatiestatus", e.target.value)}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Contactpersoon"><input style={inputStyle} value={form.contactpersoon} onChange={(e) => set("contactpersoon", e.target.value)} /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="E-mail"><input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Telefoon"><input style={inputStyle} value={form.telefoon} onChange={(e) => set("telefoon", e.target.value)} /></Field>
          </div>
          <Field label="Website"><input style={inputStyle} placeholder="https://..." value={form.website} onChange={(e) => set("website", e.target.value)} /></Field>
          <Field label="Locatie"><input style={inputStyle} value={form.locatie} onChange={(e) => set("locatie", e.target.value)} /></Field>
          {error && <div style={{ fontSize: "0.875rem", color: "#d98f8f" }}>{error}</div>}
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={handleCreate} disabled={isPending} style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "2px", background: LIME, color: "var(--ink-900)", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit" }}>
            {isPending ? "Toevoegen…" : "Bedrijf toevoegen"}
          </button>
          <button onClick={() => setOpen(false)} style={{ padding: "0.6rem 1rem", borderRadius: "2px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.875rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}>
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
