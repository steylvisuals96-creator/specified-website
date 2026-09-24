"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

const FALLBACK_ITEMS = [
  "Civiele techniek",
  "Elektrotechniek",
  "Werktuigbouwkunde",
  "Bouw & Infrastructuur",
  "Energie & Utilities",
  "IT & Software",
  "Industrie & Productie",
  "Projectmanagement",
];

function Row({ list, reverse, drift }: { list: string[]; reverse?: boolean; drift: MotionValue<number> }) {
  // Drie keer de lijst: de CSS-animatie schuift een derde op, de scroll-drift
  // er nog bovenop, en er mag nooit een gat aan de rand verschijnen.
  const track = [...list, ...list, ...list];
  return (
    <motion.div className="scroll-fx" style={{ x: drift, width: "max-content" }}>
      <div className={reverse ? "marquee-track marquee-track--reverse" : "marquee-track"}>
        {track.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "1.5rem",
              padding: "0 1.5rem",
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(2rem, 4.5vw, 4rem)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              lineHeight: 1.1,
              color: i % 2 === 0 ? "transparent" : "var(--lime)",
              WebkitTextStroke: i % 2 === 0 ? "1px rgba(255,255,255,0.35)" : "0",
              whiteSpace: "nowrap",
            }}
          >
            {item}
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(223,253,123,0.35)", display: "inline-block" }} />
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Marquee({ items }: { items?: string[] }) {
  const list = items && items.length > 0 ? items : FALLBACK_ITEMS;
  const ref = useRef<HTMLDivElement>(null);

  // Scrollen duwt de rijen extra op, in tegengestelde richting.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const left = useTransform(scrollYProgress, [0, 1], [0, -400]);
  const right = useTransform(scrollYProgress, [0, 1], [-400, 0]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        overflow: "hidden",
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "1.5rem 0",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        background: "rgba(223,253,123,0.02)",
      }}
    >
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.3333%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .marquee-track--reverse { animation-direction: reverse; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>
      <Row list={list} drift={left} />
      <Row list={[...list].reverse()} reverse drift={right} />
    </div>
  );
}
