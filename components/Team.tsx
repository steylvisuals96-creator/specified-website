"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const team = [
  {
    name: "Tom",
    surname: "Wijdooghe",
    role: "Managing Partner",
    bio: "Founder & partner at Specified. Tom is a seasoned professional within engineering consultancy. Eager to make a change in the consultancy world with over 10 years' experience in the industry. Always ready to go the extra mile.",
    linkedin: "https://www.linkedin.com/in/tom-wijdooghe/",
    img: "/images/team/IMG_5734-768x1024.jpg",
    photoSide: "left" as const,
  },
  {
    name: "Simon",
    surname: "Claeys",
    role: "Managing Partner",
    bio: "Founder & partner at Specified. Voormalig engineer, begrijpt als geen ander wat kandidaten drijft en wat bedrijven écht nodig hebben om te groeien.",
    linkedin: "https://www.linkedin.com/in/simon-claeys-specified/",
    img: "/images/team/Simon-768x1024.jpeg",
    photoSide: "right" as const,
  },
];

export default function Team() {
  const ref = useRef(null);

  return (
    <section id="over-ons" ref={ref} style={{ borderTop: "1px solid var(--border)", position: "relative" }}>
      {/* Header */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem) 3rem" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2.8rem, 5vw, 5rem)", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.0, color: "var(--white)" }}
        >
          Twee founders. Eén missie.
        </motion.h2>
      </div>

      {/* Team cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {team.map((member, i) => {
          const isLeft = member.photoSide === "left";
          return (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "grid", gridTemplateColumns: "1fr 400px 1fr", minHeight: "520px" }}
            >
              {/* Col A */}
              {isLeft ? (
                <div style={{ position: "relative", overflow: "hidden", minHeight: "520px" }}>
                  <Image src={member.img} alt={`${member.name} ${member.surname}`} fill style={{ objectFit: "cover", objectPosition: "top center" }} />
                </div>
              ) : (
                <div style={{ backgroundColor: "rgba(30,30,33,0.6)", borderRight: "1px solid var(--border)" }} />
              )}

              {/* Col B — lime panel */}
              <div style={{ backgroundColor: "var(--lime)", padding: "clamp(2.5rem, 4vw, 4rem) clamp(2rem, 3vw, 3rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.25rem" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2.8rem, 4vw, 4.2rem)", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 0.95, color: "var(--dark)" }}>
                    {member.name}<br />{member.surname}
                  </h3>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(50,50,54,0.55)", marginTop: "0.5rem" }}>
                    {member.role}
                  </p>
                </div>
                <p style={{ color: "rgba(50,50,54,0.75)", fontSize: "0.875rem", fontWeight: 300, lineHeight: 1.7 }}>
                  {member.bio}
                </p>
                <motion.a
                  href={member.linkedin} target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "var(--dark)", color: "var(--white)", padding: "0.8rem 1.6rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", width: "fit-content" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  Connect on LinkedIn
                </motion.a>
              </div>

              {/* Col C */}
              {isLeft ? (
                <div style={{ backgroundColor: "rgba(30,30,33,0.6)", borderLeft: "1px solid var(--border)" }} />
              ) : (
                <div style={{ position: "relative", overflow: "hidden", minHeight: "520px" }}>
                  <Image src={member.img} alt={`${member.name} ${member.surname}`} fill style={{ objectFit: "cover", objectPosition: "top center" }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div style={{ height: "clamp(4rem, 8vw, 7rem)" }} />
    </section>
  );
}
