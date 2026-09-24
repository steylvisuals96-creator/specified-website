"use client";

import { motion, useScroll, type MotionValue } from "framer-motion";
import { useClamped } from "@/lib/scroll";
import { useRef } from "react";

const FALLBACK_TEXT =
  "At Specified, we envision a dynamic engineering landscape where innovation thrives and endless opportunities abound. We believe that no single person or company can capture the vast potential of the engineering world.\n\nTherefore, we are committed to fostering entrepreneurship among our engineers, empowering them to become experts in their fields.";

function Word({
  children,
  progress,
  range,
}: {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useClamped(progress, range, [0.14, 1]);
  return (
    <motion.span className="scroll-fx" style={{ opacity, display: "inline-block", marginRight: "0.28em" }}>
      {children}
    </motion.span>
  );
}

/**
 * De visietekst licht woord voor woord op terwijl je scrolt. De sectie is
 * hoger dan het scherm; de tekst blijft vastgepind tot alles gelezen is.
 */
export default function Manifesto({ text, label }: { text?: string; label?: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const paragraphs = (text || FALLBACK_TEXT)
    .split("\n\n")
    .map((p) => p.trim().split(/\s+/).filter(Boolean))
    .filter((p) => p.length > 0);

  const total = paragraphs.reduce((n, p) => n + p.length, 0);
  // Laatste 15% van de scroll: alles staat al volledig, even laten staan.
  const span = 0.85;
  let index = 0;

  return (
    <section ref={ref} className="manifesto-pin" style={{ position: "relative", height: "260vh" }}>
      <div
        className="manifesto-sticky"
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          display: "flex",
          alignItems: "center",
          padding: "72px clamp(1.5rem, 5vw, 4rem) 0",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--lime)",
              marginBottom: "2rem",
            }}
          >
            {label || "Waar we voor staan"}
          </p>
          <div
            className="manifesto-text"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.4em",
              fontSize: "clamp(1.5rem, 3.2vw, 3rem)",
              fontWeight: 500,
              lineHeight: 1.22,
              letterSpacing: "-0.01em",
              color: "var(--white)",
              maxWidth: "1000px",
            }}
          >
            {paragraphs.map((words, pi) => (
              <p key={pi}>
                {words.map((w, wi) => {
                  const start = (index / total) * span;
                  const end = ((index + 1) / total) * span;
                  index++;
                  return (
                    <Word key={wi} progress={scrollYProgress} range={[start, end]}>
                      {w}
                    </Word>
                  );
                })}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
