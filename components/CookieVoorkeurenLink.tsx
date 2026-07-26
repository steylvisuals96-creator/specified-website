"use client";

import { clearConsent } from "@/lib/consent";

/**
 * Maakt de toestemming herroepbaar. Zonder dit kan een bezoeker zijn keuze
 * nooit meer wijzigen — een vereiste onder de AVG, en de reden dat dit in de
 * footer staat en niet weggestopt zit in het cookiebeleid.
 */
export default function CookieVoorkeurenLink({ style }: { style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      onClick={clearConsent}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        font: "inherit",
        fontSize: "0.85rem",
        fontWeight: 400,
        color: "var(--muted)",
        cursor: "pointer",
        ...style,
      }}
    >
      Cookievoorkeuren
    </button>
  );
}
