"use client";
import { useState } from "react";

export default function GenereerBeschrijving({ editorRef }: { editorRef: React.RefObject<{ setContent: (html: string) => void } | null> }) {
  const [loading, setLoading] = useState(false);

  async function genereer() {
    const form = document.getElementById("main-form") as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);

    setLoading(true);
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
        const html = data.tekst.split("\n\n").map((p: string) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
        editorRef.current.setContent(html);
      }
    } catch {
      alert("Genereren mislukt. Controleer je ANTHROPIC_API_KEY.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={genereer}
      disabled={loading}
      style={{
        background: "transparent", border: "1px solid #facb04", color: "#facb04",
        borderRadius: "5px", padding: "0.4rem 0.9rem", fontSize: "0.75rem",
        fontWeight: 600, cursor: loading ? "wait" : "pointer", fontFamily: "DM Sans, sans-serif",
        opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", gap: "0.4rem",
      }}
    >
      {loading ? "Genereren..." : "✨ Genereer met AI"}
    </button>
  );
}
