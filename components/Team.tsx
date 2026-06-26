"use client";

import { motion, useScroll, useTransform } from "framer-motion";
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
  },
  {
    name: "Simon",
    surname: "Claeys",
    role: "Managing Partner",
    bio: "Founder & partner at Specified. Voormalig engineer, begrijpt als geen ander wat kandidaten drijft en wat bedrijven écht nodig hebben om te groeien.",
    linkedin: "https://www.linkedin.com/in/simon-claeys/",
    img: "/images/team/Simon-768x1024.jpeg",
  },
];

/* Logo shapes as SVG paths — extracted from logo_specified.svg */
function LogoShapes({ scrollYProgress }: { scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const rotateA = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const rotateB = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const rotateC = useTransform(scrollYProgress, [0, 1], [15, 200]);
  const yA = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const yB = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const yC = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 0.9]);

  const shapeStyle = (rotate: typeof rotateA, y: typeof yA, size: number, opacity: number, right?: boolean) => ({
    position: "absolute" as const,
    [right ? "right" : "left"]: right ? "-60px" : "-40px",
    top: "50%",
    width: `${size}px`,
    height: `${size}px`,
    opacity,
    pointerEvents: "none" as const,
    rotate,
    y,
    scale,
    translateY: "-50%",
  });

  return (
    <>
      {/* Big dome shape — top left */}
      <motion.div
        style={{
          position: "absolute",
          left: "-80px",
          top: "10%",
          width: "220px",
          height: "220px",
          opacity: 0.12,
          pointerEvents: "none",
          rotate: rotateA,
          y: yA,
        }}
      >
        <svg viewBox="0 0 26.3 13" xmlns="http://www.w3.org/2000/svg">
          <path fill="#dffd7b" d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
        </svg>
      </motion.div>

      {/* Arch shape — right side */}
      <motion.div
        style={{
          position: "absolute",
          right: "-60px",
          bottom: "15%",
          width: "180px",
          height: "180px",
          opacity: 0.1,
          pointerEvents: "none",
          rotate: rotateB,
          y: yB,
        }}
      >
        <svg viewBox="0 26 25.8 9" xmlns="http://www.w3.org/2000/svg">
          <path fill="#dffd7b" d="M1.2,16.4c1,2.4,2.6,4.4,4.8,5.8,2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4c-1.4-.9-2.5-2.3-3.2-3.9l-4,1.7Z"/>
        </svg>
      </motion.div>

      {/* Small dome — bottom left */}
      <motion.div
        style={{
          position: "absolute",
          left: "5%",
          bottom: "-40px",
          width: "120px",
          height: "120px",
          opacity: 0.08,
          pointerEvents: "none",
          rotate: rotateC,
          y: yC,
        }}
      >
        <svg viewBox="0 0 26.3 13" xmlns="http://www.w3.org/2000/svg">
          <path fill="#dffd7b" d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
        </svg>
      </motion.div>
    </>
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
        padding: "clamp(4rem, 8vw, 7rem) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <LogoShapes scrollYProgress={scrollYProgress} />

      {/* Header */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 clamp(1.5rem, 5vw, 4rem)", marginBottom: "3rem" }}>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: "0.75rem",
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "0.75rem",
          }}
        >
          Over ons
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(2.8rem, 5vw, 5rem)",
            fontWeight: 400,
            letterSpacing: "0.02em",
            lineHeight: 1.0,
            color: "var(--white)",
          }}
        >
          Twee founders. Eén missie.
        </motion.h2>
      </div>

      {/* Team cards — full width */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
        {team.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "grid",
              gridTemplateColumns: i % 2 === 0 ? "1fr 420px 1fr" : "1fr 420px 1fr",
              minHeight: "520px",
              position: "relative",
            }}
            className="team-card"
          >
            {/* Photo left */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                minHeight: "520px",
                order: i % 2 === 0 ? 0 : 2,
              }}
            >
              <Image
                src={member.img}
                alt={member.name + " " + member.surname}
                fill
                style={{ objectFit: "cover", objectPosition: "top center" }}
              />
              {/* Dark overlay on non-lime side */}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(30,30,33,0.3), transparent)" }} />
            </div>

            {/* Lime center panel */}
            <div
              style={{
                backgroundColor: "var(--lime)",
                padding: "clamp(2.5rem, 4vw, 4rem) clamp(2rem, 3vw, 3rem)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "1.25rem",
                order: 1,
                zIndex: 1,
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: "clamp(2.8rem, 5vw, 4.5rem)",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                    lineHeight: 0.95,
                    color: "var(--dark)",
                  }}
                >
                  {member.name}
                  <br />
                  {member.surname}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-avenir)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(50,50,54,0.6)",
                    marginTop: "0.5rem",
                  }}
                >
                  {member.role}
                </p>
              </div>

              <p
                style={{
                  color: "rgba(50,50,54,0.75)",
                  fontSize: "0.9rem",
                  fontWeight: 300,
                  lineHeight: 1.65,
                }}
              >
                {member.bio}
              </p>

              <motion.a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  backgroundColor: "var(--dark)",
                  color: "var(--white)",
                  padding: "0.8rem 1.6rem",
                  borderRadius: "100px",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  textDecoration: "none",
                  width: "fit-content",
                }}
                whileHover={{ scale: 1.04, backgroundColor: "#1a1a1d" }}
                whileTap={{ scale: 0.97 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                Connect on LinkedIn
              </motion.a>
            </div>

            {/* Photo right (only for second member) */}
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                minHeight: "520px",
                order: i % 2 === 0 ? 2 : 0,
                display: i % 2 === 0 ? "none" : "block",
              }}
              className="team-photo-right"
            >
              <Image
                src={member.img}
                alt={member.name + " " + member.surname}
                fill
                style={{ objectFit: "cover", objectPosition: "top center" }}
              />
            </div>

            {/* Dark filler for even items */}
            {i % 2 === 0 && (
              <div
                style={{
                  backgroundColor: "var(--dark-2)",
                  order: 2,
                  borderLeft: "1px solid var(--border)",
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
