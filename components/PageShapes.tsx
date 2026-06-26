"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const DomeShape = () => (
  <svg viewBox="0 0 26.3 13" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="currentColor" d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
  </svg>
);

const ArchShape = () => (
  <svg viewBox="0 0 25.8 9.6" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="currentColor" d="M.7,0C1.7,2.4,3.3,4.4,5.5,5.8c2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4C6.6,1.4,5.5.1,4.7-1.5L.7,0Z"/>
  </svg>
);

const FullMark = () => (
  <svg viewBox="0 0 26.3 24.4" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <path fill="currentColor" d="M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z"/>
    <path fill="currentColor" d="M1.2,16.4c1,2.4,2.6,4.4,4.8,5.8,2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4c-1.4-.9-2.5-2.3-3.2-3.9l-4,1.7Z"/>
  </svg>
);

const shapes = [
  // Hero zone
  { type: "dome",  size: 520, top:  "2vh",   left:  "-8vw",  color: "var(--lime)", opacity: 0.07, yFactor: -0.12, xFactor:  0.04, rzStart: -10,  rzEnd:  60,  rxStart:  0, rxEnd:  40, ryStart:  0, ryEnd:  30, spin: false },
  { type: "arch",  size: 280, top:  "8vh",   right: "-4vw",  color: "var(--lime)", opacity: 0.11, yFactor: -0.18, xFactor: -0.03, rzStart:  20,  rzEnd: -80,  rxStart: 10, rxEnd: -50, ryStart: -10, ryEnd:  60, spin: false },
  { type: "full",  size: 120, top:  "18vh",  left:  "6vw",   color: "#ffffff",     opacity: 0.08, yFactor: -0.25, xFactor:  0.06, rzStart:   0,  rzEnd: 180,  rxStart:  0, rxEnd:  90, ryStart:  0, ryEnd: -45, spin: true  },

  // Stats / split zone
  { type: "dome",  size: 380, top:  "30vh",  right: "-6vw",  color: "var(--lime)", opacity: 0.06, yFactor: -0.10, xFactor: -0.05, rzStart: -30,  rzEnd:  90,  rxStart: 20, rxEnd: -30, ryStart:  0, ryEnd:  80, spin: false },
  { type: "arch",  size: 160, top:  "38vh",  left:  "-3vw",  color: "#ffffff",     opacity: 0.12, yFactor: -0.20, xFactor:  0.08, rzStart:  45,  rzEnd: -90,  rxStart: -10,rxEnd:  60, ryStart: 30, ryEnd: -60, spin: false },
  { type: "full",  size: 700, top:  "28vh",  left:  "30vw",  color: "var(--lime)", opacity: 0.025,yFactor: -0.06, xFactor:  0.01, rzStart:   0,  rzEnd:  45,  rxStart:  0, rxEnd:  20, ryStart:  0, ryEnd:  15, spin: true  },

  // Jobs zone
  { type: "arch",  size: 300, top:  "54vh",  left:  "-5vw",  color: "var(--lime)", opacity: 0.08, yFactor: -0.14, xFactor:  0.04, rzStart:  15,  rzEnd: 120,  rxStart: 30, rxEnd: -20, ryStart: -20,ryEnd:  70, spin: false },
  { type: "dome",  size: 180, top:  "62vh",  right:  "2vw",  color: "#ffffff",     opacity: 0.10, yFactor: -0.22, xFactor: -0.06, rzStart: -20,  rzEnd: -150, rxStart: 10, rxEnd:  80, ryStart: 40, ryEnd: -30, spin: false },
  { type: "full",  size: 240, top:  "58vh",  right: "-8vw",  color: "var(--lime)", opacity: 0.09, yFactor: -0.16, xFactor: -0.04, rzStart:   0,  rzEnd: -200, rxStart: -20,rxEnd:  50, ryStart: 10, ryEnd: -90, spin: true  },

  // Team zone
  { type: "dome",  size: 450, top:  "80vh",  left:  "-10vw", color: "var(--lime)", opacity: 0.06, yFactor: -0.08, xFactor:  0.05, rzStart:  30,  rzEnd: -60,  rxStart: 40, rxEnd: -10, ryStart: -30,ryEnd:  60, spin: false },
  { type: "arch",  size: 200, top:  "88vh",  right: "-5vw",  color: "var(--lime)", opacity: 0.13, yFactor: -0.20, xFactor: -0.07, rzStart: -40,  rzEnd: 100,  rxStart: -30,rxEnd:  70, ryStart: 20, ryEnd: -80, spin: false },
  { type: "full",  size: 100, top:  "76vh",  right:  "8vw",  color: "#ffffff",     opacity: 0.15, yFactor: -0.28, xFactor:  0.03, rzStart:   0,  rzEnd: 360,  rxStart:  0, rxEnd: 180, ryStart:  0, ryEnd:  90, spin: true  },

  // CTA / footer zone
  { type: "dome",  size: 320, top: "108vh",  left:  "-4vw",  color: "var(--lime)", opacity: 0.07, yFactor: -0.10, xFactor:  0.04, rzStart:  10,  rzEnd: -80,  rxStart: 15, rxEnd: -45, ryStart: -10,ryEnd:  50, spin: false },
  { type: "arch",  size: 140, top: "115vh",  right:  "4vw",  color: "#ffffff",     opacity: 0.09, yFactor: -0.18, xFactor: -0.05, rzStart: -60,  rzEnd:  80,  rxStart: -40,rxEnd:  20, ryStart: 60, ryEnd: -40, spin: true  },
  { type: "full",  size: 550, top: "105vh",  right: "-12vw", color: "var(--lime)", opacity: 0.04, yFactor: -0.07, xFactor: -0.02, rzStart:   0,  rzEnd:  60,  rxStart:  0, rxEnd:  30, ryStart:  0, ryEnd:  20, spin: false },
];

