"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="contact"
      ref={ref}
      style={{
        padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          backgroundColor: "var(--lime)",
          borderRadius: "28px",
          padding: "clamp(3rem, 6vw, 5rem)",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
        className="md:flex-row md:items-end md:justify-between"
      >
        <div style={{ maxWidth: "520px" }}>
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(50,50,54,0.55)",
              marginBottom: "1.25rem",
            }}
          >
            Klaar om te starten?
          </p>
          <h2
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(3rem, 6vw, 6rem)",
              fontWeight: 400,
              letterSpacing: "0.02em",
              lineHeight: 0.95,
              color: "var(--dark)",
            }}
          >
            Laten we kennismaken.
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <motion.a
            href="mailto:hello@specified.be"
            style={{
              backgroundColor: "var(--dark)",
              color: "var(--white)",
              padding: "1rem 2.2rem",
              borderRadius: "100px",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              textAlign: "center",
              whiteSpace: "nowrap",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            hello@specified.be
          </motion.a>
          <a
            href="tel:+3234601234"
            style={{
              color: "rgba(50,50,54,0.6)",
              textDecoration: "none",
              fontSize: "0.85rem",
              fontWeight: 400,
              textAlign: "center",
            }}
          >
            +32 3 460 12 34
          </a>
        </div>
      </motion.div>
    </section>
  );
}
