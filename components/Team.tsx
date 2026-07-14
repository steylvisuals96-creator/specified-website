"use client";

import { motion } from "framer-motion";
import { useRef } from "react";
import { rolLabel, type TeamMember } from "@/lib/settings";

const FALLBACK: TeamMember[] = [
  {
    id: "tom",
    voornaam: "Tom",
    achternaam: "Wijdooghe",
    rol: "managing_partner",
    bio: "Founder & partner at Specified. Tom is a seasoned professional within engineering consultancy. Eager to make a change in the consultancy world with over 10 years' experience in the industry. Always ready to go the extra mile.",
    linkedin: "https://www.linkedin.com/in/tom-wijdooghe/",
    fotoUrl: "/images/team/IMG_5734-768x1024.jpg",
  },
  {
    id: "simon",
    voornaam: "Simon",
    achternaam: "Claeys",
    rol: "managing_partner",
    bio: "Founder & partner at Specified. Voormalig engineer, begrijpt als geen ander wat kandidaten drijft en wat bedrijven écht nodig hebben om te groeien.",
    linkedin: "https://www.linkedin.com/in/simon-claeys-specified/",
    fotoUrl: "/images/team/Simon-768x1024.jpeg",
  },
];

export default function Team({
  members,
  titel,
  titelAccent,
}: {
  members?: TeamMember[];
  titel?: string;
  titelAccent?: string;
}) {
  const ref = useRef(null);
  const list = members && members.length > 0 ? members : FALLBACK;
  const heading = [titel || "Twee founders.", titelAccent || "Eén missie."].filter(Boolean).join(" ");

  return (
    <section id="over-ons" ref={ref} style={{ borderTop: "1px solid var(--border)", position: "relative" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem) 3rem" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2.8rem, 5vw, 5rem)", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.0, color: "var(--white)" }}
        >
          {heading}
        </motion.h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {list.map((member, i) => {
          const isLeft = i % 2 === 0;
          const naam = member.voornaam || "";
          const achternaam = member.achternaam || "";
          const foto = member.fotoUrl ? (
            <div style={{ position: "relative", overflow: "hidden", minHeight: "520px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={member.fotoUrl} alt={`${naam} ${achternaam}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
            </div>
          ) : (
            <div style={{ backgroundColor: "rgba(30,30,33,0.6)", minHeight: "520px" }} />
          );
          const filler = <div style={{ backgroundColor: "rgba(30,30,33,0.6)", borderRight: isLeft ? "1px solid var(--border)" : "none", borderLeft: isLeft ? "none" : "1px solid var(--border)" }} />;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "grid", gridTemplateColumns: "1fr 400px 1fr", minHeight: "520px" }}
            >
              {isLeft ? foto : filler}

              <div style={{ backgroundColor: "var(--lime)", padding: "clamp(2.5rem, 4vw, 4rem) clamp(2rem, 3vw, 3rem)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.25rem" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2.8rem, 4vw, 4.2rem)", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 0.95, color: "var(--dark)" }}>
                    {naam}<br />{achternaam}
                  </h3>
                  {member.rol && (
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(50,50,54,0.55)", marginTop: "0.5rem" }}>
                      {rolLabel(member.rol)}
                    </p>
                  )}
                </div>
                {member.bio && (
                  <p style={{ color: "rgba(50,50,54,0.75)", fontSize: "0.875rem", fontWeight: 300, lineHeight: 1.7 }}>
                    {member.bio}
                  </p>
                )}
                {member.linkedin && (
                  <motion.a
                    href={member.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "var(--dark)", color: "var(--white)", padding: "0.8rem 1.6rem", borderRadius: "4px", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", width: "fit-content" }}
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    Connect on LinkedIn
                  </motion.a>
                )}
              </div>

              {isLeft ? filler : foto}
            </motion.div>
          );
        })}
      </div>

      <div style={{ height: "clamp(4rem, 8vw, 7rem)" }} />
    </section>
  );
}
