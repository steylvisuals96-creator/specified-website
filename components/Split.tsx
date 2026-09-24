"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/settings";
import { useClamped } from "@/lib/scroll";

type Card = {
  id: string;
  tag: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  accent: boolean;
};

/**
 * Eén kaart in de stapel. Ze plakt vast onder de header; zodra de volgende
 * kaart eroverheen schuift, krimpt deze iets en wordt ze donkerder.
 */
function StackCard({
  card,
  i,
  count,
  progress,
}: {
  card: Card;
  i: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const isLast = i === count - 1;
  const startShrink = i / count;
  const scale = useTransform(progress, [startShrink, 1], [1, isLast ? 1 : 1 - (count - 1 - i) * 0.06]);
  const dim = useClamped(progress, [startShrink, 1], [0, isLast ? 0 : 0.45]);

  return (
    <div
      id={card.id}
      className="stack-slot"
      style={{
        position: "sticky",
        top: `calc(96px + ${i * 28}px)`,
        height: "calc(100svh - 140px)",
        minHeight: "420px",
        maxHeight: "680px",
        marginBottom: isLast ? 0 : "12vh",
      }}
    >
      <motion.div
        className="scroll-fx stack-card"
        style={{
          scale,
          transformOrigin: "50% 0%",
          position: "relative",
          height: "100%",
          overflow: "hidden",
          backgroundColor: card.accent ? "var(--lime)" : "#2a2a2e",
          border: card.accent ? "none" : "1px solid var(--border)",
          borderRadius: "8px",
          padding: "clamp(2rem, 5vw, 4.5rem)",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          gap: "1.5rem",
          boxShadow: "0 -30px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: `1px solid ${card.accent ? "rgba(50,50,54,0.2)" : "rgba(255,255,255,0.1)"}`, paddingBottom: "0.9rem" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: 500, color: card.accent ? "rgba(50,50,54,0.6)" : "rgba(255,255,255,0.45)" }}>
            {card.tag}
          </span>
          <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.4rem", color: card.accent ? "rgba(50,50,54,0.45)" : "rgba(255,255,255,0.3)" }}>
            {String(i + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(2.8rem, 7vw, 6.5rem)",
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: "0.01em",
            color: card.accent ? "var(--dark)" : "var(--white)",
            maxWidth: "16ch",
            alignSelf: "center",
          }}
        >
          {card.title}
        </h2>

        <div className="stack-foot" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <p style={{ fontSize: "1rem", fontWeight: 300, lineHeight: 1.65, maxWidth: "46ch", color: card.accent ? "rgba(50,50,54,0.75)" : "var(--muted)" }}>
            {card.body}
          </p>
          <motion.a
            href={card.href}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              color: card.accent ? "var(--dark)" : "var(--lime)",
              borderBottom: `1px solid ${card.accent ? "rgba(50,50,54,0.3)" : "rgba(223,253,123,0.3)"}`,
              paddingBottom: "2px",
              width: "fit-content",
              whiteSpace: "nowrap",
            }}
            whileHover={{ gap: "0.85rem" }}
          >
            {card.cta} <span aria-hidden="true">→</span>
          </motion.a>
        </div>

        {/* Verdonkering zodra de volgende kaart eroverheen komt */}
        <motion.div
          aria-hidden="true"
          className="scroll-fx-fade"
          style={{ opacity: dim, position: "absolute", inset: 0, background: "#000", pointerEvents: "none" }}
        />
      </motion.div>
    </div>
  );
}

export default function Split({ settings = {} }: { settings?: SiteSettings }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const cards: Card[] = [
    {
      id: "kandidaten",
      tag: settings.kandidaten_tag || "Voor kandidaten",
      title: settings.kandidaten_titel || "Jouw carrière verdient een echte partner",
      body: settings.kandidaten_tekst || "We luisteren eerst. Pas daarna zoeken we. Samen bepalen we welke stap écht past bij wie jij bent en waar je naartoe wil groeien als engineer.",
      cta: settings.kandidaten_cta || "Bekijk openstaande jobs",
      href: "#jobs",
      accent: true,
    },
    {
      id: "opdrachtgevers",
      tag: settings.bedrijven_tag || "Voor bedrijven",
      title: settings.bedrijven_titel || "Engineering talent dat echt het verschil maakt",
      body: settings.bedrijven_tekst || "Geen CV-schieten. Wij screenen diep, valideren technisch en leveren enkel kandidaten die passen bij jouw cultuur, stack en ambitie.",
      cta: settings.bedrijven_cta || "Vertel ons wat je zoekt",
      href: "#contact",
      accent: false,
    },
  ];

  return (
    <section
      id="diensten"
      data-chapter="Diensten"
      ref={ref}
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "2rem", gap: "1rem" }}>
        <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--lime)" }}>
          Wat we doen
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Voor kandidaten én bedrijven</p>
      </div>
      {cards.map((card, i) => (
        <StackCard key={card.id} card={card} i={i} count={cards.length} progress={scrollYProgress} />
      ))}
    </section>
  );
}
