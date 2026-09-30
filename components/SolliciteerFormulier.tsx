"use client";

import { useState, type FormEvent } from "react";
import { CMS_URL } from "@/lib/settings";

type Status = "rust" | "bezig" | "gelukt" | "fout";

const veld: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem 0.9rem",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  color: "var(--white)",
  fontSize: "0.9rem",
  fontFamily: "inherit",
};

const label: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--muted)",
};

/**
 * Sollicitatieformulier per vacature. Stuurt naar het CRM (/api/solliciteer),
 * waar de kandidaat en de sollicitatie worden aangemaakt. De e-mailknop blijft
 * als uitweg bestaan voor wie liever mailt.
 */
export default function SolliciteerFormulier({
  vacatureId,
  vacatureTitel,
  fallbackMail,
}: {
  vacatureId: string | number;
  vacatureTitel: string;
  fallbackMail: string;
}) {
  const [status, setStatus] = useState<Status>("rust");
  const [fout, setFout] = useState("");

  async function verstuur(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "bezig") return;
    const data = new FormData(e.currentTarget);
    setStatus("bezig");
    setFout("");

    try {
      const res = await fetch(`${CMS_URL}/api/solliciteer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacatureId,
          voornaam: data.get("voornaam"),
          achternaam: data.get("achternaam"),
          email: data.get("email"),
          telefoon: data.get("telefoon"),
          motivatie: data.get("motivatie"),
          akkoord: data.get("akkoord") === "on",
          // Verborgen veld: een mens laat het leeg, een bot vult het in.
          website: data.get("website"),
        }),
      });
      if (res.ok) {
        setStatus("gelukt");
        return;
      }
      const antwoord = await res.json().catch(() => ({}));
      setFout(typeof antwoord?.error === "string" ? antwoord.error : "Versturen is niet gelukt.");
      setStatus("fout");
    } catch {
      setFout("Versturen is niet gelukt. Controleer je verbinding en probeer het opnieuw.");
      setStatus("fout");
    }
  }

  if (status === "gelukt") {
    return (
      <div
        role="status"
        style={{ border: "1px solid rgba(223,253,123,0.3)", background: "rgba(223,253,123,0.06)", borderRadius: "8px", padding: "1.5rem" }}
      >
        <p style={{ color: "var(--lime)", fontWeight: 600, marginBottom: "0.4rem" }}>Bedankt voor je sollicitatie.</p>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          We hebben je gegevens ontvangen voor {vacatureTitel} en nemen snel contact met je op.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={verstuur} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.02em", color: "var(--white)" }}>
        Solliciteer voor {vacatureTitel}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <label style={label}>
          Voornaam
          <input name="voornaam" required maxLength={80} autoComplete="given-name" style={veld} />
        </label>
        <label style={label}>
          Achternaam
          <input name="achternaam" required maxLength={80} autoComplete="family-name" style={veld} />
        </label>
      </div>

      <label style={label}>
        E-mail
        <input name="email" type="email" required maxLength={200} autoComplete="email" style={veld} />
      </label>

      <label style={label}>
        Telefoon (optioneel)
        <input name="telefoon" type="tel" maxLength={40} autoComplete="tel" style={veld} />
      </label>

      <label style={label}>
        Motivatie (optioneel)
        <textarea name="motivatie" rows={4} maxLength={2000} style={{ ...veld, resize: "vertical" }} />
      </label>

      {/* Honeypot: buiten beeld en buiten de tabvolgorde, niet display:none (sommige bots slaan die over). */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start", fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>
        <input name="akkoord" type="checkbox" required style={{ marginTop: "0.2rem", accentColor: "#dffd7b" }} />
        <span>
          Ik ga ermee akkoord dat Specified mijn gegevens gebruikt voor deze sollicitatie, zoals beschreven in de{" "}
          <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--lime)" }}>
            privacyverklaring
          </a>
          .
        </span>
      </label>

      {status === "fout" && (
        <p role="alert" style={{ color: "#ff8a8a", fontSize: "0.85rem" }}>
          {fout}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "bezig"}
        style={{
          backgroundColor: "var(--lime)",
          color: "var(--dark)",
          padding: "1rem 2rem",
          borderRadius: "6px",
          fontSize: "0.9rem",
          fontWeight: 600,
          border: "none",
          cursor: status === "bezig" ? "wait" : "pointer",
          opacity: status === "bezig" ? 0.7 : 1,
        }}
      >
        {status === "bezig" ? "Versturen…" : "Verstuur sollicitatie"}
      </button>

      <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
        Liever mailen?{" "}
        <a
          href={`mailto:${fallbackMail}?subject=${encodeURIComponent(`Sollicitatie: ${vacatureTitel}`)}`}
          style={{ color: "var(--lime)" }}
        >
          Stuur ons een e-mail
        </a>
        .
      </p>
    </form>
  );
}
