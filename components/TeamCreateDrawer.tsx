"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeamlid } from "@/app/(app)/dashboard/actions/create";

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

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#666" }}>
        {label}{required && <span style={{ color: LIME, marginLeft: "0.25rem" }}>*</span>}
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

const empty = { voornaam: "", achternaam: "", rol: "", email: "", linkedin: "", bio: "", volgorde: "", actief: true };

export default function TeamCreateDrawer() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set(key: string, value: any) {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCreate() {
    if (!form.voornaam || !form.achternaam) { setError("Voornaam en achternaam zijn verplicht."); return; }
    startTransition(async () => {
      const data: Record<string, any> = {
        voornaam: form.voornaam,
        achternaam: form.achternaam,
        rol: form.rol || undefined,
        email: form.email || undefined,
        linkedin: form.linkedin || undefined,
        bio: form.bio || undefined,
        volgorde: form.volgorde ? Number(form.volgorde) : undefined,
        actief: form.actief,
      };
      await createTeamlid(data);
      setForm({ ...empty });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ padding: "0.55rem 1.1rem", borderRadius: "4px", background: LIME, color: "#1e1e21", fontWeight: 700, fontSize: "0.82rem", border: "none", cursor: "pointer", fontFamily: "inherit" }}
      >
        + Nieuw teamlid
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(2px)" }} />}

      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "440px",
        background: "#1e1e21", borderLeft: `1px solid ${BORDER}`,
        zIndex: 50, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Teamlid toevoegen</div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#555", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Voornaam" required><input style={inputStyle} value={form.voornaam} onChange={(e) => set("voornaam", e.target.value)} /></Field>
            <Field label="Achternaam" required><input style={inputStyle} value={form.achternaam} onChange={(e) => set("achternaam", e.target.value)} /></Field>
          </div>
          <Field label="Rol">
            <select style={selectStyle} value={form.rol} onChange={(e) => set("rol", e.target.value)}>
              <option value="">— Kies rol —</option>
              {ROL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="E-mail"><input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="LinkedIn URL"><input style={inputStyle} placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} /></Field>
          <Field label="Bio">
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical", lineHeight: 1.6 }} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", alignItems: "center" }}>
            <Field label="Volgorde"><input style={inputStyle} type="number" min={1} max={99} value={form.volgorde} onChange={(e) => set("volgorde", e.target.value)} /></Field>
            <Field label="Actief / zichtbaar">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", marginTop: "0.3rem" }}>
                <input type="checkbox" checked={form.actief} onChange={(e) => set("actief", e.target.checked)} style={{ accentColor: LIME, width: "16px", height: "16px" }} />
                <span style={{ fontSize: "0.85rem", color: MUTED }}>{form.actief ? "Actief" : "Inactief"}</span>
              </label>
            </Field>
          </div>
          {error && <div style={{ fontSize: "0.8rem", color: "#f87171" }}>{error}</div>}
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={handleCreate} disabled={isPending} style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "4px", background: LIME, color: "#1e1e21", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit" }}>
            {isPending ? "Toevoegen…" : "Teamlid toevoegen"}
          </button>
          <button onClick={() => setOpen(false)} style={{ padding: "0.6rem 1rem", borderRadius: "4px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.82rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}>
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
