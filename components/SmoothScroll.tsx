"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Zachte, geïnterpoleerde scroll voor de homepage. Alle scroll-animaties
 * (framer-motion useScroll) lezen gewoon window.scrollY, dus die volgen vanzelf.
 *
 * - Touch blijft native: Lenis smooth't standaard alleen het muiswiel.
 * - Bij "reduce motion" doet Lenis niets (respectReducedMotion).
 * - Ankers (/#contact) scrollen mee, met ruimte voor de vaste header.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      anchors: { offset: -88 },
      autoRaf: true,
    });
    return () => lenis.destroy();
  }, []);

  return null;
}
