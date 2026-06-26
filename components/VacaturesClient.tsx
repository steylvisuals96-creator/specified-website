"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const vacatures = [
  {
    id: 1,
    title: "Structural Engineer",
    type: "Vast",
    location: "Antwerpen",
    sector: "Bouw & Infra",
    regime: "Voltijds",
    beschrijving:
      "Je werkt mee aan complexe infrastructuurprojecten in de regio Antwerpen. Je staat in voor de constructieve berekeningen, de technische dossiers en de opvolging op de werf.",
    profiel: [
      "Master Burgerlijk Ingenieur of Industrieel Ingenieur Bouwkunde",
      "Min. 3 jaar ervaring in structurele berekeningen",
      "Kennis van Eurocodes",
      "Teamplayer met oog voor detail",
    ],
    aanbod: ["Competitief loon + bedrijfswagen", "Flexibele uren", "Groeipad naar senior"],
  },
  {
    id: 2,
    title: "Mechanical Design Engineer",
    type: "Interim",
    location: "Gent",
    sector: "Manufacturing",
    regime: "Voltijds",
    beschrijving:
      "Voor een toonaangevend productiebedrijf in Gent zoeken we een Mechanical Design Engineer die meewerkt aan de ontwikkeling van nieuwe machines en productielijnen.",
    profiel: [
      "Bachelor of Master Mechanica",
      "Ervaring met SolidWorks of CATIA",
      "Proactieve werker die zelfstandig projecten opneemt",
    ],
    aanbod: ["Aantrekkelijk dagtarief", "Kans op vaste aanwerving", "Dynamisch team"],
  },
  {
    id: 3,
    title: "Project Manager Civil",
    type: "Vast",
    location: "Brussel",
    sector: "Infra",
    regime: "Voltijds",
    beschrijving:
      "Je coördineert civiele bouwprojecten van A tot Z: planning, budgetbeheer, stakeholdermanagement en werfopvolging. Je rapporteert aan de directeur projecten.",
    profiel: [
      "Master Burgerlijk Ingenieur",
      "Min. 5 jaar PM-ervaring in civiele bouw",
      "Sterke communicatieve vaardigheden (NL/FR)",
      "Rijbewijs B",
    ],
    aanbod: ["Marktconform loon", "Hospitalisatieverzekering", "32 verlofdagen"],
  },
  {
    id: 4,
    title: "Electrical Engineer HVAC",
    type: "Vast",
    location: "Leuven",
    sector: "Techniek",
    regime: "Voltijds",
    beschrijving:
      "Je ontwerpt en dimensioneert elektrotechnische installaties met focus op HVAC-systemen voor kantoor- en industriegebouwen in de regio Vlaams-Brabant.",
    profiel: [
      "Bachelor of Master Elektrotechniek",
      "Kennis van HVAC-regelingen en BMS",
      "Ervaring met AutoCAD of Revit MEP is een plus",
    ],
    aanbod: ["Netto onkostenvergoeding", "Opleidingsbudget", "Thuiswerk 2d/week"],
  },
  {
    id: 5,
    title: "Process Engineer",
    type: "Interim",
    location: "Gent",
    sector: "Chemie & Pharma",
    regime: "Voltijds",
    beschrijving:
      "Je optimaliseert chemische productieprocessen en ondersteunt de implementatie van nieuwe installaties op een site in de Gentse havenzone.",
    profiel: [
      "Master Chemie of Bio-ingenieurswetenschappen",
      "Kennis van procesoptimalisatie en Lean",
      "Ervaring in chemie of pharma is vereist",
    ],
    aanbod: ["Competitief dagtarief", "Langetermijnmissie", "Internationaal team"],
  },
  {
    id: 6,
    title: "Site Engineer",
    type: "Vast",
    location: "Hasselt",
    sector: "Bouw & Infra",
    regime: "Voltijds",
    beschrijving:
      "Je bent de spil op de werf: je bewaakt de planning, kwaliteit en veiligheid van residentiële en commerciële bouwprojecten in Limburg.",
    profiel: [
      "Bachelor Bouwkunde",
      "Eerste werkervaring als werfleider of site engineer",
      "Stressbestendig en hands-on",
    ],
    aanbod: ["Aantrekkelijk brutoloon", "Bedrijfswagen + tankkaart", "Snel groeipad"],
  },
];

const sectors = ["Alle sectoren", "Bouw & Infra", "Manufacturing", "Infra", "Techniek", "Chemie & Pharma"];
const types = ["Alle types", "Vast", "Interim"];

