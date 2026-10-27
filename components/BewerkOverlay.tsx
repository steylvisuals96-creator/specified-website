"use client";

import { useEffect } from "react";
import { CMS_URL } from "@/lib/settings";

const CMS_ORIGIN = (() => {
  try {
    return new URL(CMS_URL).origin;
  } catch {
    return "";
  }
})();

/**
 * Bewerkstand voor de voorbeeldpagina in het dashboard (?bewerken). Elke tekst
 * met een data-bewerk-attribuut licht op bij hover; een klik stuurt de veld-
 * namen naar het dashboard, dat er een pop-up voor opent. De website zelf
 * bewaart niets en kent geen login: het dashboard is de enige ontvanger.
 * Zonder ?bewerken, of buiten een frame, doet dit niets.
 */
export default function BewerkOverlay() {
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("bewerken") || window.parent === window) return;

    const stijl = document.createElement("style");
    stijl.textContent =
      "[data-bewerk]{cursor:pointer;outline:2px solid transparent;outline-offset:4px;transition:outline-color .12s}" +
      "[data-bewerk]:hover,[data-bewerk].bewerk-hit{outline-color:#dffd7b}";
    document.head.append(stijl);

    // Boven de scrollhero liggen lagen die klikken opvangen; daarom zoeken we de
    // zichtbare bewerkbare tekst onder de muis zelf, niet via het klikdoel.
    const zichtbaar = (el: Element) => {
      for (let n: Element | null = el; n; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.visibility === "hidden" || s.display === "none" || parseFloat(s.opacity) < 0.15) return false;
      }
      return true;
    };
    const vind = (x: number, y: number) => {
      const treffers = [...document.querySelectorAll("[data-bewerk]")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom && zichtbaar(el);
      });
      return treffers.sort((a, b) => a.getBoundingClientRect().width * a.getBoundingClientRect().height - b.getBoundingClientRect().width * b.getBoundingClientRect().height)[0] ?? null;
    };
    let actief: Element | null = null;
    const onMove = (e: MouseEvent) => {
      const el = vind(e.clientX, e.clientY);
      if (el === actief) return;
      actief?.classList.remove("bewerk-hit");
      actief = el;
      el?.classList.add("bewerk-hit");
      document.documentElement.style.cursor = el ? "pointer" : "";
    };
    document.addEventListener("mousemove", onMove, true);

    const onClick = (e: MouseEvent) => {
      const el = e.target instanceof Element ? e.target : null;
      const doel = vind(e.clientX, e.clientY) ?? el?.closest("[data-bewerk]");
      if (doel) {
        e.preventDefault();
        e.stopPropagation();
        const velden = (doel.getAttribute("data-bewerk") ?? "").split(",").filter(Boolean);
        window.parent.postMessage({ type: "specified-bewerken", actie: "kies", velden }, CMS_ORIGIN);
        return;
      }
      // Anders zou een klik de voorbeeldpagina verlaten en het dashboard de draad kwijtraken.
      const link = el?.closest("a");
      if (link && !(link.getAttribute("href") ?? "").startsWith("#")) e.preventDefault();
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("mousemove", onMove, true);
      document.documentElement.style.cursor = "";
      stijl.remove();
    };
  }, []);

  return null;
}
