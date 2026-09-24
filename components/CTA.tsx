"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function CTA({ titel, email, telefoon }: { titel?: string; email?: string; telefoon?: string }) {
  const ref = useRef<HTMLElement>(null);

  // Het blok groeit vanuit het midden open terwijl het in beeld schuift.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [48, 8]);
  const titleY = useTransform(scrollYProgress, [0.3, 1], [80, 0]);

  const mail = email || "info@specified.be";
  const tel = telefoon || "";

  return (
    <section
      id="contact"
      data-chapter="Contact"
      ref={ref}
      style={{
        padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      <motion.div
        className="cta-box scroll-fx"
        style={{
          scale,
          borderRadius: radius,
          maxWidth: "1280px",
          minHeight: "min(70svh, 640px)",
          margin: "0 auto",
          backgroundColor: "var(--lime)",
          padding: "clamp(3rem, 6vw, 5rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "2.5rem",
          overflow: "hidden",
        }}
      >
        <motion.h2
          className="scroll-fx"
          style={{
            y: titleY,
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(3.5rem, 10vw, 9.5rem)",
            fontWeight: 400,
            letterSpacing: "0.01em",
            lineHeight: 0.9,
            color: "var(--dark)",
            maxWidth: "10ch",
          }}
        >
          {titel || "Laten we kennismaken."}
        </motion.h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <motion.a
            href={`mailto:${mail}`}
            style={{
              backgroundColor: "var(--dark)",
              color: "var(--white)",
              padding: "1rem 2.2rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {mail}
          </motion.a>
          {tel && (
            <a
              href={`tel:${tel.replace(/\s/g, "")}`}
              style={{
                color: "rgba(50,50,54,0.6)",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 400,
                textAlign: "center",
              }}
            >
              {tel}
            </a>
          )}
        </div>
      </motion.div>
    </section>
  );
}
