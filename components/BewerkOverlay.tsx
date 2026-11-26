"use client";

import { useEffect } from "react";
import { CMS_URL } from "@/lib/settings";
import { BEHEER_ORIGINS } from "@/lib/useVoorbeeld";

const CMS_ORIGIN = (() => {
  try {
    return new URL(CMS_URL).origin;
  } catch {
    return "";
  }
})();

/**
 * Bewerkstand van het live voorbeeld naast het beheer. Elke tekst met een
 * data-bewerk-attribuut krijgt bij hover een kader; een klik stuurt de
 * veldnamen naar het beheer, dat het bijhorende veld opent en focust. Typen
 * in dat veld toont de tekst meteen hier (useVoorbeeld + VoorbeeldFocus).
 *
 * Een element met data-beheer (bv. een teamlid) heeft een eigen editor: een klik
 * vraagt het beheer die te openen (bericht navigeer, zoals een link).
 *
 * Twee ontvangers:
 * - Het beheer (beheer/components/Voorbeeld.tsx): altijd aan als de pagina in
 *   een frame van het beheer staat. Bericht { type: "specified-voorbeeld", kies: [velden] }.
 * - De oude CMS (Payload), alleen met ?bewerken: { type: "specified-bewerken", actie: "kies", velden }.
 *
 * De website zelf bewaart niets en kent geen login. Buiten een frame doet dit niets.
 */
// data-bewerk: een tekst met een veld in deze editor. data-beheer: een item met een eigen
// editor in het beheer (bv. een teamlid, "/team/<id>"); een klik opent die editor.
const DOEL = "[data-bewerk],[data-beheer]";

export default function BewerkOverlay() {
  useEffect(() => {
    if (window.parent === window) return;
    const ouder = (() => {
      try {
        return new URL(document.referrer).origin;
      } catch {
        return "";
      }
    })();
    const naarBeheer = BEHEER_ORIGINS.includes(ouder);
    const naarCms = !naarBeheer && new URLSearchParams(window.location.search).has("bewerken");
    if (!naarBeheer && !naarCms) return;

    const stijl = document.createElement("style");
    stijl.textContent =
      ".bewerk-hover{position:fixed;z-index:2147482999;pointer-events:none;border:1px dashed rgba(223,253,123,.7);background:rgba(223,253,123,.06);border-radius:2px;transition:left .1s,top .1s,width .1s,height .1s,opacity .12s}" +
      ".bewerk-hover b{position:absolute;right:-1px;bottom:calc(100% + 4px);background:rgba(30,30,33,.92);color:#dffd7b;border:1px solid rgba(223,253,123,.5);font:600 11px/1 var(--font-sans,system-ui),sans-serif;padding:4px 7px;border-radius:2px;white-space:nowrap}" +
      "@media (prefers-reduced-motion: reduce){.bewerk-hover{transition:none}}";
    document.head.append(stijl);
    const kader = document.createElement("div");
    kader.className = "bewerk-hover";
    kader.setAttribute("aria-hidden", "true");
    kader.style.opacity = "0";
    const chip = document.createElement("b");
    chip.textContent = "Klik om te bewerken";
    kader.append(chip);
    document.body.append(kader);

    // Boven de scrollhero liggen lagen die klikken opvangen, en SVG-tekst krijgt
    // geen outline. Daarom zoeken we de zichtbare bewerkbare tekst onder de muis
    // zelf (op coördinaten) en tekenen we het kader als los element.
    const zichtbaar = (el: Element) => {
      for (let n: Element | null = el; n; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.visibility === "hidden" || s.display === "none" || parseFloat(s.opacity) < 0.15) return false;
      }
      return true;
    };
    const vind = (x: number, y: number) => {
      let beste: Element | null = null;
      let oppervlak = Infinity;
      for (const el of document.querySelectorAll(DOEL)) {
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || x < r.left || x > r.right || y < r.top || y > r.bottom) continue;
        const o = r.width * r.height;
        if (o < oppervlak && zichtbaar(el)) {
          beste = el;
          oppervlak = o;
        }
      }
      return beste;
    };

    let muis: { x: number; y: number } | null = null;
    let raf = 0;
    const teken = () => {
      raf = 0;
      const el = muis ? vind(muis.x, muis.y) : null;
      document.documentElement.style.cursor = el ? "pointer" : "";
      if (!el) {
        kader.style.opacity = "0";
        return;
      }
      const r = el.getBoundingClientRect();
      Object.assign(kader.style, { left: `${r.left - 6}px`, top: `${r.top - 4}px`, width: `${r.width + 12}px`, height: `${r.height + 8}px`, opacity: "1" });
    };
    const plan = () => {
      if (!raf) raf = requestAnimationFrame(teken);
    };
    const onMove = (e: MouseEvent) => {
      muis = { x: e.clientX, y: e.clientY };
      plan();
    };
    const onLeave = () => {
      muis = null;
      plan();
    };
    document.addEventListener("mousemove", onMove, true);
    document.documentElement.addEventListener("mouseleave", onLeave);
    // De pagina (en de tekening in de hero) beweegt onder de muis mee bij scrollen.
    addEventListener("scroll", plan, { passive: true });

    // Op window in de capture-fase: dat komt vóór de linkafhandeling van useVoorbeeld
    // (op document). Een knop of link met data-bewerk kiest dus het veld en
    // navigeert niet; andere links werken zoals voorheen.
    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      const doel = vind(e.clientX, e.clientY) ?? el?.closest(DOEL);
      if (doel) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const item = doel.getAttribute("data-beheer");
        if (item) {
          if (naarBeheer && item.startsWith("/")) window.parent.postMessage({ type: "specified-voorbeeld", navigeer: item }, ouder);
          return;
        }
        const velden = (doel.getAttribute("data-bewerk") ?? "").split(",").filter(Boolean);
        if (naarBeheer) window.parent.postMessage({ type: "specified-voorbeeld", kies: velden }, ouder);
        else window.parent.postMessage({ type: "specified-bewerken", actie: "kies", velden }, CMS_ORIGIN);
        return;
      }
      // Oude CMS: anders zou een klik de voorbeeldpagina verlaten en het dashboard de draad kwijtraken.
      const link = el?.closest("a");
      if (naarCms && link && !(link.getAttribute("href") ?? "").startsWith("#")) e.preventDefault();
    };
    addEventListener("click", onClick, true);
    return () => {
      removeEventListener("click", onClick, true);
      removeEventListener("scroll", plan);
      document.removeEventListener("mousemove", onMove, true);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      document.documentElement.style.cursor = "";
      kader.remove();
      stijl.remove();
    };
  }, []);

  return null;
}
