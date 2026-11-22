"use client";

import { useEffect } from "react";

/**
 * Vloeiend scrollen met Lenis, zodat de scroll-gestuurde tekening in de hero
 * zacht meeloopt. Alleen met muis of trackpad (pointer: fine): touchscreens
 * houden hun eigen, vertrouwde scroll. Nooit bij "beweging beperken".
 *
 * Lenis en ScrollTrigger delen één klok (gsap.ticker), zodat ze niet uit de
 * pas lopen.
 *
 * Lenis en GSAP worden pas geladen als het toestel er recht op heeft. Dit
 * onderdeel staat in de layout: met een vaste import kreeg elke pagina, ook op
 * een telefoon, GSAP en ScrollTrigger (45 KB) mee in het kritieke pad, en dat
 * vertraagde de LCP van de blog op mobiel. Op de homepage laden de hero en de
 * scrollmomenten GSAP zelf; de dynamische import geeft dan dezelfde module,
 * dus dezelfde klok.
 */
export default function VloeiendScrollen() {
  useEffect(() => {
    const mag = matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!mag.matches) return;

    let opruimen: (() => void) | undefined;
    let gestopt = false;

    void Promise.all([import("lenis"), import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: Lenis }, { default: gsap }, { ScrollTrigger }]) => {
        if (gestopt) return;
        gsap.registerPlugin(ScrollTrigger);

        const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
        lenis.on("scroll", ScrollTrigger.update);
        const tik = (tijd: number) => lenis.raf(tijd * 1000);
        gsap.ticker.add(tik);
        gsap.ticker.lagSmoothing(0);

        // Het live voorbeeld in het beheer (components/VoorbeeldFocus.tsx) en de
        // toetsenbordfocus in de hero vragen soms om naar een plek te scrollen.
        // Via Lenis, anders vecht die ertegen. "direct" springt zonder animatie.
        const scrollNaar = (e: Event) => {
          const { y, direct } = (e as CustomEvent<{ y: number; direct?: boolean }>).detail ?? {};
          if (typeof y !== "number") return;
          e.preventDefault();
          lenis.scrollTo(y, direct ? { immediate: true, force: true } : { duration: 1.1 });
        };
        addEventListener("specified:scroll-naar", scrollNaar);

        opruimen = () => {
          removeEventListener("specified:scroll-naar", scrollNaar);
          gsap.ticker.remove(tik);
          lenis.destroy();
        };
      },
    );

    return () => {
      gestopt = true;
      opruimen?.();
    };
  }, []);

  return null;
}
