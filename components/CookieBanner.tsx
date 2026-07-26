"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { onConsentChange, readConsent, writeConsent, type ConsentValue } from "@/lib/consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(readConsent() === null);
    sync();
    return onConsentChange(sync);
  }, []);

  function choose(value: ConsentValue) {
    writeConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookievoorkeuren"
      style={{
        position: "fixed",
        bottom: "1rem",
        left: "1rem",
        right: "1rem",
        maxWidth: "480px",
        margin: "0 auto",
        background: "var(--dark)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
        padding: "1.25rem 1.4rem",
        zIndex: 9990,
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
        cursor: "auto",
      }}
    >
      <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.85rem", lineHeight: 1.55, marginBottom: "1rem" }}>
        We gebruiken noodzakelijke cookies om de site te laten werken en — met jouw toestemming —
        analytische cookies om hem te verbeteren. Meer info in ons{" "}
        <Link href="/cookies" style={{ color: "var(--lime)", textDecoration: "underline" }}>cookiebeleid</Link>.
      </p>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        {/* Beide keuzes krijgen exact hetzelfde gewicht: zelfde vorm, maat,
            letterdikte en contrast. De EDPB-richtsnoeren vereisen dat weigeren
            even makkelijk is als aanvaarden; een spookknop naast een gevulde
            knop stuurt de keuze en is daarmee geen vrije toestemming. */}
        <button
          type="button"
          onClick={() => choose("accepted")}
          style={{
            flex: 1, minWidth: "140px", minHeight: "44px", padding: "0.7rem 1rem", borderRadius: "6px",
            background: "var(--lime)", color: "var(--dark)", fontWeight: 600,
            fontSize: "0.82rem", border: "1px solid var(--lime)", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Alles accepteren
        </button>
        <button
          type="button"
          onClick={() => choose("declined")}
          style={{
            flex: 1, minWidth: "140px", minHeight: "44px", padding: "0.7rem 1rem", borderRadius: "6px",
            background: "var(--white)", color: "var(--dark)", fontWeight: 600,
            fontSize: "0.82rem", border: "1px solid var(--white)", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Enkel noodzakelijke
        </button>
      </div>
    </div>
  );
}
