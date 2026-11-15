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

    // Het live voorbeeld in het beheer vraagt soms om naar een plek te scrollen
    // (components/VoorbeeldFocus.tsx). Via Lenis, anders vecht die ertegen.
    const scrollNaar = (e: Event) => {
      const y = (e as CustomEvent<{ y: number }>).detail?.y;
      if (typeof y !== "number") return;
      e.preventDefault();
      lenis.scrollTo(y, { duration: 1.1 });
    };
    addEventListener("specified:scroll-naar", scrollNaar);

    return () => {
      removeEventListener("specified:scroll-naar", scrollNaar);
      gsap.ticker.remove(tik);
      lenis.destroy();
    };
  }, []);

  return null;
}
