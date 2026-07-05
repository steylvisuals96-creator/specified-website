"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

/* Outline-only shapes — engineering / technical drawing feel */
const DomeOutline = () => (
  <svg viewBox="0 0 26.3 13" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="none" stroke="currentColor" strokeWidth="0.6"
      d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
  </svg>
);

const ArchOutline = () => (
  <svg viewBox="0 0 25.8 9.6" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="none" stroke="currentColor" strokeWidth="0.6"
      d="M.7,0C1.7,2.4,3.3,4.4,5.5,5.8c2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4C6.6,1.4,5.5.1,4.7-1.5L.7,0Z"/>
  </svg>
);

const FullMarkOutline = () => (
  <svg viewBox="0 0 26.3 24.4" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="none" stroke="currentColor" strokeWidth="0.5"
      d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
    <path fill="none" stroke="currentColor" strokeWidth="0.5"
      d="M1.2,16.4c1,2.4,2.6,4.4,4.8,5.8,2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4c-1.4-.9-2.5-2.3-3.2-3.9l-4,1.7Z"/>
  </svg>
);

/* 5 shapes — deliberate placement, slow parallax, minimal rotation */
const shapes = [
  {
    // Top-right — large dome, rotates gently as you scroll
    type: "dome",
    size: 420,
    top: "-80px",
    right: "-60px",
    color: "var(--lime)",
    opacity: 0.18,
    yFactor: 0.18,   // moves down on scroll
    rzStart: -8,
    rzEnd: 12,
    rxStart: 0,
    rxEnd: 18,
  },
  {
    // Bottom-left — arch, floats upward
    type: "arch",
    size: 360,
    bottom: "12vh",
    left: "-50px",
    color: "var(--lime)",
    opacity: 0.14,
    yFactor: -0.12,
    rzStart: 6,
    rzEnd: -10,
    rxStart: 0,
    rxEnd: -14,
  },
  {
    // Centre — giant full mark, barely visible, very slow
    type: "full",
    size: 800,
    top: "30vh",
    left: "55vw",
    color: "var(--lime)",
    opacity: 0.04,
    yFactor: -0.06,
    rzStart: 0,
    rzEnd: 8,
    rxStart: 0,
    rxEnd: 10,
  },
  {
    // Mid-left — small dome, crisp accent
    type: "dome",
    size: 160,
    top: "48vh",
    left: "-20px",
    color: "#ffffff",
    opacity: 0.12,
    yFactor: -0.20,
    rzStart: 4,
    rzEnd: -16,
    rxStart: 0,
    rxEnd: 22,
  },
  {
    // Bottom-right — medium arch
    type: "arch",
    size: 240,
    bottom: "5vh",
    right: "-30px",
    color: "#ffffff",
    opacity: 0.10,
    yFactor: -0.14,
    rzStart: -5,
    rzEnd: 14,
    rxStart: 0,
    rxEnd: -20,
  },
];

// Binnenlaag: scroll-animatie (framer) + 3D diepte via translateZ
function ShapeInner({
  cfg,
  scrollYProgress,
}: {
  cfg: typeof shapes[number];
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const rawY  = useTransform(scrollYProgress, [0, 1], [0, -cfg.yFactor * 600]);
  const rawRZ = useTransform(scrollYProgress, [0, 1], [cfg.rzStart, cfg.rzEnd]);
  const rawRX = useTransform(scrollYProgress, [0, 1], [cfg.rxStart, cfg.rxEnd]);

  const y  = useSpring(rawY,  { stiffness: 25, damping: 20 });
  const rz = useSpring(rawRZ, { stiffness: 20, damping: 18 });
  const rx = useSpring(rawRX, { stiffness: 20, damping: 18 });

  const depth = (400 - cfg.size) * 0.7; // translateZ — grote vormen naar achter

  return (
    <motion.div
      style={{
        width:  cfg.size,
        height: cfg.size,
        color:  cfg.color,
        opacity: cfg.opacity,
        y,
        rotateZ: rz,
        rotateX: rx,
        z: depth,
        willChange: "transform",
      }}
    >
      {cfg.type === "dome" && <DomeOutline />}
      {cfg.type === "arch" && <ArchOutline />}
      {cfg.type === "full" && <FullMarkOutline />}
    </motion.div>
  );
}

// px verplaatsing per muis-eenheid — kleinere vormen bewegen sterker (dichterbij)
const parallaxFor = (size: number) => Math.max(8, (520 - size) / 6);

export default function PageShapes() {
  const { scrollYProgress } = useScroll();
  const fieldRef = useRef<HTMLDivElement>(null);
  const shapeEls = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const target = { x: 0, y: 0 };   // doel o.b.v. muis (-0.5 .. 0.5)
    const smooth = { x: 0, y: 0 };   // soepel gevolgde waarde

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove);

    let raf: number;
    const tick = () => {
      smooth.x += (target.x - smooth.x) * 0.06;
      smooth.y += (target.y - smooth.y) * 0.06;

      if (fieldRef.current) {
        fieldRef.current.style.transform = `rotateX(${-smooth.y * 10}deg) rotateY(${smooth.x * 10}deg)`;
      }
      shapeEls.current.forEach((el, i) => {
        if (!el) return;
        const p = parallaxFor(shapes[i].size);
        el.style.transform = `translate3d(${smooth.x * p}px, ${smooth.y * p}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        perspective: "1200px",
      }}
    >
      {/* Veld — kantelt in 3D met de muis (handmatige rAF, geen framer) */}
      <div
        ref={fieldRef}
        style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {shapes.map((cfg, i) => {
          const pos: Record<string, string | number> = {};
          if ("top"    in cfg) pos.top    = cfg.top as string;
          if ("bottom" in cfg) pos.bottom = cfg.bottom as string;
          if ("left"   in cfg) pos.left   = cfg.left as string;
          if ("right"  in cfg) pos.right  = cfg.right as string;
          return (
            // Buitenlaag: muis-parallax (handmatige rAF)
            <div
              key={i}
              ref={(el) => { shapeEls.current[i] = el; }}
              style={{ position: "absolute", ...pos, pointerEvents: "none", willChange: "transform" }}
            >
              <ShapeInner cfg={cfg} scrollYProgress={scrollYProgress} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
