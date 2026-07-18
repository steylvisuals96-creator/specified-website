"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

type Vacature = {
  id: string | number;
  title: string;
  type: string;
  location: string;
  sector: string;
  regime: string;
  beschrijving: string;
  profiel: string[];
  aanbod: string[];
};

export default function VacaturesClient({ vacatures, titel, contactEmail }: { vacatures: Vacature[]; titel?: string; contactEmail?: string }) {
  const mail = contactEmail || "info@specified.be";
  const sectors = ["Alle sectoren", ...Array.from(new Set(vacatures.map((v) => v.sector).filter(Boolean)))];
  const types = ["Alle types", ...Array.from(new Set(vacatures.map((v) => v.type).filter(Boolean)))];

  const [activeSector, setActiveSector] = useState("Alle sectoren");
  const [activeType, setActiveType] = useState("Alle types");
  const [selected, setSelected] = useState<string | number | null>(null);

  const filtered = vacatures.filter((v) => {
    const sectorOk = activeSector === "Alle sectoren" || v.sector === activeSector;
    const typeOk = activeType === "Alle types" || v.type === activeType;
    return sectorOk && typeOk;
  });

  const selectedJob = vacatures.find((v) => v.id === selected);

  return (
    <section style={{ paddingTop: "calc(72px + 4rem)", paddingBottom: "6rem", minHeight: "100svh" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.5rem, 5vw, 4rem)" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ marginBottom: "3rem" }}
        >
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(4rem, 9vw, 8rem)", fontWeight: 400, letterSpacing: "0.01em", lineHeight: 0.95, color: "var(--white)", marginBottom: "1.5rem" }}>
            {titel || "Jouw volgende stap."}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "480px", lineHeight: 1.6 }}>
            {filtered.length} vacature{filtered.length !== 1 ? "s" : ""} gevonden — vaste en interim posities in engineering.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem", paddingBottom: "2.5rem", borderBottom: "1px solid var(--border)" }}
        >
          {types.map((t) => (
            <button key={t} onClick={() => setActiveType(t)} style={{ padding: "0.45rem 1.1rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: "1px solid", borderColor: activeType === t ? "var(--lime)" : "var(--border)", backgroundColor: activeType === t ? "var(--lime)" : "transparent", color: activeType === t ? "var(--dark)" : "var(--muted)" }}>
              {t}
            </button>
          ))}
          <span style={{ width: "1px", backgroundColor: "var(--border)", margin: "0 0.25rem" }} />
          {sectors.map((s) => (
            <button key={s} onClick={() => setActiveSector(s)} style={{ padding: "0.45rem 1.1rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", border: "1px solid", borderColor: activeSector === s ? "var(--lime)" : "var(--border)", backgroundColor: activeSector === s ? "var(--lime)" : "transparent", color: activeSector === s ? "var(--dark)" : "var(--muted)" }}>
              {s}
            </button>
          ))}
        </motion.div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "2rem", alignItems: "start" }}>

          {/* Job list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.length === 0 && (
              <p style={{ color: "var(--muted)", padding: "2rem 0" }}>Geen vacatures gevonden voor deze filters.</p>
            )}
            {filtered.map((job, i) => (
              <motion.button
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onClick={() => setSelected(selected === job.id ? null : job.id)}
                style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "1rem", padding: "1.5rem 1rem", borderBottom: "1px solid var(--border)", background: "none", cursor: "pointer", textAlign: "left", width: "100%", backgroundColor: selected === job.id ? "rgba(223,253,123,0.04)" : "transparent", borderLeft: selected === job.id ? "2px solid var(--lime)" : "2px solid transparent", transition: "all 0.2s" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--white)" }}>{job.title}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{job.location} · {job.sector} · {job.regime}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: job.type === "Vast" ? "var(--lime)" : "var(--muted)", border: `1px solid ${job.type === "Vast" ? "rgba(223,253,123,0.3)" : "var(--border)"}`, padding: "0.25rem 0.75rem", borderRadius: "3px" }}>
                    {job.type}
                  </span>
                  <span style={{ color: selected === job.id ? "var(--lime)" : "var(--muted)", fontSize: "1rem", transition: "color 0.2s" }}>
                    {selected === job.id ? "×" : "↗"}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Job detail panel */}
          {selectedJob && (
            <motion.div
              key={String(selectedJob.id)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{ position: "sticky", top: "calc(72px + 2rem)", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "8px", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              <div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: selectedJob.type === "Vast" ? "var(--lime)" : "var(--muted)", border: `1px solid ${selectedJob.type === "Vast" ? "rgba(223,253,123,0.3)" : "var(--border)"}`, padding: "0.25rem 0.75rem", borderRadius: "3px" }}>
                    {selectedJob.type}
                  </span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--muted)", border: "1px solid var(--border)", padding: "0.25rem 0.75rem", borderRadius: "3px" }}>
                    {selectedJob.location}
                  </span>
                </div>
                <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", fontWeight: 400, letterSpacing: "0.02em", color: "var(--white)", lineHeight: 1.0, marginBottom: "1rem" }}>
                  {selectedJob.title}
                </h2>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                  {selectedJob.beschrijving}
                </p>
              </div>

              {selectedJob.profiel.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--lime)", marginBottom: "0.75rem" }}>Jouw profiel</p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedJob.profiel.map((p) => (
                      <li key={p} style={{ display: "flex", gap: "0.75rem", color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--lime)", flexShrink: 0 }}>—</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.aanbod.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--lime)", marginBottom: "0.75rem" }}>Wat we bieden</p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedJob.aanbod.map((a) => (
                      <li key={a} style={{ display: "flex", gap: "0.75rem", color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--lime)", flexShrink: 0 }}>✓</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <a
                href={`mailto:${mail}?subject=Sollicitatie: ${selectedJob.title}`}
                style={{ backgroundColor: "var(--lime)", color: "var(--dark)", padding: "1rem 2rem", borderRadius: "6px", fontSize: "0.9rem", fontWeight: 600, textDecoration: "none", textAlign: "center" as const }}
              >
                Solliciteer voor deze job
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
