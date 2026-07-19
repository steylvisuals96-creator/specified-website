"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const FALLBACK_WORDS = ["engineer", "shape", "unlock", "build", "define"];

const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, delay: i * 0.1, ease: EASE },
  }),
};

const FALLBACK_SUBTITLE =
  "At Specified, we envision a dynamic engineering landscape where innovation thrives and endless opportunities abound. We believe that no single person or company can capture the vast potential of the engineering world.\n\nTherefore, we are committed to fostering entrepreneurship among our engineers, empowering them to become experts in their fields.";

export default function Hero({
  prefix,
  woorden,
  suffix,
  subtitle,
  ctaPrimary,
  ctaSecondary,
}: {
  prefix?: string;
  woorden?: { woord: string }[];
  suffix?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
} = {}) {
  const [wordIndex, setWordIndex] = useState(0);

  const words = woorden && woorden.length > 0 ? woorden.map((w) => w.woord) : FALLBACK_WORDS;
  const heroPrefix = prefix ?? "We";
  const heroSuffix = suffix ?? "possibilities.";

  const paragraphs = (subtitle || FALLBACK_SUBTITLE)
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  useEffect(() => {
    const t = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2600);
    return () => clearInterval(t);
  }, [words.length]);

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
      <motion.h1
        className="hero-title"
        custom={0}
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
        {heroPrefix}{" "}
        <span
          className="hero-word"
          style={{
            display: "inline-block",
            position: "relative",
            color: "var(--lime)",
            overflow: "hidden",
            verticalAlign: "bottom",
            minWidth: "5ch",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={words[wordIndex]}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              style={{ display: "block" }}
            >
              {words[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
        <br />
        {heroSuffix}
      </motion.h1>

      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{ display: "flex", flexDirection: "column", gap: "2rem" }}
      >
        {paragraphs.map((para, i) => (
          <p key={i} style={{
            color: "var(--muted)",
            fontSize: "clamp(1rem, 1.5vw, 1.15rem)",
            fontWeight: 400,
            lineHeight: 1.55,
            maxWidth: "480px",
          }}>
            {para}
          </p>
        ))}

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <motion.a
            href="#kandidaten"
            style={{
              backgroundColor: "var(--lime)",
              color: "var(--dark)",
              padding: "0.85rem 1.75rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
            whileHover={{ backgroundColor: "#cef056", scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {ctaPrimary || "Ik zoek een job"}
          </motion.a>
          <motion.a
            href="#opdrachtgevers"
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              color: "var(--white)",
              padding: "0.85rem 1.75rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: 400,
              textDecoration: "none",
              backgroundColor: "transparent",
            }}
            whileHover={{ borderColor: "rgba(255,255,255,0.5)", scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {ctaSecondary || "Ik zoek talent"}
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
