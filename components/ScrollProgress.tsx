"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Dunne limoenlijn bovenaan die toont hoe ver je door de pagina bent. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: "var(--lime)",
        transformOrigin: "0% 50%",
        scaleX,
        zIndex: 101,
      }}
    />
  );
}
