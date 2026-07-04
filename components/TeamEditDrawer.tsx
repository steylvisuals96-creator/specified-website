"use client";

import { useState, useTransition } from "react";
import { updateTeamlid } from "@/app/(app)/dashboard/team/actions";

const LIME = "#dffd7b";
const S1 = "#27272a";
const S2 = "#323236";
const BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.4)";
const TEXT = "#f0f0f0";

const ROL_OPTIONS = [
  { label: "Managing Partner", value: "managing_partner" },
  { label: "Senior Recruitment Consultant", value: "senior_consultant" },
  { label: "Recruitment Consultant", value: "consultant" },
  { label: "Talent Acquisition Specialist", value: "talent" },
  { label: "Office Manager", value: "office" },
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
  background: S1, border: `1px solid ${S2}`, borderRadius: "4px",
  color: TEXT, fontSize: "0.85rem", padding: "0.45rem 0.65rem",
  fontFamily: "inherit", width: "100%", outline: "none",
};

const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

export type TeamlidData = {
  voornaam?: string;
  achternaam?: string;
  rol?: string;
  email?: string;
  linkedin?: string;
  bio?: string;
  volgorde?: number | null;
  actief?: boolean;
};

export default function TeamEditDrawer({
  id,
  initial,
}: {
  id: string;
  initial: TeamlidData;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TeamlidData>(initial);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function set(key: keyof TeamlidData, value: any) {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    startTransition(async () => {
      await updateTeamlid(id, form);
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1000);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: "block", width: "100%", textAlign: "center", padding: "0.5rem", borderRadius: "4px", background: `${LIME}14`, color: LIME, fontSize: "0.78rem", fontWeight: 600, border: `1px solid ${LIME}30`, cursor: "pointer", fontFamily: "inherit" }}
      >
        ✏️ Bewerken
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      )}

      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "420px",
        background: "#1e1e21", borderLeft: `1px solid ${BORDER}`,
        zIndex: 50, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Teamlid bewerken</div>
            <div style={{ fontSize: "0.73rem", color: "#555", marginTop: "0.1rem" }}>{form.voornaam} {form.achternaam}</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Voornaam">
              <input style={inputStyle} value={form.voornaam ?? ""} onChange={(e) => set("voornaam", e.target.value)} />
            </Field>
            <Field label="Achternaam">
              <input style={inputStyle} value={form.achternaam ?? ""} onChange={(e) => set("achternaam", e.target.value)} />
            </Field>
          </div>

          <Field label="Rol">
            <select style={selectStyle} value={form.rol ?? ""} onChange={(e) => set("rol", e.target.value)}>
              <option value="">— Kies rol —</option>
              {ROL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>

          <Field label="E-mail">
            <input style={inputStyle} type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
          </Field>

          <Field label="LinkedIn URL">
            <input style={inputStyle} placeholder="https://linkedin.com/in/..." value={form.linkedin ?? ""} onChange={(e) => set("linkedin", e.target.value)} />
          </Field>

          <Field label="Bio">
            <textarea
              style={{ ...inputStyle, minHeight: "90px", resize: "vertical", lineHeight: 1.6 }}
              value={form.bio ?? ""}
              onChange={(e) => set("bio", e.target.value)}
            />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", alignItems: "center" }}>
            <Field label="Volgorde">
              <input style={inputStyle} type="number" min={1} max={99} value={form.volgorde ?? ""} onChange={(e) => set("volgorde", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="Actief / zichtbaar">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "0.3rem" }}>
                <input type="checkbox" checked={form.actief ?? true} onChange={(e) => set("actief", e.target.checked)} style={{ accentColor: LIME, width: "16px", height: "16px" }} />
                <span style={{ fontSize: "0.85rem", color: MUTED }}>{form.actief ? "Actief" : "Inactief"}</span>
              </label>
            </Field>
          </div>
        </div>

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
