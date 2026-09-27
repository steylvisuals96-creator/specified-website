"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { HERO, TEKENING, TEKENING_CALLOUTS } from "@/lib/inhoud";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * De hero als technische tekening. Tijdens het scrollen wordt het woord
 * SPECIFIED een tekening: de letters worden contouren en schuiven uit elkaar,
 * elke letter krijgt een callout (een acrostichon met wat Specified doet), een
 * titelblok wordt afgetekend met de handtekening, en daarna klikt het woord in
 * limoen weer samen onder de kop.
 *
 * Zonder JS of met "beweging beperken" blijft het een rustige hero: het woord,
 * de kop en de knoppen, zonder scrollruimte.
 */

const NS = "http://www.w3.org/2000/svg";
const HANDTEKENING =
  "M8 132 C 40 96, 70 40, 92 36 C 112 32, 104 96, 86 118 C 70 138, 60 104, 96 86 C 128 70, 140 64, 150 76 C 160 90, 142 112, 150 116 C 160 120, 178 84, 194 70 C 204 62, 206 84, 198 102 C 192 118, 206 118, 220 100 C 236 80, 246 62, 262 60 C 276 58, 268 88, 280 92 C 294 96, 306 70, 322 62 C 336 56, 330 84, 344 86 C 380 88, 460 52, 552 30";

type Attrs = Record<string, string | number>;
function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs, parent?: Element): SVGElementTagNameMap[K] {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  parent?.appendChild(n);
  return n;
}

/** Callout-label: de eerste letter in limoen, zodat je SPECIFIED terugleest. */
function acro(node: SVGTextElement, tekst: string) {
  const a = document.createElementNS(NS, "tspan");
  a.setAttribute("class", "tek__acro");
  a.textContent = tekst[0];
  const b = document.createElementNS(NS, "tspan");
  b.textContent = tekst.slice(1);
  node.append(a, b);
}

type Letter = {
  g: SVGGElement;
  /** Eindpositie t.o.v. de beginstand (staand: het woord draait naar horizontaal). */
  ex?: number;
  ey?: number;
  vul: SVGTextElement;
  lijn: SVGTextElement;
  co?: SVGGElement;
  leider?: SVGPolylineElement;
  dx: number;
  dy: number;
};

type Delen = {
  letters: Letter[];
  maat: SVGGElement;
  titelblok: SVGGElement;
  hand: SVGPathElement;
  as: SVGLineElement;
  eindY: number;
  eindVul: number;
  /** Staand: de lettergroep die op het einde groter wordt om de breedte te vullen. */
  woordG?: SVGGElement;
  eindSchaal?: number;
  eindMidden?: [number, number];
};

function lettertype() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-bebas").trim();
  return v || "'Bebas Neue', sans-serif";
}

