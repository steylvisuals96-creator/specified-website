"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/**
 * Afsluiter van de homepage: het Specified-logo over de volle breedte, dat
 * omhoog schuift uit de onderrand terwijl je de laatste meters scrolt.
 * Het logo wordt als masker gebruikt, zodat het in limoen staat zonder een
 * aparte kleurversie van het SVG-bestand nodig te hebben.
 */
export default function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const y = useTransform(scrollYProgress, [0, 1], ["70%", "0%"]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      style={{
        overflow: "hidden",
        padding: "0 clamp(1.5rem, 5vw, 4rem)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <motion.div
        className="scroll-fx"
        style={{
          y,
          maxWidth: "1280px",
          margin: "0 auto",
          aspectRatio: "144.7 / 24.4",
          backgroundColor: "var(--lime)",
          WebkitMaskImage: "url(/images/team/logo_specified.svg)",
          maskImage: "url(/images/team/logo_specified.svg)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center bottom",
          maskPosition: "center bottom",
          marginTop: "clamp(3rem, 6vw, 5rem)",
        }}
      />
    </div>
  );
}
