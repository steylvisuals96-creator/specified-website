"use client";

import { knopKlein } from "@/lib/knoppen";

import { useState, useTransition } from "react";
import { updateVacature } from "@/app/(app)/dashboard/vacatures/actions";
import VacatureVelden from "@/components/VacatureVelden";
import { naarPayload, type VacatureVorm } from "@/lib/vacatureVorm";

const LIME = "#dffd7b";
const BORDER = "var(--line)";
const MUTED = "var(--bone-400)";
const TEXT = "var(--bone-100)";

export type VacatureData = VacatureVorm;

export default function VacatureEditDrawer({
  id,
  initial,
  autoOpen,
}: {
  id: string;
  initial: VacatureData;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(autoOpen ?? false);
  const [form, setForm] = useState<VacatureData>(initial);
  const [saved, setSaved] = useState(false);
  const [fout, setFout] = useState("");
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof VacatureVorm>(key: K, value: VacatureVorm[K]) {
    setSaved(false);
    setFout("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    if (!form.titel.trim()) { setFout("Titel is verplicht."); return; }
    if (!form.sector) { setFout("Kies een vakgebied."); return; }
    startTransition(async () => {
      try {
        await updateVacature(id, naarPayload(form));
        setSaved(true);
        setTimeout(() => { setSaved(false); setOpen(false); }, 1000);
      } catch {
        setFout("Opslaan is niet gelukt. Probeer het opnieuw.");
      }
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

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgb(20 20 14 / 0.72)", zIndex: 40, backdropFilter: "blur(2px)" }}
        />
      )}

      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "min(600px, 100vw)",
        background: "var(--ink-900)", borderLeft: `1px solid ${BORDER}`,
        zIndex: 50, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflowY: "auto",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Vacature bewerken</div>
            <div style={{ fontSize: "0.8125rem", color: "var(--bone-400)", marginTop: "0.1rem" }}>{form.titel}</div>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "var(--bone-400)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <VacatureVelden form={form} set={set} />
          {fout && <div style={{ fontSize: "0.875rem", color: "#d98f8f" }}>{fout}</div>}
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", alignItems: "center", flexShrink: 0 }}>
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "2px", background: saved ? "#9bd17f" : LIME, color: "var(--ink-900)", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit", transition: "background 0.2s" }}
          >
            {isPending ? "Opslaan…" : saved ? "Opgeslagen" : "Opslaan"}
          </button>
          <button
            onClick={() => { setForm(initial); setOpen(false); }}
            style={{ padding: "0.6rem 1rem", borderRadius: "2px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.875rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}
          >
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
