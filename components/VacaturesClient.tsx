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
  ervaring: string;
  salaris: string;
  opdrachtgever: string;
  beschrijving: string[];
  profiel: string[];
  niceToHave: string[];
  aanbod: string[];
};

const ALLE = "Alle";

/** De losse waarden die in deze lijst écht voorkomen. */
function opties(vacatures: Vacature[], veld: keyof Vacature): string[] {
  return Array.from(new Set(vacatures.map((v) => v[veld] as string).filter(Boolean)));
}

function FilterGroep({
  label,
  waarden,
  actief,
  onKies,
}: {
  label: string;
  waarden: string[];
  actief: string;
  onKies: (v: string) => void;
}) {
  // Eén optie kan niets filteren. Zo'n knop belooft controle die er niet is,
  // dus tonen we de groep pas als er echt iets te kiezen valt.
  if (waarden.length < 2) return null;

  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      {/* Het label staat op een eigen regel: naast de knoppen liepen die bij
          het afbreken onder het label door en oogde de rij rafelig. */}
      <legend
        style={{
          fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "var(--muted)",
          padding: 0, marginBottom: "0.6rem",
        }}
      >
        {label}
      </legend>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      {[ALLE, ...waarden].map((w) => {
        const isActief = actief === w;
        return (
          <button
            key={w}
            type="button"
            aria-pressed={isActief}
            onClick={() => onKies(w)}
            style={{
              padding: "0.45rem 1.1rem", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s", border: "1px solid",
              borderColor: isActief ? "var(--lime)" : "var(--border)",
              backgroundColor: isActief ? "var(--lime)" : "transparent",
              color: isActief ? "var(--dark)" : "var(--muted)",
            }}
          >
            {w}
          </button>
        );
      })}
      </div>
    </fieldset>
  );
}

export default function VacaturesClient({ vacatures, titel, contactEmail }: { vacatures: Vacature[]; titel?: string; contactEmail?: string }) {
  const mail = contactEmail || "info@specified.be";
  const sectors = opties(vacatures, "sector");
  const types = opties(vacatures, "type");
  const ervaringen = opties(vacatures, "ervaring");

  const [activeSector, setActiveSector] = useState(ALLE);
  const [activeType, setActiveType] = useState(ALLE);
  const [activeErvaring, setActiveErvaring] = useState(ALLE);
  const [selected, setSelected] = useState<string | number | null>(null);

  const filtered = vacatures.filter(
    (v) =>
      (activeSector === ALLE || v.sector === activeSector) &&
      (activeType === ALLE || v.type === activeType) &&
      (activeErvaring === ALLE || v.ervaring === activeErvaring)
  );

  const selectedJob = vacatures.find((v) => v.id === selected);

  // De ondertitel beschreef altijd "vaste en interim posities", ook toen er
  // geen enkele interimpositie openstond. Nu volgt hij de werkelijke lijst.
  const TYPE_MEERVOUD: Record<string, string> = {
    Vast: "vaste posities",
    Interim: "interimopdrachten",
    Freelance: "freelanceopdrachten",
    Student: "studentenjobs",
  };
  const typeOmschrijving = types
    .map((t) => TYPE_MEERVOUD[t] ?? t.toLowerCase())
    .reduce((zin, deel, i, arr) => {
      if (i === 0) return deel;
      return i === arr.length - 1 ? `${zin} en ${deel}` : `${zin}, ${deel}`;
    }, "");

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
          <h1 className="vac-title" style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(4rem, 9vw, 8rem)", fontWeight: 400, letterSpacing: "0.01em", lineHeight: 0.95, color: "var(--white)", marginBottom: "1.5rem" }}>
            {titel || "Jouw volgende stap."}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: "480px", lineHeight: 1.6 }}>
            {filtered.length} vacature{filtered.length !== 1 ? "s" : ""} gevonden
            {typeOmschrijving && ` — ${typeOmschrijving} in engineering`}.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          style={{ display: "flex", flexDirection: "column", gap: "1.4rem", marginBottom: "2.5rem", paddingBottom: "2.5rem", borderBottom: "1px solid var(--border)" }}
        >
          {/* Elke dimensie krijgt een eigen rij met een naam. Voorheen stonden
              twee groepen in één rij, gescheiden door een lijn van 1px op 8%
              wit — op mobiel onzichtbaar, waardoor twee actieve knoppen als
              één meervoudige selectie lazen. */}
          <FilterGroep label="Sector" waarden={sectors} actief={activeSector} onKies={setActiveSector} />
          <FilterGroep label="Contract" waarden={types} actief={activeType} onKies={setActiveType} />
          <FilterGroep label="Ervaring" waarden={ervaringen} actief={activeErvaring} onKies={setActiveErvaring} />
        </motion.div>

        {/* Two-column layout */}
        <div className="vac-grid" style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap: "2rem", alignItems: "start" }}>

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
                type="button"
                aria-expanded={selected === job.id}
                onClick={() => setSelected(selected === job.id ? null : job.id)}
                style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: "1rem", padding: "1.5rem 1rem", borderBottom: "1px solid var(--border)", background: "none", cursor: "pointer", textAlign: "left", width: "100%", backgroundColor: selected === job.id ? "rgba(223,253,123,0.04)" : "transparent", borderLeft: selected === job.id ? "2px solid var(--lime)" : "2px solid transparent", transition: "all 0.2s" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--white)" }}>{job.title}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {[job.location, job.sector, job.ervaring, job.salaris].filter(Boolean).join(" · ")}
                  </span>
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
              className="vac-detail"
              style={{ position: "sticky", top: "calc(72px + 2rem)", backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: "8px", padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}
            >
              <div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: selectedJob.type === "Vast" ? "var(--lime)" : "var(--muted)", border: `1px solid ${selectedJob.type === "Vast" ? "rgba(223,253,123,0.3)" : "var(--border)"}`, padding: "0.25rem 0.75rem", borderRadius: "3px" }}>
                    {selectedJob.type}
                  </span>
                  {[selectedJob.location, selectedJob.ervaring, selectedJob.salaris, selectedJob.opdrachtgever]
                    .filter(Boolean)
                    .map((chip) => (
                      <span key={chip} style={{ fontSize: "0.65rem", fontWeight: 500, color: "var(--muted)", border: "1px solid var(--border)", padding: "0.25rem 0.75rem", borderRadius: "3px" }}>
                        {chip}
                      </span>
                    ))}
                </div>
                <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", fontWeight: 400, letterSpacing: "0.02em", color: "var(--white)", lineHeight: 1.0, marginBottom: "1rem" }}>
                  {selectedJob.title}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {selectedJob.beschrijving.map((alinea, i) => (
                    <p key={i} style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>
                      {alinea}
                    </p>
                  ))}
                </div>
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

              {selectedJob.niceToHave.length > 0 && (
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--lime)", marginBottom: "0.75rem" }}>Nice to have</p>
                  <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {selectedJob.niceToHave.map((n) => (
                      <li key={n} style={{ display: "flex", gap: "0.75rem", color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.5 }}>
                        <span style={{ color: "var(--muted)", flexShrink: 0 }}>+</span>
                        {n}
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
