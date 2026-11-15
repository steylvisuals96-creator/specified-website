"use client";

import { knopKlein } from "@/lib/knoppen";

import { useState, useTransition } from "react";

const LIME = "#dffd7b";
const S1 = "var(--ink-800)";
const S2 = "var(--olive-600)";
const BORDER = "var(--line)";
const MUTED = "var(--bone-400)";
const TEXT = "var(--bone-100)";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <label style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--bone-400)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: S1, border: `1px solid ${S2}`, borderRadius: "2px",
  color: TEXT, fontSize: "0.875rem", padding: "0.45rem 0.65rem",
  fontFamily: "inherit", width: "100%", outline: "none",
};

export default function GebruikerEditDrawer({ id, initial, magCreator = false }: {
  id: string;
  initial: { naam?: string; email?: string; rol?: string };
  magCreator?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [naam, setNaam] = useState(initial.naam ?? "");
  const [rol, setRol] = useState(initial.rol ?? "consultant");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const { updateGebruiker } = await import("@/app/(app)/dashboard/gebruikers/actions");
      await updateGebruiker(id, { naam, rol });
      setSaved(true);
      setTimeout(() => { setSaved(false); setOpen(false); }, 1000);
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={knopKlein}
      >
        Bewerken
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgb(20 20 14 / 0.72)", zIndex: 40, backdropFilter: "blur(2px)" }} />}

      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "400px",
        background: "var(--ink-900)", borderLeft: `1px solid ${BORDER}`,
        zIndex: 50, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Gebruiker bewerken</div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "var(--bone-400)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <Field label="Naam">
            <input style={inputStyle} value={naam} onChange={(e) => setNaam(e.target.value)} />
          </Field>
          <Field label="E-mail">
            <input style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} value={initial.email ?? ""} disabled />
          </Field>
          <Field label="Rol">
            <select style={{ ...inputStyle, cursor: "pointer" }} value={rol} onChange={(e) => setRol(e.target.value)}>
              {magCreator && <option value="creator">Creator (SteylVisuals)</option>}
              <option value="beheerder">Beheerder</option>
              <option value="consultant">Recruitment Consultant</option>
            </select>
          </Field>
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={handleSave} disabled={isPending} style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "2px", background: saved ? "#9bd17f" : LIME, color: "var(--ink-900)", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}>
            {isPending ? "Opslaan…" : saved ? "Opgeslagen" : "Opslaan"}
          </button>
          <button onClick={() => setOpen(false)} style={{ padding: "0.6rem 1rem", borderRadius: "2px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.875rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}>
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
