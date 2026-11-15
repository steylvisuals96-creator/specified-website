"use client";

// Een zachte limoenvlek op het glaspaneel onder de muis en een oplichtende rand waar de muis het dichtst bij is.
// Eén luisteraar voor de hele pagina; op aanraakschermen doet dit niets. (Overgenomen uit de SteylVisuals-studio.)
import { useEffect } from "react";

export default function Glans() {
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let vorig: HTMLElement | null = null;
    const beweeg = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>(".glas, .paneel");
      if (vorig && vorig !== el) vorig.removeAttribute("data-glans");
      vorig = el ?? null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
      el.setAttribute("data-glans", "");
    };
    const weg = () => {
      vorig?.removeAttribute("data-glans");
      vorig = null;
    };
    addEventListener("pointermove", beweeg, { passive: true });
    document.documentElement.addEventListener("pointerleave", weg);
    return () => {
      removeEventListener("pointermove", beweeg);
      document.documentElement.removeEventListener("pointerleave", weg);
    };
  }, []);
  return null;
}