/** Liggend (desktop, tablet): het woord horizontaal, callouts erboven en eronder. */
function bouwLiggend(svg: SVGSVGElement): Delen {
  svg.setAttribute("viewBox", "0 0 1600 900");
  const font = lettertype();
  const kader = el("g", {}, svg);
  el("rect", { class: "tek__rand", x: 40, y: 40, width: 1520, height: 820 }, kader);
  el("rect", { class: "tek__rand", x: 56, y: 56, width: 1488, height: 788 }, kader);
  "ABCD".split("").forEach((c, i) => {
    const y = 56 + (788 * (i + 0.5)) / 4 + 4;
    el("text", { class: "tek__ref", x: 48, y }, kader).textContent = c;
    el("text", { class: "tek__ref", x: 1552, y }, kader).textContent = c;
  });
  [1, 2, 3, 4, 5, 6].forEach((n, i) => {
    const x = 56 + (1488 * (i + 0.5)) / 6;
    el("text", { class: "tek__ref", x, y: 52 }, kader).textContent = String(n);
    el("text", { class: "tek__ref", x, y: 856 }, kader).textContent = String(n);
  });
  const as = el("line", { class: "tek__as", x1: 80, y1: 450, x2: 1520, y2: 450 }, svg);
  const lettersG = el("g", {}, svg);
  const coG = el("g", {}, svg);

  const woord = "SPECIFIED".split("");
  const grootte = 300;
  const basis = 450 + grootte * 0.35;
  const meet = el("text", { "font-family": font, "font-size": grootte, y: -999 }, svg);
  const breedtes = woord.map((c) => {
    meet.textContent = c;
    return meet.getComputedTextLength();
  });
  meet.remove();
  const spatie = 10;
  const totaal = breedtes.reduce((a, b) => a + b, 0) + spatie * (woord.length - 1);
  let x = 800 - totaal / 2;
  const uit = 1.36;

  const letters: (Letter & { x: number; w: number; top: number; bot: number; cx: number })[] = woord.map((c, i) => {
    const g = el("g", {}, lettersG);
    const vul = el("text", { class: "tek__vul", "font-family": font, "font-size": grootte, x, y: basis }, g);
    vul.textContent = c;
    const lijn = el("text", { class: "tek__lijn", "font-family": font, "font-size": grootte, x, y: basis }, g);
    lijn.textContent = c;
    const w = breedtes[i];
    const midden = x + w / 2;
    const dx = (midden - 800) * (uit - 1);
    const dy = (i % 2 ? 1 : -1) * 34;
    const r = { g, vul, lijn, dx, dy, x, w, cx: midden + dx, top: basis - grootte * 0.72 + dy, bot: basis + dy };
    x += w + spatie;
    return r;
  });

  letters.forEach((l, i) => {
    const boven = i % 2 === 0;
    const ax = l.cx;
    const ay = boven ? l.top - 14 : l.bot + 14;
    const ky = i === 0 || i === 8 ? 124 : boven ? 170 + (i % 4 === 0 ? 0 : 44) : 730 - (i % 4 === 1 ? 0 : 44);
    const links = (i < 4 && i !== 0) || i === 8; // buitenste letters wijzen naar binnen
    const kx = ax + (links ? -24 : 24);
    const eind = kx + (links ? -70 : 70);
    const g = el("g", { opacity: 0 }, coG);
    el("circle", { class: "tek__punt", cx: ax, cy: ay, r: 3.5 }, g);
    const leider = el("polyline", { class: "tek__leider", points: `${ax},${ay} ${kx},${ky} ${eind},${ky}` }, g);
    const tx = eind + (links ? -12 : 12);
    const anchor = links ? "end" : "start";
    acro(el("text", { class: "tek__rol", x: tx, y: ky - 4, "text-anchor": anchor }, g), TEKENING_CALLOUTS[i][0]);
    el("text", { class: "tek__sub", x: tx, y: ky + 20, "text-anchor": anchor }, g).textContent = TEKENING_CALLOUTS[i][1];
    l.co = g;
    l.leider = leider;
  });

  const x1 = letters[0].x + letters[0].dx;
  const x2 = letters[8].x + letters[8].w + letters[8].dx;
  const maat = el("g", { opacity: 0 }, svg);
  el("line", { class: "tek__maat", x1, y1: 612, x2, y2: 612 }, maat);
  [x1, x2].forEach((xx) => el("line", { class: "tek__maat", x1: xx, y1: 602, x2: xx, y2: 622 }, maat));
  el("text", { class: "tek__maattekst", x: (x1 + x2) / 2, y: 638 }, maat).textContent = TEKENING.maatlijn;

  const tb = el("g", { opacity: 0 }, svg);
  const bx = 1084, by = 660, bw = 460, bh = 176;
  el("rect", { class: "tek__blok", x: bx, y: by, width: bw, height: bh }, tb);
  el("line", { class: "tek__blok", x1: bx, y1: by + 54, x2: bx + bw, y2: by + 54 }, tb);
  el("line", { class: "tek__blok", x1: bx + 262, y1: by + 54, x2: bx + 262, y2: by + bh }, tb);
  const veld = (lx: number, ly: number, label: string, waarde: string) => {
    el("text", { class: "tek__label", x: lx, y: ly }, tb).textContent = label;
    el("text", { class: "tek__waarde", x: lx, y: ly + 22 }, tb).textContent = waarde;
  };
  veld(bx + 14, by + 20, "Project", TEKENING.titelblok.project);
  veld(bx + 14, by + 76, "Locatie", TEKENING.titelblok.locatie);
  veld(bx + 14, by + 126, "Waarden", TEKENING.titelblok.waarden);
  el("text", { class: "tek__label", x: bx + 276, y: by + 76 }, tb).textContent = TEKENING.titelblok.akkoord;
  const hand = el("path", { class: "tek__hand", d: HANDTEKENING, pathLength: 1, transform: `translate(${bx + 276} ${by + 88}) scale(.31)` }, tb);

  return { letters, maat, titelblok: tb, hand, as, eindY: -150, eindVul: 1 };
}

