"use client";

import { useEffect, useRef } from "react";

/**
 * Muiswijzer als vizierkruis van een tekenprogramma: dunne limoen lijnen met
 * een open midden. Boven iets klikbaars trekken de lijnen in en verschijnt een
 * kader van vier hoekjes; boven het tekenblad van de hero staan er
 * coördinaten naast. Alleen met muis of trackpad; in tekstvelden blijft de
 * gewone tekstcursor.
 */
const KLIKBAAR = "a, button, [role='button'], select, summary, label, input[type='checkbox'], input[type='radio']";
const TYPEN = "input:not([type='checkbox']):not([type='radio']):not([type='button']):not([type='submit']), textarea, [contenteditable='true']";

export default function Vizier() {
  const ref = useRef<HTMLDivElement>(null);
  const coordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const coord = coordRef.current;
    if (!el || !coord) return;
    if (!matchMedia("(pointer: fine)").matches) return;

    document.documentElement.classList.add("vizier-aan");
    let x = -100, y = -100, raf = 0;

    const teken = () => {
      raf = 0;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const beweeg = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      const doel = e.target instanceof Element ? e.target : null;
      el.dataset.stand = doel?.closest(TYPEN) ? "typen" : doel?.closest(KLIKBAAR) ? "klik" : "vrij";
      el.dataset.zichtbaar = "true";

      // Coördinaten alleen boven het tekenblad, gemeten vanaf de hoek van het blad.
      const blad = doel?.closest(".tekening__blad");
      if (blad && el.dataset.stand === "vrij") {
        const r = blad.getBoundingClientRect();
        coord.textContent = `x ${Math.round(e.clientX - r.left)}   y ${Math.round(e.clientY - r.top)}`;
        el.dataset.coord = "true";
      } else {
        el.dataset.coord = "false";
      }
      if (!raf) raf = requestAnimationFrame(teken);
    };
    const weg = () => (el.dataset.zichtbaar = "false");
    const neer = () => (el.dataset.druk = "true");
    const op = () => (el.dataset.druk = "false");

    addEventListener("pointermove", beweeg, { passive: true });
    document.addEventListener("pointerleave", weg);
    addEventListener("blur", weg);
    addEventListener("pointerdown", neer);
    addEventListener("pointerup", op);
    return () => {
      document.documentElement.classList.remove("vizier-aan");
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", beweeg);
      document.removeEventListener("pointerleave", weg);
      removeEventListener("blur", weg);
      removeEventListener("pointerdown", neer);
      removeEventListener("pointerup", op);
    };
  }, []);

  return (
    <div ref={ref} className="vizier" aria-hidden="true" data-stand="vrij" data-zichtbaar="false">
      <span className="vizier__lijn vizier__lijn--h" />
      <span className="vizier__lijn vizier__lijn--v" />
      <span className="vizier__hoek vizier__hoek--lb" />
      <span className="vizier__hoek vizier__hoek--rb" />
      <span className="vizier__hoek vizier__hoek--lo" />
      <span className="vizier__hoek vizier__hoek--ro" />
      <span ref={coordRef} className="vizier__coord" />
    </div>
  );
}
