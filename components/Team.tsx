"use client";

import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
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

function MemberPanel({
  member,
  i,
  count,
  progress,
}: {
  member: TeamMember;
  i: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const naam = member.voornaam || "";
  const achternaam = member.achternaam || "";

  // Panelen staan op posities 1..count in een track van count+1 schermen.
  // Rond het moment dat dit paneel in beeld schuift, zoomt de foto uit.
  const center = (i + 1) / count;
  const imgScale = useTransform(progress, [center - 1 / count, center], [1.25, 1]);

  return (
    <div className="team-panel" style={{ flex: "0 0 100vw", height: "100%", display: "flex", alignItems: "center", padding: "calc(72px + 2rem) clamp(1.5rem, 5vw, 4rem) 2rem" }}>
      <div className="team-panel-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 440px)", width: "100%", maxWidth: "1280px", height: "100%", maxHeight: "760px", margin: "0 auto" }}>
        <div className="team-foto" style={{ position: "relative", overflow: "hidden", borderRadius: "8px 0 0 8px", backgroundColor: "rgba(30,30,33,0.6)" }}>
          {member.fotoUrl && (
            <motion.img
              className="scroll-fx"
              src={member.fotoUrl}
              alt={`${naam} ${achternaam}`}
              style={{ scale: imgScale, position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
            />
          )}
          <span style={{ position: "absolute", left: "1.5rem", bottom: "1.25rem", fontFamily: "var(--font-bebas)", fontSize: "clamp(4rem, 9vw, 8rem)", lineHeight: 0.8, color: "var(--lime)", mixBlendMode: "difference" }}>
            {String(i + 1).padStart(2, "0")}
          </span>
        </div>

        <div className="team-card" style={{ backgroundColor: "var(--lime)", borderRadius: "0 8px 8px 0", padding: "clamp(2rem, 4vw, 3.5rem)", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: "1.25rem" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(3rem, 5vw, 5rem)", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 0.92, color: "var(--dark)" }}>
              {naam}<br />{achternaam}
            </h3>
            {member.rol && (
              <p style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(50,50,54,0.55)", marginTop: "0.5rem" }}>
                {rolLabel(member.rol)}
              </p>
            )}
          </div>
          {member.bio && (
            <p style={{ color: "rgba(50,50,54,0.75)", fontSize: "0.9rem", fontWeight: 300, lineHeight: 1.7 }}>
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
      </div>
    </div>
  );
}

/**
 * Horizontale scroll: de sectie is (leden + 1) schermen hoog en blijft
 * vastgepind, terwijl de rij panelen van rechts naar links schuift.
 * Op smalle schermen en bij "reduce motion" valt dit terug op een gewone
 * verticale lijst (zie .team-pin in globals.css).
 */
export default function Team({
  members,
  titel,
  titelAccent,
}: {
  members?: TeamMember[];
  titel?: string;
  titelAccent?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const list = members && members.length > 0 ? members : FALLBACK;
  const panels = list.length + 1;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${((panels - 1) / panels) * 100}%`]);
  const headingX = useTransform(scrollYProgress, [0, 1 / (panels - 1)], [0, -160]);

  return (
    <section
      id="over-ons"
      data-chapter="Over ons"
      ref={ref}
      className="team-pin"
      style={{ borderTop: "1px solid var(--border)", position: "relative", height: `${panels * 100}vh` }}
    >
      <div className="team-sticky" style={{ position: "sticky", top: 0, height: "100svh", overflow: "hidden" }}>
        <motion.div className="team-track scroll-fx" style={{ x, display: "flex", height: "100%", width: `${panels * 100}vw` }}>
          {/* Paneel 0: de kop */}
          <div className="team-intro" style={{ flex: "0 0 100vw", height: "100%", display: "flex", alignItems: "center", padding: "72px clamp(1.5rem, 5vw, 4rem) 0" }}>
            <motion.div className="scroll-fx" style={{ x: headingX, maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--lime)", marginBottom: "1.5rem" }}>
                Over ons
              </p>
              <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(4rem, 12vw, 11rem)", fontWeight: 400, letterSpacing: "0.01em", lineHeight: 0.9, color: "var(--white)" }}>
                {titel || "Twee founders."}
                <br />
                <span style={{ color: "var(--lime)" }}>{titelAccent || "Eén missie."}</span>
              </h2>
              <p className="team-intro-hint" style={{ marginTop: "2rem", color: "var(--muted)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                Blijf scrollen <span aria-hidden="true">→</span>
              </p>
            </motion.div>
          </div>

          {list.map((member, i) => (
            <MemberPanel key={member.id} member={member} i={i} count={list.length} progress={scrollYProgress} />
          ))}
        </motion.div>

        {/* Hoe ver je door de horizontale rij bent */}
        <div className="team-progress" aria-hidden="true" style={{ position: "absolute", left: "50%", bottom: "1.25rem", transform: "translateX(-50%)", width: "min(240px, 40vw)", height: 2, background: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" }}>
          <motion.div style={{ scaleX: scrollYProgress, transformOrigin: "0% 50%", height: "100%", background: "var(--lime)" }} />
        </div>
      </div>
    </section>
  );
}