/** Staand (telefoon): het woord rechtop, letter onder letter, callouts rechts. */
function bouwStaand(svg: SVGSVGElement): Delen {
  svg.setAttribute("viewBox", "0 0 900 1600");
  const font = lettertype();
  const kader = el("g", {}, svg);
  el("rect", { class: "tek__rand", x: 24, y: 24, width: 852, height: 1552 }, kader);
  el("rect", { class: "tek__rand", x: 38, y: 38, width: 824, height: 1524 }, kader);
  const as = el("line", { class: "tek__as", x1: 240, y1: 110, x2: 240, y2: 1490 }, svg);
  const lettersG = el("g", {}, svg);
  const coG = el("g", {}, svg);

  const woord = "SPECIFIED".split("");
  const grootte = 150, stap = 126;
  const start = 800 - (stap * woord.length) / 2;
  const letters = woord.map((c, i) => {
    const basis = start + (i + 1) * stap - 14;
    const g = el("g", {}, lettersG);
    const vul = el("text", { class: "tek__vul", "font-family": font, "font-size": grootte, x: 240, y: basis, "text-anchor": "middle" }, g);
    vul.textContent = c;
    const lijn = el("text", { class: "tek__lijn tek__lijn--dik", "font-family": font, "font-size": grootte, x: 240, y: basis, "text-anchor": "middle" }, g);
    lijn.textContent = c;
    const w = vul.getComputedTextLength();
    const cy = basis - grootte * 0.36;
    const dy = (cy - 800) * 0.2, dx = (i % 2 ? 1 : -1) * 36;
    const ax = 240 + dx + w / 2 + 12, ay = cy + dy;
    const co = el("g", { opacity: 0 }, coG);
    el("circle", { class: "tek__punt", cx: ax, cy: ay, r: 5 }, co);
    const leider = el("polyline", { class: "tek__leider tek__leider--dik", points: `${ax},${ay} 430,${ay} 452,${ay}` }, co);
    acro(el("text", { class: "tek__rol tek__rol--groot", x: 466, y: ay - 2 }, co), TEKENING_CALLOUTS[i][0]);
    el("text", { class: "tek__sub tek__sub--groot", x: 466, y: ay + 32 }, co).textContent = TEKENING_CALLOUTS[i][1];
    return { g, vul, lijn, dx, dy, co, leider, cy, w, basis };
  });

  // Einde: het woord draait terug naar horizontaal, gecentreerd boven de kop,
  // en schaalt zodat het de breedte van het blad vult.
  const spatie = 8, eindBasis = 560;
  const breedte = letters.reduce((a, l) => a + l.w, 0) + spatie * (letters.length - 1);
  let ex = 450 - breedte / 2;
  letters.forEach((l) => {
    const midden = ex + l.w / 2;
    Object.assign(l, { ex: midden - 240, ey: eindBasis - l.basis });
    ex += l.w + spatie;
  });
  const eindSchaal = Math.min(1.45, 780 / breedte);

  const y1 = letters[0].cy + letters[0].dy - 60, y2 = letters[8].cy + letters[8].dy + 60, mx = 96;
  const maat = el("g", { opacity: 0 }, svg);
  el("line", { class: "tek__maat", x1: mx, y1, x2: mx, y2 }, maat);
  [y1, y2].forEach((yy) => el("line", { class: "tek__maat", x1: mx - 12, y1: yy, x2: mx + 12, y2: yy }, maat));
  const my = (y1 + y2) / 2;
  el("text", { class: "tek__maattekst tek__maattekst--groot", x: mx - 18, y: my, transform: `rotate(-90 ${mx - 18} ${my})` }, maat).textContent = TEKENING.maatlijn;

  // Titelblok op telefoon: groter getekend, want de viewBox schaalt hier ~0,43x
  // (tekst van 32/40 eenheden wordt ~14/17 px op het scherm).
  const tb = el("g", { opacity: 0 }, svg);
  const bx = 336, by = 1236, bw = 510, bh = 290, kol = 250;
  el("rect", { class: "tek__blok", x: bx, y: by, width: bw, height: bh }, tb);
  el("line", { class: "tek__blok", x1: bx, y1: by + 112, x2: bx + bw, y2: by + 112 }, tb);
  el("line", { class: "tek__blok", x1: bx + kol, y1: by + 112, x2: bx + kol, y2: by + bh }, tb);
  const lab = (x: number, y: number, t: string) => (el("text", { class: "tek__label tek__label--groot", x, y }, tb).textContent = t);
  const waa = (x: number, y: number, t: string) => (el("text", { class: "tek__waarde tek__waarde--groot", x, y }, tb).textContent = t);
  lab(bx + 22, by + 42, "Project");
  waa(bx + 22, by + 90, TEKENING.titelblok.project);
  const [stad, regio] = TEKENING.titelblok.locatie.split(", ");
  lab(bx + 22, by + 158, "Locatie");
  waa(bx + 22, by + 206, `${stad},`);
  waa(bx + 22, by + 252, regio ?? "");
  lab(bx + kol + 22, by + 158, "Goedgekeurd");
  const hand = el("path", { class: "tek__hand tek__hand--dik", d: HANDTEKENING, pathLength: 1, transform: `translate(${bx + kol + 12} ${by + 168}) scale(.44)` }, tb);

  return { letters, maat, titelblok: tb, hand, as, eindY: 0, eindVul: 1, woordG: lettersG, eindSchaal, eindMidden: [450, eindBasis - 54] };
}

