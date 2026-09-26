"use client";

import { knopKlein } from "@/lib/knoppen";

import { useState, useTransition } from "react";
import { updateBedrijf } from "@/app/(app)/dashboard/bedrijven/[id]/actions";

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
];

const GROOTTE_OPTIONS = [
  { label: "Startup (< 10)", value: "startup" },
  { label: "KMO (10–50)", value: "kmo" },
  { label: "Middelgroot (50–250)", value: "middelgroot" },
  { label: "Groot (250+)", value: "groot" },
];

const STATUS_OPTIONS = [
  { label: "Prospect", value: "prospect" },
  { label: "Actieve klant", value: "actief" },
  { label: "Slapende klant", value: "slapend" },
  { label: "Voormalige klant", value: "voormalig" },
];

const inputStyle: React.CSSProperties = { background: S1, border: `1px solid ${S2}`, borderRadius: "2px", color: TEXT, fontSize: "0.875rem", padding: "0.45rem 0.65rem", fontFamily: "inherit", width: "100%", outline: "none" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)" }}>{label}</label>
      {children}
    </div>
  );
}

export type BedrijfData = {
  naam?: string; sector?: string; grootte?: string; contactpersoon?: string;
  email?: string; telefoon?: string; website?: string; locatie?: string;
  relatiestatus?: string; notities?: string;
};

export default function BedrijfEditDrawer({ id, initial }: { id: string; initial: BedrijfData }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BedrijfData>(initial);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set(key: keyof BedrijfData, value: string) {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateBedrijf(id, form);
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1000);
    });
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={knopKlein}>
        Bewerken
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgb(20 20 14 / 0.72)", zIndex: 40, backdropFilter: "blur(2px)" }} />}

      <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", width: "420px", background: "var(--ink-900)", borderLeft: `1px solid ${BORDER}`, zIndex: 50, display: "flex", flexDirection: "column", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)", overflowY: "auto" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Bedrijf bewerken</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--bone-400)", marginTop: "0.1rem" }}>{form.naam}</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "var(--bone-400)", cursor: "pointer", fontSize: "1.2rem", padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <Field label="Bedrijfsnaam"><input style={inputStyle} value={form.naam ?? ""} onChange={(e) => set("naam", e.target.value)} /></Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Sector">
              <select style={selectStyle} value={form.sector ?? ""} onChange={(e) => set("sector", e.target.value)}>
                <option value="">— Sector —</option>
                {SECTOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Grootte">
              <select style={selectStyle} value={form.grootte ?? ""} onChange={(e) => set("grootte", e.target.value)}>
                <option value="">— Grootte —</option>
                {GROOTTE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Relatiestatus">
            <select style={selectStyle} value={form.relatiestatus ?? ""} onChange={(e) => set("relatiestatus", e.target.value)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="Contactpersoon"><input style={inputStyle} value={form.contactpersoon ?? ""} onChange={(e) => set("contactpersoon", e.target.value)} /></Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="E-mail"><input style={inputStyle} type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
            <Field label="Telefoon"><input style={inputStyle} value={form.telefoon ?? ""} onChange={(e) => set("telefoon", e.target.value)} /></Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Website"><input style={inputStyle} placeholder="https://..." value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} /></Field>
            <Field label="Locatie"><input style={inputStyle} value={form.locatie ?? ""} onChange={(e) => set("locatie", e.target.value)} /></Field>
          </div>

          <Field label="Notities">
            <textarea style={{ ...inputStyle, minHeight: "100px", resize: "vertical", lineHeight: 1.6 }} value={form.notities ?? ""} onChange={(e) => set("notities", e.target.value)} />
          </Field>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={handleSave} disabled={isPending} style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "2px", background: saved ? "#9bd17f" : LIME, color: "var(--ink-900)", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
            {isPending ? "Opslaan…" : saved ? "Opgeslagen" : "Opslaan"}
          </button>
          <button onClick={() => { setForm(initial); setOpen(false); }} style={{ padding: "0.6rem 1rem", borderRadius: "2px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.875rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}>
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
