"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Vloeiend scrollen met Lenis, zodat de scroll-gestuurde tekening in de hero
 * zacht meeloopt. Alleen met muis of trackpad (pointer: fine): touchscreens
 * houden hun eigen, vertrouwde scroll. Nooit bij "beweging beperken".
 *
 * Lenis en ScrollTrigger delen één klok (gsap.ticker), zodat ze niet uit de
 * pas lopen.
 */
export default function VloeiendScrollen() {
  useEffect(() => {
    const mag = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mag.matches) return;

    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tik = (tijd: number) => lenis.raf(tijd * 1000);
    gsap.ticker.add(tik);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tik);
      lenis.destroy();
    };
  }, []);

  return null;
}
