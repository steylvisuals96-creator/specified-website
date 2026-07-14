"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/settings";

export default function Split({ settings = {} }: { settings?: SiteSettings }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const cards = [
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
      ref={ref}
      style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "1.5rem",
        }}
        className="md:grid-cols-2"
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            id={card.id}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundColor: card.accent ? "var(--lime)" : "rgba(255,255,255,0.04)",
              border: card.accent ? "none" : "1px solid var(--border)",
              borderRadius: "4px",
              padding: "clamp(2rem, 4vw, 3.5rem)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              minHeight: "380px",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 500,
                color: card.accent ? "rgba(50,50,54,0.55)" : "rgba(255,255,255,0.4)",
                borderBottom: `1px solid ${card.accent ? "rgba(50,50,54,0.2)" : "rgba(255,255,255,0.1)"}`,
                paddingBottom: "0.75rem",
                display: "block",
              }}
            >
              {card.tag}
            </span>

            <h2
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(2.4rem, 4vw, 3.5rem)",
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "0.02em",
                color: card.accent ? "var(--dark)" : "var(--white)",
                flex: 1,
              }}
            >
              {card.title}
            </h2>

            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 300,
                lineHeight: 1.65,
                color: card.accent ? "rgba(50,50,54,0.7)" : "var(--muted)",
              }}
            >
              {card.body}
            </p>

            <motion.a
              href={card.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                textDecoration: "none",
                color: card.accent ? "var(--dark)" : "var(--lime)",
                borderBottom: `1px solid ${card.accent ? "rgba(50,50,54,0.3)" : "rgba(223,253,123,0.3)"}`,
                paddingBottom: "2px",
                width: "fit-content",
              }}
              whileHover={{ gap: "0.85rem" }}
            >
              {card.cta}
            </motion.a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
