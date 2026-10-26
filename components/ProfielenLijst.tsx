"use client";

import { useState } from "react";

const knop: React.CSSProperties = {
  background: "transparent", color: "var(--bone-400)", border: "1px solid var(--line)", borderRadius: "2px",
  padding: "0.4rem 0.75rem", fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
};

/** Lijst met profielen die je kunt aanvullen, verwijderen en herordenen. Veldnamen: <prefix>.N.naam */
export default function ProfielenLijst({ prefix, startwaarden, maxLength = 36 }: { prefix: string; startwaarden: string[]; maxLength?: number }) {
  const [lijst, setLijst] = useState<string[]>(startwaarden.length > 0 ? startwaarden : [""]);
  const zet = (i: number, v: string) => setLijst((l) => l.map((x, j) => (j === i ? v : x)));
  const verplaats = (i: number, d: number) =>
    setLijst((l) => {
      const n = [...l];
      const j = i + d;
      if (j < 0 || j >= n.length) return l;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  return (
    <div style={{ marginBottom: "1.25rem" }}>
      {lijst.map((waarde, i) => (
        <div key={i} style={{ display: "flex", gap: "0.4rem", marginBottom: "0.4rem" }}>
          <input
            name={`${prefix}.${i}.naam`}
            value={waarde}
            maxLength={maxLength}
            onChange={(e) => zet(i, e.target.value)}
            aria-label={`Profiel ${i + 1}`}
            style={{ flex: 1, background: "var(--ink-800)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--bone-100)", borderRadius: "2px", padding: "0.55rem 0.75rem", fontSize: "0.875rem", fontFamily: "inherit" }}
          />
          <button type="button" style={knop} onClick={() => verplaats(i, -1)} aria-label="Omhoog">↑</button>
          <button type="button" style={knop} onClick={() => verplaats(i, 1)} aria-label="Omlaag">↓</button>
          <button type="button" style={knop} onClick={() => setLijst((l) => l.filter((_, j) => j !== i))} aria-label="Verwijderen">Weg</button>
        </div>
      ))}
      <button type="button" style={knop} onClick={() => setLijst((l) => [...l, ""])}>Profiel toevoegen</button>
    </div>
  );
}
