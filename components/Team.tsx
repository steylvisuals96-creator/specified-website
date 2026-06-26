"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const team = [
  {
    name: "Tom Wijdooghe",
    role: "Managing Partner",
    bio: "10+ jaar ervaring in engineering recruitment. Bouwde partnerships met 's lands grootste infrastructuurgroepen.",
    img: "/images/team/IMG_5734-768x1024.jpg",
  },
  {
    name: "Simon Claeys",
    role: "Managing Partner",
    bio: "Voormalig engineer. Begrijpt als geen ander wat kandidaten drijft en wat bedrijven écht nodig hebben.",
    img: "/images/team/Simon-768x1024.jpeg",
  },
];

export default function Team() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="over-ons"
      ref={ref}
      style={{
        padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "4rem",
          }}
          className="md:grid-cols-2"
        >
          {/* Left — text */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: "1.5rem",
              }}
            >
              Over ons
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(2.8rem, 5vw, 5rem)",
                fontWeight: 400,
                letterSpacing: "0.02em",
                lineHeight: 1.0,
                color: "var(--white)",
                marginBottom: "1.5rem",
              }}
            >
              Twee founders.
              <br />
              Eén missie.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                color: "var(--muted)",
                fontSize: "0.95rem",
                fontWeight: 300,
                lineHeight: 1.7,
                maxWidth: "420px",
              }}
            >
              Specified is opgericht door mensen uit het werkveld. We kennen de sector, begrijpen de druk en geloven dat goede mensen bij goede bedrijven een enorm verschil maken.
            </motion.p>
          </div>

          {/* Right — team cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, x: 24 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.75rem 2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                      border: "2px solid var(--border)",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={member.img}
                      alt={member.name}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--white)" }}>
                      {member.name}
                    </p>
                    <p style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 400 }}>
                      {member.role}
                    </p>
                  </div>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.6, fontWeight: 300 }}>
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
