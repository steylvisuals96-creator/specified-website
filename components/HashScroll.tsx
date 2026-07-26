"use client";

import { useEffect } from "react";

/**
 * Herstelt het springen naar #diensten, #jobs, #over-ons en #contact.
 *
 * Waarom dit nodig is: die secties zitten in client-componenten die pas na
 * hydratie in de DOM staan. Bij een koude paginalading (bv. /#contact vanaf
 * /vacatures) probeert de browser te scrollen op het moment dat het doel nog
 * niet bestaat, geeft het op, en blijft de bezoeker bovenaan staan met de
 * juiste URL in de balk. Vier van de zes menu-items deden daardoor niets.
 *
 * We wachten dus tot het doel echt bestaat en scrollen dan zelf.
 */
export default function HashScroll() {
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;

    let id: string;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;
    let raf = 0;
    const deadline = Date.now() + 3000;

    // Zodra de bezoeker zelf scrollt, laten we hem met rust: dan is onze
    // correctie ongewenst geworden.
    const stopOnUserInput = () => {
      cancelled = true;
    };
    const inputEvents = ["wheel", "touchstart", "keydown"] as const;
    inputEvents.forEach((e) =>
      window.addEventListener(e, stopOnUserInput, { passive: true, once: true })
    );

    /**
     * Eén sprong is niet genoeg. Afbeeldingen bóven de doelsectie laden na de
     * eerste scroll in, duwen het doel omlaag en je landt er honderden pixels
     * naast. We blijven daarom bijsturen tot de positie stabiel is of de
     * deadline verstrijkt.
     */
    const settle = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (!el) {
        if (Date.now() < deadline) raf = requestAnimationFrame(settle);
        return;
      }
      const offset = el.getBoundingClientRect().top - 88; // header + scroll-margin
      if (Math.abs(offset) > 2) {
        window.scrollBy({ top: offset, behavior: "auto" });
        if (Date.now() < deadline) raf = requestAnimationFrame(settle);
        return;
      }
      // Op de plek: nog even blijven kijken of er nog iets verschuift.
      if (Date.now() < deadline) raf = requestAnimationFrame(settle);
    };

    observer = new MutationObserver(() => {
      if (document.getElementById(id)) observer?.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    raf = requestAnimationFrame(settle);

    return () => {
      cancelled = true;
      observer?.disconnect();
      cancelAnimationFrame(raf);
      inputEvents.forEach((e) => window.removeEventListener(e, stopOnUserInput));
    };
  }, []);

  return null;
}
