"use client";

import { useState } from "react";
import Link from "next/link";

type Afspraak = {
  id: string;
  titel: string;
  datum: string;
  type: string;
  status: string;
  kleur: string;
};

const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const MONTHS = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"];

const G = "#facb04";
const BORDER = "#252525";
const S2 = "#161616";
const S3 = "#1e1e1e";
const MUTED = "#666";
const TEXT = "#e8e8e8";

export default function AfsprakenKalender({ afspraken }: { afspraken: Afspraak[] }) {
  const now = new Date();
  const [jaar, setJaar] = useState(now.getFullYear());
  const [maand, setMaand] = useState(now.getMonth());

  function prevMaand() {
    if (maand === 0) { setMaand(11); setJaar(j => j - 1); }
    else setMaand(m => m - 1);
  }
  function nextMaand() {
    if (maand === 11) { setMaand(0); setJaar(j => j + 1); }
    else setMaand(m => m + 1);
  }

  const eersteVdMaand = new Date(jaar, maand, 1);
  // Monday-based: getDay() returns 0=Sun → shift
  const startOffset = (eersteVdMaand.getDay() + 6) % 7;
  const dagenInMaand = new Date(jaar, maand + 1, 0).getDate();

  const byDay: Record<string, Afspraak[]> = {};
  for (const a of afspraken) {
    const d = new Date(a.datum);
    if (d.getFullYear() === jaar && d.getMonth() === maand) {
      const key = d.getDate().toString();
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(a);
    }
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: dagenInMaand }, (_, i) => i + 1),
  ];
  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);

  const vandaag = now.getDate();
  const isHuidigeMaand = now.getFullYear() === jaar && now.getMonth() === maand;

  return (
    <div>
      {/* Navigatie */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        <button onClick={prevMaand} style={{ background: S3, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "0.4rem 0.75rem", cursor: "pointer", fontSize: "0.85rem" }}>‹</button>
        <div style={{ fontWeight: 700, fontSize: "1rem", flex: 1, textAlign: "center" }}>{MONTHS[maand]} {jaar}</div>
        <button onClick={nextMaand} style={{ background: S3, border: `1px solid ${BORDER}`, color: TEXT, borderRadius: 6, padding: "0.4rem 0.75rem", cursor: "pointer", fontSize: "0.85rem" }}>›</button>
        <button onClick={() => { setJaar(now.getFullYear()); setMaand(now.getMonth()); }} style={{ background: G, border: "none", color: "#111", borderRadius: 6, padding: "0.4rem 0.875rem", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}>Vandaag</button>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: MUTED, padding: "0.5rem 0" }}>{d}</div>
        ))}
        {cells.map((dag, i) => {
          const afsprKp = dag ? byDay[dag.toString()] ?? [] : [];
          const isVandaag = isHuidigeMaand && dag === vandaag;
          return (
            <div key={i} style={{
              minHeight: 80,
              background: dag ? S2 : "transparent",
              border: dag ? `1px solid ${isVandaag ? G : BORDER}` : "none",
              borderRadius: 6,
              padding: "0.375rem 0.5rem",
              position: "relative",
            }}>
              {dag && (
                <>
                  <div style={{ fontSize: "0.72rem", fontWeight: isVandaag ? 800 : 500, color: isVandaag ? G : MUTED, marginBottom: "0.3rem" }}>{dag}</div>
                  {afsprKp.slice(0, 3).map(a => (
                    <Link key={a.id} href={`/dashboard/afspraken/${a.id}`} style={{
                      display: "block",
                      fontSize: "0.62rem",
                      padding: "2px 5px",
                      borderRadius: 3,
                      background: a.kleur + "22",
                      borderLeft: `2px solid ${a.kleur}`,
                      color: a.kleur,
                      textDecoration: "none",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontWeight: 600,
                    }}>{new Date(a.datum).toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit" })} {a.titel}</Link>
                  ))}
                  {afsprKp.length > 3 && (
                    <div style={{ fontSize: "0.6rem", color: MUTED }}>+{afsprKp.length - 3} meer</div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
