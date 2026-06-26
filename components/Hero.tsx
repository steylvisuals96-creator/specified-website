"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.1, ease: EASE },
  }),
};

export default function Hero() {
  return (
    <section
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "calc(72px + 5rem) clamp(1.5rem, 5vw, 4rem) clamp(3rem, 6vh, 5rem)",
        maxWidth: "1280px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Tag */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--lime)",
            display: "inline-block",
          }}
        />
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--lime)",
          }}
        >
          Engineering Recruitment — België
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(5rem, 13vw, 12rem)",
          fontWeight: 400,
          lineHeight: 0.95,
          letterSpacing: "0.01em",
          color: "var(--white)",
          maxWidth: "14ch",
          marginBottom: "2.5rem",
        }}
      >
        We{" "}
        <em
          style={{
            fontStyle: "normal",
            color: "var(--lime)",
          }}
        >
          engineer
        </em>
        <br />
        possibilities.
      </motion.h1>

      {/* Bottom row */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        <p
          style={{
            color: "var(--muted)",
            fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
            fontWeight: 300,
            lineHeight: 1.6,
            maxWidth: "480px",
          }}
        >
          Specified verbindt uitzonderlijke engineers met bedrijven die bouwen aan morgen. Geen standaard recruitment — wij gaan dieper.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <motion.a
            href="#kandidaten"
            style={{
              backgroundColor: "var(--lime)",
              color: "var(--dark)",
              padding: "0.9rem 2rem",
              borderRadius: "100px",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Ik zoek een job →
          </motion.a>
          <motion.a
            href="#opdrachtgevers"
            style={{
              border: "1px solid var(--border)",
              color: "var(--white)",
              padding: "0.9rem 2rem",
              borderRadius: "100px",
              fontSize: "0.9rem",
              fontWeight: 400,
              textDecoration: "none",
              backgroundColor: "transparent",
            }}
            whileHover={{
              borderColor: "rgba(255,255,255,0.4)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            Ik zoek talent →
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
