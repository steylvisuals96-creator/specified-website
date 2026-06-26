"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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
    linkedin: "https://www.linkedin.com/in/simon-claeys/",
    img: "/images/team/Simon-768x1024.jpeg",
    photoSide: "right" as const,
  },
];

/* 3D Logo shape — dome (top half of the logo mark) */
const DomeShape = () => (
  <svg viewBox="0 0 26.3 13" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="currentColor" d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
  </svg>
);

/* 3D Logo shape — arch (bottom curve of the logo mark) */
const ArchShape = () => (
  <svg viewBox="0 0 25.8 9.6" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="currentColor" d="M.7,0C1.7,2.4,3.3,4.4,5.5,5.8c2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4C6.6,1.4,5.5.1,4.7-1.5L.7,0Z"/>
  </svg>
);

/* Full logo mark (dome + arch stacked) */
const FullMark = () => (
  <svg viewBox="0 0 26.3 24.4" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="currentColor" d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
    <path fill="currentColor" d="M1.2,16.4c1,2.4,2.6,4.4,4.8,5.8,2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4c-1.4-.9-2.5-2.3-3.2-3.9l-4,1.7Z"/>
  </svg>
);

function Shape3D({
  size,
  top,
  left,
  right,
  bottom,
  rotateXRange,
  rotateYRange,
  rotateZRange,
  yRange,
  xRange,
  scaleRange,
  opacity,
  color,
  type,
  scrollYProgress,
  spin,
}: {
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  rotateXRange: [number, number];
  rotateYRange: [number, number];
  rotateZRange: [number, number];
  yRange: [number, number];
  xRange: [number, number];
  scaleRange: [number, number];
  opacity: number;
  color: string;
  type: "dome" | "arch" | "full";
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  spin?: boolean;
}) {
  const rotX = useSpring(useTransform(scrollYProgress, [0, 1], rotateXRange), { stiffness: 60, damping: 20 });
  const rotY = useSpring(useTransform(scrollYProgress, [0, 1], rotateYRange), { stiffness: 60, damping: 20 });
  const rotZ = useSpring(useTransform(scrollYProgress, [0, 1], rotateZRange), { stiffness: 60, damping: 20 });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], yRange), { stiffness: 60, damping: 20 });
  const x = useSpring(useTransform(scrollYProgress, [0, 1], xRange), { stiffness: 60, damping: 20 });
  const scale = useSpring(useTransform(scrollYProgress, [0, 1], scaleRange), { stiffness: 60, damping: 20 });

  return (
    <motion.div
      style={{
        position: "absolute",
        top,
        left,
        right,
        bottom,
        width: size,
        height: size,
        color,
        opacity,
        pointerEvents: "none",
        rotateX: rotX,
        rotateY: rotY,
        rotateZ: rotZ,
        y,
        x,
        scale,
        transformStyle: "preserve-3d",
      }}
      animate={spin ? { rotateZ: 360 } : undefined}
      transition={spin ? { duration: 12, repeat: Infinity, ease: "linear" } : undefined}
    >
      {type === "dome" && <DomeShape />}
      {type === "arch" && <ArchShape />}
      {type === "full" && <FullMark />}
    </motion.div>
  );
}

