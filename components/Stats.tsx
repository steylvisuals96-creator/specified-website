"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const stats = [
  { value: 200, suffix: "+", label: "Plaatsingen gedaan" },
  { value: 98, suffix: "%", label: "Retentie na 1 jaar" },
  { value: 3, suffix: " wk", label: "Gemiddelde time-to-hire" },
  { value: 50, suffix: "+", label: "Partnerbedrijven" },
];

function CountUp({ to, suffix, start }: { to: number; suffix: string; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    const duration = 1600;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * to));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [start, to]);

  return <>{count}{suffix}</>;
}

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      style={{
        borderTop: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
        padding: "clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0",
        }}
        className="md:grid-cols-4"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={{
              padding: "2rem clamp(1rem, 3vw, 2.5rem)",
              borderRight: i < 3 ? "1px solid var(--border)" : "none",
              borderBottom: i < 2 ? "1px solid var(--border)" : "none",
            }}
          >
            <p style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(3rem, 5vw, 5rem)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              color: "var(--lime)",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}>
              <CountUp to={s.value} suffix={s.suffix} start={inView} />
            </p>
            <p style={{ color: "var(--muted)", fontSize: "0.875rem", fontWeight: 400 }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
