"use client";

import { knopPrimair } from "@/lib/knoppen";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVacature } from "@/app/(app)/dashboard/actions/create";
import VacatureVelden from "@/components/VacatureVelden";
import { LEGE_VACATURE, naarPayload, type VacatureVorm } from "@/lib/vacatureVorm";

const LIME = "#dffd7b";
const BORDER = "var(--line)";
const MUTED = "var(--bone-400)";
const TEXT = "var(--bone-100)";

export default function VacatureCreateDrawer() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VacatureVorm>({ ...LEGE_VACATURE });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof VacatureVorm>(key: K, value: VacatureVorm[K]) {
    setError("");
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleCreate() {
    if (!form.titel.trim()) { setError("Titel is verplicht."); return; }
    if (!form.sector) { setError("Kies een vakgebied."); return; }
    startTransition(async () => {
      try {
        const result = await createVacature(naarPayload(form));
        setForm({ ...LEGE_VACATURE });
        setOpen(false);
        router.push(`/dashboard/vacatures/${result.id}`);
      } catch {
        setError("Opslaan is niet gelukt. Probeer het opnieuw.");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={knopPrimair}
      >
        Nieuwe vacature
      </button>

      {open && <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgb(20 20 14 / 0.72)", zIndex: 40, backdropFilter: "blur(2px)" }} />}

      <div style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "min(600px, 100vw)",
        background: "var(--ink-900)", borderLeft: `1px solid ${BORDER}`,
        zIndex: 50, display: "flex", flexDirection: "column",
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: TEXT }}>Vacature toevoegen</div>
          <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "var(--bone-400)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "0.25rem" }}>✕</button>
        </div>

        <div style={{ flex: 1, padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto" }}>
          <VacatureVelden form={form} set={set} />
          {error && <div style={{ fontSize: "0.875rem", color: "#d98f8f" }}>{error}</div>}
        </div>

        <div style={{ padding: "1rem 1.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", gap: "0.75rem", flexShrink: 0 }}>
          <button onClick={handleCreate} disabled={isPending} style={{ flex: 1, padding: "0.6rem 1rem", borderRadius: "2px", background: LIME, color: "var(--ink-900)", fontWeight: 700, fontSize: "0.875rem", border: "none", cursor: isPending ? "wait" : "pointer", fontFamily: "inherit" }}>
            {isPending ? "Toevoegen…" : "Vacature toevoegen"}
          </button>
          <button onClick={() => setOpen(false)} style={{ padding: "0.6rem 1rem", borderRadius: "2px", background: "transparent", color: MUTED, fontWeight: 600, fontSize: "0.875rem", border: `1px solid ${BORDER}`, cursor: "pointer", fontFamily: "inherit" }}>
            Annuleren
          </button>
        </div>
      </div>
    </>
  );
}
