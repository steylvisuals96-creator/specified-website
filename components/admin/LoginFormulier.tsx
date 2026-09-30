"use client";

import { useState, type FormEvent } from "react";

const veld: React.CSSProperties = {
  width: "100%",
  padding: "0.8rem 0.9rem",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--border)",
  borderRadius: 0,
  color: "var(--white)",
  fontSize: "1rem",
  fontFamily: "inherit",
};
const label: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8125rem", fontWeight: 500, color: "var(--muted)" };

export default function LoginFormulier() {
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  async function verstuur(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bezig) return;
    const data = new FormData(e.currentTarget);
    setBezig(true);
    setFout("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), wachtwoord: data.get("wachtwoord") }),
      });
      if (res.ok) {
        // Volledig laden, zodat de provider de nieuwe sessie meteen oppikt.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/");
        return;
      }
      const antwoord = await res.json().catch(() => ({}));
      setFout(typeof antwoord?.error === "string" ? antwoord.error : "Inloggen is niet gelukt.");
    } catch {
      setFout("Geen verbinding. Probeer het opnieuw.");
    }
    setBezig(false);
  }

  return (
    <form onSubmit={verstuur} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <label style={label}>
        E-mailadres
        <input name="email" type="email" required autoComplete="username" maxLength={200} style={veld} />
      </label>
      <label style={label}>
        Wachtwoord
        <input name="wachtwoord" type="password" required autoComplete="current-password" maxLength={200} style={veld} />
      </label>
      {fout && (
        <p role="alert" style={{ color: "#ff8a8a", fontSize: "0.9rem" }}>
          {fout}
        </p>
      )}
      <button type="submit" disabled={bezig} className="btn btn-primary" style={{ border: "none", cursor: bezig ? "wait" : "pointer", opacity: bezig ? 0.7 : 1 }}>
        {bezig ? "Bezig met inloggen…" : "Inloggen"}
      </button>
    </form>
  );
}