export default function VacaturesClient() {
  const [activeSector, setActiveSector] = useState("Alle sectoren");
  const [activeType, setActiveType] = useState("Alle types");
  const [selected, setSelected] = useState<number | null>(null);

  const filtered = vacatures.filter((v) => {
    const sectorOk = activeSector === "Alle sectoren" || v.sector === activeSector;
    const typeOk = activeType === "Alle types" || v.type === activeType;
    return sectorOk && typeOk;
  });

  const selectedJob = vacatures.find((v) => v.id === selected);

  return (
    <section
      style={{
        paddingTop: "calc(72px + 4rem)",
        paddingBottom: "6rem",
        minHeight: "100svh",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 clamp(1.5rem, 5vw, 4rem)",
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ marginBottom: "3rem" }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--lime)",
              marginBottom: "1rem",
            }}
          >
            Open posities
          </p>
          <h1
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(4rem, 9vw, 8rem)",
              fontWeight: 400,
              letterSpacing: "0.01em",
              lineHeight: 0.95,
              color: "var(--white)",
              marginBottom: "1.5rem",
            }}
          >
            Jouw volgende stap.
          </h1>
          <p
            style={{
              color: "var(--muted)",
              fontSize: "1rem",
              fontWeight: 300,
              maxWidth: "480px",
              lineHeight: 1.6,
            }}
          >
            {filtered.length} vacature{filtered.length !== 1 ? "s" : ""} gevonden — vaste en interim posities in engineering.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "2.5rem",
            paddingBottom: "2.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: "100px",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                border: "1px solid",
                borderColor: activeType === t ? "var(--lime)" : "var(--border)",
                backgroundColor: activeType === t ? "var(--lime)" : "transparent",
                color: activeType === t ? "var(--dark)" : "var(--muted)",
              }}
            >
              {t}
            </button>
          ))}
          <span style={{ width: "1px", backgroundColor: "var(--border)", margin: "0 0.25rem" }} />
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSector(s)}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: "100px",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s",
                border: "1px solid",
                borderColor: activeSector === s ? "var(--lime)" : "var(--border)",
                backgroundColor: activeSector === s ? "var(--lime)" : "transparent",
                color: activeSector === s ? "var(--dark)" : "var(--muted)",
              }}
            >
              {s}
            </button>
          ))}
        </motion.div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: selected ? "1fr 1fr" : "1fr",
            gap: "2rem",
            alignItems: "start",
          }}
          className={selected ? "md:grid-cols-2" : ""}
        >
          {/* Job list */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.length === 0 && (
              <p style={{ color: "var(--muted)", padding: "2rem 0" }}>
                Geen vacatures gevonden voor deze filters.
              </p>
            )}
            {filtered.map((job, i) => (
              <motion.button
                key={job.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                onClick={() => setSelected(selected === job.id ? null : job.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1.5rem 0",
                  borderBottom: "1px solid var(--border)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  backgroundColor: selected === job.id ? "rgba(223,253,123,0.04)" : "transparent",
                  borderLeft: selected === job.id ? "2px solid var(--lime)" : "2px solid transparent",
                  paddingLeft: "1rem",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--white)" }}>
                    {job.title}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 300 }}>
                    {job.location} · {job.sector} · {job.regime}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: job.type === "Vast" ? "var(--lime)" : "var(--muted)",
                      border: `1px solid ${job.type === "Vast" ? "rgba(223,253,123,0.3)" : "var(--border)"}`,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "100px",
                    }}
                  >
                    {job.type}
                  </span>
                  <span style={{ color: selected === job.id ? "var(--lime)" : "var(--muted)", fontSize: "1rem", transition: "color 0.2s" }}>
                    {selected === job.id ? "×" : "→"}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Job detail panel */}
          {selectedJob && (
            <motion.div
              key={selectedJob.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              style={{
                position: "sticky",
                top: "calc(72px + 2rem)",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "2.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
              }}
            >
              <div>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: selectedJob.type === "Vast" ? "var(--lime)" : "var(--muted)",
                      border: `1px solid ${selectedJob.type === "Vast" ? "rgba(223,253,123,0.3)" : "var(--border)"}`,
                      padding: "0.25rem 0.75rem",
                      borderRadius: "100px",
                    }}
                  >
                    {selectedJob.type}
                  </span>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      color: "var(--muted)",
                      border: "1px solid var(--border)",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "100px",
                    }}
                  >
                    {selectedJob.location}
                  </span>
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: "2.5rem",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    color: "var(--white)",
                    lineHeight: 1.0,
                    marginBottom: "1rem",
                  }}
                >
                  {selectedJob.title}
                </h2>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.9rem",
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}
                >
                  {selectedJob.beschrijving}
                </p>
              </div>

              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--lime)", marginBottom: "0.75rem" }}>
                  Jouw profiel
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedJob.profiel.map((p) => (
                    <li key={p} style={{ display: "flex", gap: "0.75rem", color: "var(--muted)", fontSize: "0.875rem", fontWeight: 300, lineHeight: 1.5 }}>
                      <span style={{ color: "var(--lime)", flexShrink: 0 }}>—</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--lime)", marginBottom: "0.75rem" }}>
                  Wat we bieden
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {selectedJob.aanbod.map((a) => (
                    <li key={a} style={{ display: "flex", gap: "0.75rem", color: "var(--muted)", fontSize: "0.875rem", fontWeight: 300, lineHeight: 1.5 }}>
                      <span style={{ color: "var(--lime)", flexShrink: 0 }}>✓</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.a
                href={`mailto:hello@specified.be?subject=Sollicitatie: ${selectedJob.title}`}
                style={{
                  backgroundColor: "var(--lime)",
                  color: "var(--dark)",
                  padding: "1rem 2rem",
                  borderRadius: "100px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  textAlign: "center",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Solliciteer voor deze job →
              </motion.a>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
