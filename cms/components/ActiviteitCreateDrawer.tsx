"use client";

import { knopPrimair } from "@/lib/knoppen";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createActiviteit } from "@/app/(app)/dashboard/actions/create";

const LIME = "#dffd7b";
const S1 = "var(--ink-800)";
const S2 = "var(--olive-600)";
const BORDER = "var(--line)";
const MUTED = "var(--bone-400)";
const TEXT = "var(--bone-100)";

const TYPE_OPTIONS = [
  { label: "E-mail", value: "email" },
  { label: "Telefoon", value: "telefoon" },
  { label: "Meeting", value: "meeting" },
  { label: "Notitie", value: "notitie" },
];

const RICHTING_OPTIONS = [
  { label: "Uitgaand", value: "uitgaand" },
  { label: "Inkomend", value: "inkomend" },
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

type Option = { id: string; label: string };

const empty = { type: "notitie", richting: "uitgaand", onderwerp: "", inhoud: "", van: "", naar: "", datum: "" };

export default function ActiviteitCreateDrawer({
  kandidaten,
  bedrijven,
}: {
  kandidaten: Option[];
  bedrijven: Option[];
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty, kandidaat: "", bedrijf: "" });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set(key: string, value: string) {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCreate() {
    if (!form.onderwerp) { setError("Onderwerp is verplicht."); return; }
    startTransition(async () => {
      const data: Record<string, any> = {
        type: form.type,
        richting: form.richting,
        onderwerp: form.onderwerp,
        inhoud: form.inhoud || undefined,
        van: form.van || undefined,
        naar: form.naar || undefined,
        datum: form.datum || new Date().toISOString(),
        kandidaat: form.kandidaat || undefined,
        bedrijf: form.bedrijf || undefined,
      };
      await createActiviteit(data);
      setForm({ ...empty, kandidaat: "", bedrijf: "" });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={knopPrimair}
      >
        Activiteit toevoegen
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
          <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Activiteit toevoegen</div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "var(--bone-400)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Type">
              <select style={selectStyle} value={form.type} onChange={(e) => set("type", e.target.value)}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
            <Field label="Richting">
              <select style={selectStyle} value={form.richting} onChange={(e) => set("richting", e.target.value)}>
                {RICHTING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Onderwerp" required>
            <input style={inputStyle} value={form.onderwerp} onChange={(e) => set("onderwerp", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Van"><input style={inputStyle} placeholder="naam of e-mail" value={form.van} onChange={(e) => set("van", e.target.value)} /></Field>
            <Field label="Naar"><input style={inputStyle} placeholder="naam of e-mail" value={form.naar} onChange={(e) => set("naar", e.target.value)} /></Field>
          </div>
          <Field label="Datum">
            <input style={inputStyle} type="datetime-local" value={form.datum} onChange={(e) => set("datum", e.target.value)} />
          </Field>
          <Field label="Kandidaat">
            <select style={selectStyle} value={form.kandidaat} onChange={(e) => set("kandidaat", e.target.value)}>
              <option value="">— Geen —</option>
              {kandidaten.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </Field>
          <Field label="Bedrijf">
            <select style={selectStyle} value={form.bedrijf} onChange={(e) => set("bedrijf", e.target.value)}>
              <option value="">— Geen —</option>
              {bedrijven.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
            </select>
          </Field>
          <Field label="Inhoud / notities">
            <textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical", lineHeight: 1.6 }} value={form.inhoud} onChange={(e) => set("inhoud", e.target.value)} />
          </Field>
          {error && <div style={{ fontSize: "0.875rem", color: "#d98f8f" }}>{error}</div>}
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={handleCreate} disabled={isPending} style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "2px", background: LIME, color: "var(--ink-900)", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit" }}>
            {isPending ? "Toevoegen…" : "Activiteit toevoegen"}
          </button>
          <button onClick={() => setOpen(false)} style={{ padding: "0.6rem 1rem", borderRadius: "2px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.875rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}>
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
