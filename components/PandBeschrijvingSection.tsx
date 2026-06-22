"use client";
import { useRef } from "react";
import RichTextEditor, { type RichTextEditorHandle } from "./RichTextEditor";

export default function PandBeschrijvingSection({ defaultValue }: { defaultValue?: string }) {
  const editorRef = useRef<RichTextEditorHandle>(null);

  async function genereer() {
    const form = document.getElementById("main-form") as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);

    const btn = document.getElementById("genereer-btn") as HTMLButtonElement;
    if (btn) { btn.disabled = true; btn.textContent = "Genereren..."; }

    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titel: fd.get("titel"), type: fd.get("type"), gemeente: fd.get("gemeente"),
          prijs: Number(fd.get("prijs")), transactie: fd.get("transactie"),
          slaapkamers: Number(fd.get("slaapkamers")) || undefined,
          badkamers: Number(fd.get("badkamers")) || undefined,
          bewoonbare_opp: Number(fd.get("bewoonbare_opp")) || undefined,
          perceelgrootte: Number(fd.get("perceelgrootte")) || undefined,
          bouwjaar: Number(fd.get("bouwjaar")) || undefined,
          epc: fd.get("epc") || undefined,
          garage: fd.get("garage") === "true",
          tuin: fd.get("tuin") === "true",
          terras: fd.get("terras") === "true",
        }),
      });
      const data = await res.json();
      if (data.tekst && editorRef.current) {
        const html = data.tekst
          .split("\n\n")
          .map((p: string) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
          .join("");
        editorRef.current.setContent(html);
      }
    } catch {
      alert("Genereren mislukt. Controleer je ANTHROPIC_API_KEY in Vercel.");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = "✨ Genereer met AI"; }
    }
  }

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.63rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a" }}>
          Beschrijving
        </div>
        <button
          id="genereer-btn"
          type="button"
          onClick={genereer}
          style={{
            background: "transparent", border: "1px solid #facb04", color: "#facb04",
            borderRadius: "5px", padding: "0.35rem 0.85rem", fontSize: "0.72rem",
            fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans, sans-serif",
          }}
        >
          ✨ Genereer met AI
        </button>
      </div>
      <RichTextEditor ref={editorRef} name="beschrijving" defaultValue={defaultValue} />
    </div>
  );
}
