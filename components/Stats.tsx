"use client";

import { motion, useScroll, useTransform, useMotionValue, useMotionValueEvent, type MotionValue } from "framer-motion";
import { useRef, useEffect } from "react";
import { useClamped } from "@/lib/scroll";

type StatItem = { value: number; suffix: string; label: string };

const fallbackStats: StatItem[] = [
  { value: 200, suffix: "+", label: "Plaatsingen gedaan" },
  { value: 98, suffix: "%", label: "Retentie na 1 jaar" },
  { value: 3, suffix: " wk", label: "Gemiddelde time-to-hire" },
  { value: 50, suffix: "+", label: "Partnerbedrijven" },
];

// Zet "200+" of "3 wk" om naar { value: 200, suffix: "+" }
function parseStat(waarde: string): { value: number; suffix: string } {
  const match = waarde.match(/^\s*([\d.,]+)(.*)$/);
  if (!match) return { value: 0, suffix: waarde };
  return { value: parseInt(match[1].replace(/[.,]/g, ""), 10) || 0, suffix: match[2] };
}

/** Het getal telt mee met de scroll: halverwege de sectie staat het op zijn eindwaarde. */
function ScrubNumber({ to, suffix, progress }: { to: number; suffix: string; progress: MotionValue<number> }) {
  const text = useTransform(progress, (p) => `${Math.round(p * to)}${suffix}`);
  return <motion.span>{text}</motion.span>;
}

function Cell({ s, i, progress }: { s: StatItem; i: number; progress: MotionValue<number> }) {
  // Elke cel komt iets later binnen dan de vorige.
  const local = useTransform(progress, [i * 0.08, 0.7 + i * 0.08], [0, 1], { clamp: true });
  const y = useTransform(local, [0, 1], [60, 0]);
  const opacity = useClamped(local, [0, 0.4], [0, 1]);

  return (
    <motion.div className="stat-cell scroll-fx" style={{ y, opacity, padding: "2rem clamp(1rem, 3vw, 2.5rem)" }}>
      <p
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(3.5rem, 7vw, 7rem)",
          fontWeight: 400,
          letterSpacing: "0.02em",
          color: "var(--lime)",
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}
      >
        <ScrubNumber to={s.value} suffix={s.suffix} progress={local} />
      </p>
      <p style={{ color: "var(--muted)", fontSize: "0.875rem", fontWeight: 400 }}>{s.label}</p>
    </motion.div>
  );
}

export default function Stats({ items }: { items?: { waarde: string; label: string }[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });

  // Eigen motion value, zodat "reduce motion" de cijfers meteen op hun eindwaarde kan zetten.
  const progress = useMotionValue(0);
  const reduced = useRef(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduced.current) progress.set(v);
  });
  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    progress.set(reduced.current ? 1 : scrollYProgress.get());
  }, [progress, scrollYProgress]);

  const stats: StatItem[] = items && items.length > 0
    ? items.map((s) => ({ ...parseStat(s.waarde), label: s.label }))
    : fallbackStats;

  return (
    <section
      ref={ref}
      style={{
        borderBottom: "1px solid var(--border)",
        padding: "clamp(4rem, 9vw, 8rem) clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      <div
        className="stats-grid"
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0",
        }}
      >
        {stats.map((s, i) => (
          <Cell key={s.label} s={s} i={i} progress={progress} />
        ))}
      </div>
    </section>
  );
}