/** Eén tijdlijn voor beide oriëntaties, gestuurd door de scroll. */
function tijdlijn(root: HTMLElement, d: Delen) {
  const { letters: L } = d;
  L.forEach((l) => {
    if (!l.leider) return;
    const len = l.leider.getTotalLength();
    gsap.set(l.leider, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.set(d.hand, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(d.as, { opacity: 0 });
  gsap.set(L.map((l) => l.lijn), { strokeOpacity: 0 });

  const co = L.map((l) => l.co!);
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.8 },
  });
  // 1. Merk wordt tekening: vulling weg, contour erin, letters uit elkaar.
  tl.to(".tekening__intro", { opacity: 0, y: -20, duration: 0.4 }, 0)
    .to(L.map((l) => l.vul), { fillOpacity: 0, duration: 1 }, 0.2)
    .to(L.map((l) => l.lijn), { strokeOpacity: 1, duration: 0.8 }, 0.2)
    .to(L.map((l) => l.g), { x: (i) => L[i].dx, y: (i) => L[i].dy, duration: 1.4, ease: "power1.inOut" }, 0.3)
    .to(d.as, { opacity: 0.6, duration: 0.6 }, 0.9)
    // 2. Callouts tekenen zich, letter voor letter.
    .to(co, { opacity: 1, duration: 0.3, stagger: 0.16 }, 1.8)
    .to(L.map((l) => l.leider!), { strokeDashoffset: 0, duration: 0.5, stagger: 0.16 }, 1.8)
    .to(d.maat, { opacity: 1, duration: 0.4 }, 3.2)
    // 3. Callouts wijken; het titelblok komt en Specified tekent af.
    .to([...co, d.maat], { opacity: 0, duration: 0.5 }, 3.9)
    .to(d.titelblok, { opacity: 1, duration: 0.4 }, 4.2)
    .to(d.hand, { strokeDashoffset: 0, duration: 1, autoRound: false }, 4.4)
    // 4. Het woord klikt samen in limoen, de kop verschijnt.
    .to(d.as, { opacity: 0, duration: 0.5 }, 5.3)
    .to(d.titelblok, { opacity: d.woordG ? 0 : 0.6, duration: 0.5 }, 5.3)
    .to(L.map((l) => l.g), { x: (i) => L[i].ex ?? 0, y: (i) => L[i].ey ?? d.eindY, duration: 1.2, ease: "power2.inOut" }, 5.4)
    .to(L.map((l) => l.vul), { fillOpacity: d.eindVul, fill: "#dffd7b", duration: 0.8 }, 6.0)
    .to(L.map((l) => l.lijn), { strokeOpacity: d.eindVul === 1 ? 0 : 0.5, duration: 0.6 }, 6.0)
    .to(".tekening__slot", { opacity: 1, duration: 0.6 }, 6.4);
  if (d.woordG && d.eindSchaal && d.eindMidden) {
    tl.to(d.woordG, { scale: d.eindSchaal, svgOrigin: `${d.eindMidden[0]} ${d.eindMidden[1]}`, duration: 0.8, ease: "power2.inOut" }, 5.9);
  }
  tl
    .to({}, { duration: 0.6 });
}

export default function HeroTekening() {
  const ref = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      const svg = svgRef.current;
      if (!root || !svg) return;
      const mm = gsap.matchMedia();
      let geannuleerd = false;

      mm.add(
        {
          liggend: "(prefers-reduced-motion: no-preference) and ((orientation: landscape) or (min-width: 760px))",
          staand: "(prefers-reduced-motion: no-preference) and (orientation: portrait) and (max-width: 759px)",
        },
        (ctx) => {
          const { staand } = ctx.conditions as { liggend: boolean; staand: boolean };
          // Pas bouwen als Bebas geladen is: de letterbreedtes worden gemeten.
          document.fonts.ready.then(() => {
            if (geannuleerd) return;
            ctx.add(() => {
              svg.replaceChildren();
              const delen = staand ? bouwStaand(svg) : bouwLiggend(svg);
              root.dataset.klaar = "true";
              tijdlijn(root, delen);
              ScrollTrigger.refresh();
            });
          });
          return () => {
            svg.replaceChildren();
            delete root.dataset.klaar;
          };
        },
      );

      return () => {
        geannuleerd = true;
        mm.revert();
      };
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="tekening" aria-labelledby="hero-titel">
      <div className="tekening__blad">
        <svg ref={svgRef} className="tekening__svg" aria-hidden="true" focusable="false" />
        {/* Staat er meteen (ook zonder JS); de tekening neemt het over zodra ze gebouwd is. */}
        <p className="tekening__woord display" aria-hidden="true">
          {"SPECIFIED".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </p>
        <p className="tekening__intro">
          <b>{TEKENING.intro}</b> <span>{TEKENING.scrollHint}</span>
        </p>
        <div className="tekening__slot">
          <div className="wrap">
            <h1 id="hero-titel" className="display tekening__titel">
              {HERO.prefix} <span className="tekening__accent">{HERO.woord}</span>
              <br />
              {HERO.suffix}
            </h1>
            <div className="hero__actions">
              <a href="#contact" className="btn btn-primary">
                {HERO.ctaBedrijven}
              </a>
              <a href="/vacatures" className="btn btn-secondary">
                {HERO.ctaEngineers}
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Scrollruimte voor de tekening: een echt element, zodat sticky werkt. */}
      <div className="tekening__ruimte" aria-hidden="true" />
    </section>
  );
}
