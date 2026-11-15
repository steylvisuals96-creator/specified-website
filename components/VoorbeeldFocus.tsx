"use client";

import { useEffect, useRef, useState } from "react";
import { heroScrollY, type HeroMoment } from "./HeroTekening";

/**
 * Alleen in het live voorbeeld naast het beheer. Klikt de redactie in een
 * veld, dan scrollt de pagina naar het stuk dat dat veld toont en komt er een
 * kader met hoekmarkeringen omheen, zoals op een technische tekening.
 *
 * Het veld komt als sleutel binnen (bv. "hero.woord", "callouts.3.tekst"). De
 * elementen op de pagina dragen dezelfde sleutels in data-bewerk. Voor de
 * hero, waar alles aan de scroll hangt, rekenen we de plek uit op de
 * tijdlijn van de tekening: anders staat een callout nog niet in beeld.
 */
type Focus = { veld: string | null; label?: string; teller: number };
type Kader = { x: number; y: number; w: number; h: number };

// Valt een veld buiten alle data-bewerk-elementen, dan dit stuk van de pagina.
const SECTIE: Record<string, string> = {
  hero: ".tekening",
  tekening: ".tekening",
  callouts: ".tekening",
  consultants: ".disc",
  diensten_bedrijven: "#diensten",
  diensten_engineers: "#diensten",
  jobs: "#jobs",
  contact: "#contact",
};

function heroMoment(veld: string): HeroMoment | null {
  if (veld.startsWith("callouts.")) return "callouts";
  if (veld === "tekening.intro" || veld === "tekening.scrollHint") return "begin";
  if (veld.startsWith("tekening.")) return "titelblok";
  if (veld.startsWith("hero.")) return "slot";
  return null;
}

function doelen(veld: string): Element[] {
  const alle = Array.from(document.querySelectorAll("[data-bewerk]"));
  const past = (sleutel: string) => alle.filter((el) => (el.getAttribute("data-bewerk") ?? "").split(",").includes(sleutel));
  const exact = past(veld);
  if (exact.length) return exact;
  // "consultants.profielen.2" valt onder "consultants.profielen".
  const ouder = veld.split(".").slice(0, -1).join(".");
  const viaOuder = ouder ? past(ouder) : [];
  if (viaOuder.length) return viaOuder;
  const sectie = document.querySelector(SECTIE[veld.split(".")[0]] ?? "");
  return sectie ? [sectie] : [];
}

function omvattend(els: Element[]): DOMRect | null {
  const rs = els.map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
  if (!rs.length) return null;
  const x = Math.min(...rs.map((r) => r.left));
  const y = Math.min(...rs.map((r) => r.top));
  return new DOMRect(x, y, Math.max(...rs.map((r) => r.right)) - x, Math.max(...rs.map((r) => r.bottom)) - y);
}

function scrollNaar(y: number) {
  const doel = Math.max(0, Math.round(y));
  const vraag = new CustomEvent("specified:scroll-naar", { detail: { y: doel }, cancelable: true });
  // Lenis (components/VloeiendScrollen.tsx) neemt het over als het aanstaat.
  if (dispatchEvent(vraag)) {
    const zacht = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: doel, behavior: zacht ? "smooth" : "auto" });
  }
}

export default function VoorbeeldFocus({ focus }: { focus: Focus }) {
  const [kader, setKader] = useState<Kader | null>(null);
  const veldRef = useRef<string | null>(null);

  // Naar het veld scrollen, één keer per nieuw veld (niet bij elke toetsaanslag).
  useEffect(() => {
    veldRef.current = focus.veld;
    if (!focus.veld) return;
    const veld = focus.veld;
    const t = setTimeout(() => {
      const moment = heroMoment(veld);
      const heroY = moment ? heroScrollY(moment) : null;
      if (heroY !== null) return scrollNaar(heroY);
      const r = omvattend(doelen(veld));
      if (!r) return;
      const hoog = r.height > innerHeight * 0.7;
      scrollNaar(scrollY + r.top - (hoog ? 96 : (innerHeight - r.height) / 2));
    }, 60);
    return () => clearTimeout(t);
  }, [focus.teller, focus.veld]);

  // Het kader volgt het element terwijl de pagina scrollt en de tekening beweegt.
  useEffect(() => {
    if (!focus.veld) return;
    let raf = 0;
    let vorige = "";
    const volg = () => {
      const veld = veldRef.current;
      const r = veld ? omvattend(doelen(veld)) : null;
      const k = r ? { x: r.left - 10, y: r.top - 8, w: r.width + 20, h: r.height + 16 } : null;
      const sleutel = k ? `${Math.round(k.x)},${Math.round(k.y)},${Math.round(k.w)},${Math.round(k.h)}` : "";
      if (sleutel !== vorige) {
        vorige = sleutel;
        setKader(k);
      }
      raf = requestAnimationFrame(volg);
    };
    raf = requestAnimationFrame(volg);
    return () => cancelAnimationFrame(raf);
  }, [focus.veld]);

  if (!kader || !focus.veld) return null;
  const binnen = { left: Math.max(4, kader.x), top: Math.max(4, kader.y), width: kader.w, height: kader.h };

  return (
    <div aria-hidden="true" className="voorbeeld-kader" style={binnen}>
      <style>{`
        .voorbeeld-kader { position: fixed; z-index: 2147483000; pointer-events: none; transition: left .18s, top .18s, width .18s, height .18s; }
        .voorbeeld-kader i { position: absolute; width: 14px; height: 14px; border-color: #dffd7b; border-style: solid; border-width: 0; }
        .voorbeeld-kader i:nth-child(1) { left: 0; top: 0; border-left-width: 2px; border-top-width: 2px; }
        .voorbeeld-kader i:nth-child(2) { right: 0; top: 0; border-right-width: 2px; border-top-width: 2px; }
        .voorbeeld-kader i:nth-child(3) { left: 0; bottom: 0; border-left-width: 2px; border-bottom-width: 2px; }
        .voorbeeld-kader i:nth-child(4) { right: 0; bottom: 0; border-right-width: 2px; border-bottom-width: 2px; }
        .voorbeeld-kader::before { content: ""; position: absolute; inset: 0; border: 1px dashed rgba(223,253,123,.45); background: rgba(223,253,123,.04); }
        .voorbeeld-kader b { position: absolute; left: -1px; bottom: calc(100% + 6px); background: #dffd7b; color: #1e1e21; font: 600 12px/1 var(--font-sans, system-ui), sans-serif; padding: 5px 8px; white-space: nowrap; border-radius: 2px; }
        @media (prefers-reduced-motion: reduce) { .voorbeeld-kader { transition: none; } }
      `}</style>
      <i />
      <i />
      <i />
      <i />
      {focus.label && <b>{focus.label}</b>}
    </div>
  );
}