function FloatingShape({ shape, scrollYProgress }: { shape: typeof shapes[0]; scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const rawY  = useTransform(scrollYProgress, [0, 1], [0, typeof window !== "undefined" ? window.innerHeight * shape.yFactor * 10 : -200]);
  const rawX  = useTransform(scrollYProgress, [0, 1], [0, typeof window !== "undefined" ? window.innerWidth  * shape.xFactor *  6 : 0]);
  const rawRZ = useTransform(scrollYProgress, [0, 1], [shape.rzStart, shape.rzEnd]);
  const rawRX = useTransform(scrollYProgress, [0, 1], [shape.rxStart, shape.rxEnd]);
  const rawRY = useTransform(scrollYProgress, [0, 1], [shape.ryStart, shape.ryEnd]);

  const y  = useSpring(rawY,  { stiffness: 40, damping: 18 });
  const x  = useSpring(rawX,  { stiffness: 40, damping: 18 });
  const rz = useSpring(rawRZ, { stiffness: 30, damping: 15 });
  const rx = useSpring(rawRX, { stiffness: 30, damping: 15 });
  const ry = useSpring(rawRY, { stiffness: 30, damping: 15 });

  const pos: Record<string, string> = {};
  if (shape.top)    pos.top    = shape.top;
  if ("left" in shape && shape.left)   pos.left   = shape.left as string;
  if ("right" in shape && shape.right) pos.right  = shape.right as string;

  return (
    <motion.div
      style={{
        position: "absolute",
        ...pos,
        width:  shape.size,
        height: shape.size,
        color:  shape.color,
        opacity: shape.opacity,
        pointerEvents: "none",
        y, x,
        rotateZ: rz,
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      animate={shape.spin ? { rotateZ: [shape.rzStart, shape.rzStart + 360] } : undefined}
      transition={shape.spin ? { duration: 14 + Math.random() * 8, repeat: Infinity, ease: "linear" } : undefined}
    >
      {shape.type === "dome" && <DomeShape />}
      {shape.type === "arch" && <ArchShape />}
      {shape.type === "full" && <FullMark />}
    </motion.div>
  );
}

export default function PageShapes() {
  const { scrollYProgress } = useScroll();

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        perspective: "1000px",
      }}
    >
      {shapes.map((shape, i) => (
        <FloatingShape key={i} shape={shape} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}
