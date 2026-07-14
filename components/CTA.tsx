"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function CTA({ titel, email, telefoon }: { titel?: string; email?: string; telefoon?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const mail = email || "hello@specified.be";
  const tel = telefoon || "";

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
          borderRadius: "6px",
          padding: "clamp(3rem, 6vw, 5rem)",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
        className="md:flex-row md:items-end md:justify-between"
      >
        <div style={{ maxWidth: "520px" }}>
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
            {titel || "Laten we kennismaken."}
          </h2>
        </div>

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