export default function Team() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section
      id="over-ons"
      ref={ref}
      style={{
        borderTop: "1px solid var(--border)",
        position: "relative",
        overflow: "hidden",
        perspective: "1200px",
      }}
    >
      {/* ── 3D FLOATING SHAPES ── */}
      {/* Giant spinning full mark — centre background */}
      <Shape3D type="full" size={600} top="10%" left="50%" opacity={0.04}
        rotateXRange={[0, 40]} rotateYRange={[0, 60]} rotateZRange={[0, 30]}
        yRange={[-60, 80]} xRange={[-300, -300]} scaleRange={[1, 1.3]}
        color="var(--lime)" scrollYProgress={scrollYProgress} spin />

      {/* Large dome — top left */}
      <Shape3D type="dome" size={380} top="-60px" left="-80px" opacity={0.13}
        rotateXRange={[0, 55]} rotateYRange={[-20, 40]} rotateZRange={[10, 80]}
        yRange={[0, 120]} xRange={[0, 40]} scaleRange={[1, 0.7]}
        color="var(--lime)" scrollYProgress={scrollYProgress} />

      {/* Medium arch — top right */}
      <Shape3D type="arch" size={260} top="5%" right="-40px" opacity={0.18}
        rotateXRange={[0, -45]} rotateYRange={[0, -70]} rotateZRange={[0, -120]}
        yRange={[0, 180]} xRange={[0, -30]} scaleRange={[1, 1.4]}
        color="var(--lime)" scrollYProgress={scrollYProgress} />

      {/* Small dome — mid left */}
      <Shape3D type="dome" size={140} top="35%" left="2%" opacity={0.22}
        rotateXRange={[20, -30]} rotateYRange={[0, 80]} rotateZRange={[-10, 200]}
        yRange={[0, -80]} xRange={[0, 60]} scaleRange={[1, 1.6]}
        color="#ffffff" scrollYProgress={scrollYProgress} />

      {/* Medium full mark — bottom right */}
      <Shape3D type="full" size={220} bottom="5%" right="3%" opacity={0.15}
        rotateXRange={[-15, 50]} rotateYRange={[10, -60]} rotateZRange={[0, 160]}
        yRange={[0, -100]} xRange={[0, -20]} scaleRange={[0.8, 1.3]}
        color="var(--lime)" scrollYProgress={scrollYProgress} />

      {/* Tiny arch — bottom left */}
      <Shape3D type="arch" size={90} bottom="15%" left="5%" opacity={0.3}
        rotateXRange={[0, 90]} rotateYRange={[0, 45]} rotateZRange={[0, 270]}
        yRange={[0, -60]} xRange={[0, 30]} scaleRange={[1, 2]}
        color="#ffffff" scrollYProgress={scrollYProgress} spin />

      {/* XL outline dome — far right mid */}
      <Shape3D type="dome" size={500} top="40%" right="-180px" opacity={0.06}
        rotateXRange={[0, -60]} rotateYRange={[0, 30]} rotateZRange={[-20, 100]}
        yRange={[0, -200]} xRange={[0, -60]} scaleRange={[1, 0.6]}
        color="var(--lime)" scrollYProgress={scrollYProgress} />

      {/* Header */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "clamp(4rem, 8vw, 7rem) clamp(1.5rem, 5vw, 4rem) 3rem", position: "relative", zIndex: 2 }}>
        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem" }}
        >
          Over ons
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2.8rem, 5vw, 5rem)", fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.0, color: "var(--white)" }}
        >
          Twee founders. Eén missie.
        </motion.h2>
      </div>

      {/* Team cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px", position: "relative", zIndex: 2 }}>
        {team.map((member, i) => {
          const isLeft = member.photoSide === "left";
          return (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 400px 1fr",
                minHeight: "520px",
              }}
            >
              {/* Col A */}
              {isLeft ? (
                /* Photo left */
                <div style={{ position: "relative", overflow: "hidden", minHeight: "520px" }}>
                  <Image src={member.img} alt={`${member.name} ${member.surname}`} fill style={{ objectFit: "cover", objectPosition: "top center" }} />
                </div>
              ) : (
                /* Dark filler left */
                <div style={{ backgroundColor: "var(--dark-2)", borderRight: "1px solid var(--border)" }} />
              )}

              {/* Col B — lime panel (always center) */}
              <div style={{
                backgroundColor: "var(--lime)",
                padding: "clamp(2.5rem, 4vw, 4rem) clamp(2rem, 3vw, 3rem)",
                display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.25rem",
              }}>
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
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", backgroundColor: "var(--dark)", color: "var(--white)", padding: "0.8rem 1.6rem", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 500, textDecoration: "none", width: "fit-content" }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                  Connect on LinkedIn
                </motion.a>
              </div>

              {/* Col C */}
              {isLeft ? (
                /* Dark filler right */
                <div style={{ backgroundColor: "var(--dark-2)", borderLeft: "1px solid var(--border)" }} />
              ) : (
                /* Photo right */
                <div style={{ position: "relative", overflow: "hidden", minHeight: "520px" }}>
                  <Image src={member.img} alt={`${member.name} ${member.surname}`} fill style={{ objectFit: "cover", objectPosition: "top center" }} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom padding */}
      <div style={{ height: "clamp(4rem, 8vw, 7rem)", position: "relative", zIndex: 2 }} />
    </section>
  );
}
