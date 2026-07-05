"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const KEY = "specified-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  function choose(value: "accepted" | "declined") {
    localStorage.setItem(KEY, value);
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
        <button
          onClick={() => choose("accepted")}
          style={{
            flex: 1, minWidth: "120px", padding: "0.6rem 1rem", borderRadius: "6px",
            background: "var(--lime)", color: "var(--dark)", fontWeight: 600,
            fontSize: "0.82rem", border: "none", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Alles accepteren
        </button>
        <button
          onClick={() => choose("declined")}
          style={{
            flex: 1, minWidth: "120px", padding: "0.6rem 1rem", borderRadius: "6px",
            background: "transparent", color: "rgba(255,255,255,0.7)", fontWeight: 500,
            fontSize: "0.82rem", border: "1px solid var(--border)", cursor: "pointer", fontFamily: "inherit",
          }}
        >
          Enkel noodzakelijke
        </button>
      </div>
    </div>
  );
}
