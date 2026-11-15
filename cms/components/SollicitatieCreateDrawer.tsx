"use client";

import { knopPrimair } from "@/lib/knoppen";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createSollicitatie } from "@/app/(app)/dashboard/actions/create";

const LIME = "#dffd7b";
const S1 = "var(--ink-800)";
const S2 = "var(--olive-600)";
const BORDER = "var(--line)";
const MUTED = "var(--bone-400)";
const TEXT = "var(--bone-100)";

const STATUS_OPTIONS = [
  { label: "Nieuw", value: "nieuw" },
  { label: "Screening", value: "screening" },
  { label: "Tel. gescreend", value: "tel_gescreend" },
  { label: "Voorgesteld", value: "voorgesteld" },
  { label: "Interview gepland", value: "interview_gepland" },
  { label: "Interview afgerond", value: "interview_afgerond" },
  { label: "Aanbod", value: "aanbod" },
  { label: "Geplaatst", value: "geplaatst" },
  { label: "Afgewezen", value: "afgewezen" },
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

const empty = { kandidaat: "", vacature: "", status: "nieuw", datum_sollicitatie: "", notities: "" };

export default function SollicitatieCreateDrawer({
  kandidaten,
  vacatures,
}: {
  kandidaten: Option[];
  vacatures: Option[];
}) {
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
    if (!form.kandidaat || !form.vacature) { setError("Kandidaat en vacature zijn verplicht."); return; }
    startTransition(async () => {
      const data: Record<string, any> = {
        kandidaat: form.kandidaat,
        vacature: form.vacature,
        status: form.status,
        notities: form.notities || undefined,
      };
      if (form.datum_sollicitatie) data.datum_sollicitatie = form.datum_sollicitatie;
      const result = await createSollicitatie(data);
      setForm({ ...empty });
      setOpen(false);
      router.push(`/dashboard/sollicitaties/${result.id}`);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={knopPrimair}
      >
        Sollicitatie toevoegen
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
          <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Sollicitatie toevoegen</div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "var(--bone-400)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <Field label="Kandidaat" required>
            <select style={selectStyle} value={form.kandidaat} onChange={(e) => set("kandidaat", e.target.value)}>
              <option value="">— Kies kandidaat —</option>
              {kandidaten.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
            </select>
          </Field>
          <Field label="Vacature" required>
            <select style={selectStyle} value={form.vacature} onChange={(e) => set("vacature", e.target.value)}>
              <option value="">— Kies vacature —</option>
              {vacatures.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select style={selectStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Datum sollicitatie">
            <input style={inputStyle} type="date" value={form.datum_sollicitatie} onChange={(e) => set("datum_sollicitatie", e.target.value)} />
          </Field>
          <Field label="Notities">
            <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical", lineHeight: 1.6 }} value={form.notities} onChange={(e) => set("notities", e.target.value)} />
          </Field>
          {error && <div style={{ fontSize: "0.875rem", color: "#d98f8f" }}>{error}</div>}
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={handleCreate} disabled={isPending} style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "2px", background: LIME, color: "var(--ink-900)", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit" }}>
            {isPending ? "Toevoegen…" : "Sollicitatie toevoegen"}
          </button>
          <button onClick={() => setOpen(false)} style={{ padding: "0.6rem 1rem", borderRadius: "2px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.875rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}>
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
