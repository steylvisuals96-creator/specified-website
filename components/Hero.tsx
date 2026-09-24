"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useClamped } from "@/lib/scroll";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const FALLBACK_WORDS = ["engineer", "shape", "unlock", "build", "define"];

const fadeUp = {
  hidden: { opacity: 0, y: 48 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, delay: i * 0.1, ease: EASE },
  }),
};

export default function Hero({
  prefix,
  woorden,
  suffix,
  ctaPrimary,
  ctaSecondary,
}: {
  prefix?: string;
  woorden?: { woord: string }[];
  suffix?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
} = {}) {
  const [wordIndex, setWordIndex] = useState(0);
  const ref = useRef<HTMLElement>(null);

  const words = woorden && woorden.length > 0 ? woorden.map((w) => w.woord) : FALLBACK_WORDS;
  const heroPrefix = prefix ?? "We";
  const heroSuffix = suffix ?? "possibilities.";

  // De hero blijft even staan en zakt dan weg: kleiner, vager, naar boven.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Zakt weg naar achter in plaats van omhoog: zo schuift de titel nooit
  // onder de header en wordt hij niet afgesneden.
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.86]);
  const opacity = useClamped(scrollYProgress, [0.2, 0.75], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, 60]);
  const hintOpacity = useClamped(scrollYProgress, [0, 0.08], [1, 0]);

  useEffect(() => {
    const t = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2600);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <section ref={ref} className="hero-pin" style={{ position: "relative", height: "135vh" }}>
      <div
        className="hero-sticky"
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          overflow: "hidden",
        }}
      >
        <motion.div
          className="scroll-fx"
          style={{
            scale,
            opacity,
            y,
            transformOrigin: "0% 100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "calc(72px + 3rem) clamp(1.5rem, 5vw, 4rem) clamp(4rem, 10vh, 7rem)",
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
              fontSize: "clamp(5rem, 15vw, 14rem)",
              fontWeight: 400,
              lineHeight: 0.92,
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
            style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
          >
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
          </motion.div>
        </motion.div>

        {/* Scroll-hint: verdwijnt zodra je begint te scrollen */}
        <motion.div
          aria-hidden="true"
          className="scroll-hint"
          style={{
            opacity: hintOpacity,
            position: "absolute",
            right: "clamp(1.5rem, 5vw, 4rem)",
            bottom: "clamp(2rem, 5vh, 3rem)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Scroll
          <span className="scroll-hint-line" />
        </motion.div>
      </div>
    </section>
  );
}
