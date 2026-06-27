"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const jobs = [
  {
    title: "Structural Engineer",
    type: "Vast",
    location: "Antwerpen",
    sector: "Bouw & Infra",
  },
  {
    title: "Mechanical Design Engineer",
    type: "Interim",
    location: "Gent",
    sector: "Manufacturing",
  },
  {
    title: "Project Manager Civil",
    type: "Vast",
    location: "Brussel",
    sector: "Infra",
  },
  {
    title: "Electrical Engineer HVAC",
    type: "Vast",
    location: "Leuven",
    sector: "Techniek",
  },
  {
    title: "Process Engineer",
    type: "Interim",
    location: "Gent",
    sector: "Chemie & Pharma",
  },
];

export default function Jobs() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="jobs"
      ref={ref}
      style={{
        padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "3rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(2.8rem, 5vw, 5rem)",
                fontWeight: 400,
                letterSpacing: "0.02em",
                lineHeight: 1.0,
                color: "var(--white)",
              }}
            >
              Vind jouw volgende stap.
            </motion.h2>
          </div>
          <motion.a
            href="/vacatures"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            style={{
              fontSize: "0.875rem",
              color: "var(--lime)",
              textDecoration: "none",
              fontWeight: 500,
              borderBottom: "1px solid rgba(223,253,123,0.3)",
              paddingBottom: "2px",
            }}
          >
            Alle vacatures
          </motion.a>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {jobs.map((job, i) => (
            <motion.a
              key={job.title}
              href="#"
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: "1rem",
                padding: "1.5rem 0",
                borderBottom: "1px solid var(--border)",
                textDecoration: "none",
                cursor: "pointer",
              }}
              whileHover={{ x: 6 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "var(--white)",
                  }}
                >
                  {job.title}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--muted)",
                    fontWeight: 400,
                  }}
                >
                  {job.location} · {job.sector}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: job.type === "Vast" ? "var(--lime)" : "var(--muted)",
                    border: `1px solid ${job.type === "Vast" ? "rgba(223,253,123,0.3)" : "var(--border)"}`,
                    padding: "0.2rem 0.65rem",
                    borderRadius: "3px",
                  }}
                >
                  {job.type}
                </span>
                <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>↗</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
