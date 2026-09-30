"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TEKENING, TEKENING_CALLOUTS } from "@/lib/inhoud";
import T from "@/components/T";
import { useTeksten } from "@/components/admin/TeksProvider";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * De hero als technische tekening. Tijdens het scrollen wordt het woord
 * SPECIFIED een tekening: de letters worden contouren en schuiven uit elkaar,
 * elke letter krijgt een callout (een acrostichon met wat Specified doet), een
 * titelblok wordt afgetekend met de handtekening. Op het einde klikt het woord
 * in limoen samen en valt het beeldmerk erbij (kom van boven, boog van onder):
 * het eindbeeld is het echte logo, onder de kop.
 *
 * Het blad vult het scherm in elke verhouding: de tekening zelf is 1600x900
 * (liggend) of 900x1600 (staand) en de viewBox groeit mee in hoogte of breedte.
 *
 * Zonder JS of met "beweging beperken" blijft het een rustige hero: het woord,
 * de kop en de knoppen, zonder scrollruimte.
 */

const NS = "http://www.w3.org/2000/svg";

// De teksten in de getekende delen (callouts, titelblok) worden met JavaScript in de
// SVG gezet, niet door React. Deze functie geeft daarvoor de live tekst uit het CRM,
// en anders de standaard.
type Kies = (k: string, d: string) => string;
const HANDTEKENING =
  "M8 132 C 40 96, 70 40, 92 36 C 112 32, 104 96, 86 118 C 70 138, 60 104, 96 86 C 128 70, 140 64, 150 76 C 160 90, 142 112, 150 116 C 160 120, 178 84, 194 70 C 204 62, 206 84, 198 102 C 192 118, 206 118, 220 100 C 236 80, 246 62, 262 60 C 276 58, 268 88, 280 92 C 294 96, 306 70, 322 62 C 336 56, 330 84, 344 86 C 380 88, 460 52, 552 30";
// Het beeldmerk van Specified (zelfde paden als het logo), 26,3 breed en 24,4 hoog.
const MERK_KOM =
  "M.5,0c0,1.7.3,3.4,1,4.9.6,1.6,1.6,3,2.8,4.2,1.2,1.2,2.6,2.2,4.2,2.8s3.2,1,4.9,1,3.4-.3,4.9-1c1.6-.6,3-1.6,4.2-2.8s2.1-2.6,2.8-4.2C25.9,3.3,26.3,1.7,26.3,0Z";
const MERK_BOOG =
  "M1.2,16.4c1,2.4,2.6,4.4,4.8,5.8,2.1,1.4,4.7,2.2,7.2,2.2s5.1-.8,7.3-2.2c2.2-1.4,3.8-3.5,4.8-5.9l-4-1.6c-.7,1.6-1.8,2.9-3.2,3.9-1.4,1-3.1,1.5-4.8,1.5s-3.4-.5-4.8-1.4c-1.4-.9-2.5-2.3-3.2-3.9l-4,1.7Z";
const MERK_B = 26.3;
const MERK_H = 24.4;

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
  vul: SVGTextElement;
  lijn: SVGTextElement;
  co: SVGGElement;
  leider: SVGPolylineElement;
  /** Uit-elkaar-stand (tekening) en eindstand, beide t.o.v. de beginstand. */
  dx: number;
  dy: number;
  ex: number;
  ey: number;
};

type Delen = {
  letters: Letter[];
  titelblok: SVGGElement;
  hand: SVGPathElement;
  as: SVGLineElement;
  woordG: SVGGElement;
  /** Beeldmerk: twee helften die op het einde binnenkomen. */
  kom: SVGGElement;
  boog: SVGGElement;
  merkAfstand: number;
  eindSchaal: number;
  eindMidden: [number, number];
  titelblokEinde: number;
  kader: SVGGElement;
  /** Geschatte omtreklengte van een letter, om de contour te laten tekenen. */
  contour: number;
};

function lettertype() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--font-bebas").trim();
  return v || "'Bebas Neue', sans-serif";
}

/** Beeldmerk als twee groepen, linksboven op (x, y), zo hoog als `hoogte`. */
function merk(parent: SVGGElement, x: number, y: number, hoogte: number) {
  const s = hoogte / MERK_H;
  const kom = el("g", { opacity: 0 }, parent);
  el("path", { class: "tek__merk", d: MERK_KOM, transform: `translate(${x} ${y}) scale(${s})` }, kom);
  const boog = el("g", { opacity: 0 }, parent);
  el("path", { class: "tek__merk", d: MERK_BOOG, transform: `translate(${x} ${y}) scale(${s})` }, boog);
  return { kom, boog };
}

/** Liggend (desktop, tablet dwars): het woord horizontaal, callouts erboven en eronder. */
function bouwLiggend(svg: SVGSVGElement, vw: number, vh: number, kies: Kies): Delen {
  // De tekening is 1600x900; op een hoger scherm groeit het blad mee in hoogte.
  const H = Math.max(900, Math.round((1600 * vh) / vw));
  const off = (H - 900) / 2;
  svg.setAttribute("viewBox", `0 ${-off} 1600 ${H}`);
  const font = lettertype();
  // Op kleinere schermen wordt de tekening verkleind; tekst en titelblok groeien
  // mee zodat ze leesbaar blijven (callouts min. ~14px, titelblok min. ~12px).
  const schaal = vw / 1600;
  const fTekst = Math.min(1.35, Math.max(1, 0.75 / schaal));
  const fBlok = Math.min(1.6, Math.max(1, 0.85 / schaal));

  const kader = el("g", {}, svg);
  el("rect", { class: "tek__rand", x: 40, y: -off + 40, width: 1520, height: H - 80, pathLength: 1 }, kader);
  el("rect", { class: "tek__rand", x: 56, y: -off + 56, width: 1488, height: H - 112, pathLength: 1 }, kader);
  "ABCD".split("").forEach((c, i) => {
    const y = -off + 56 + ((H - 112) * (i + 0.5)) / 4 + 4;
    el("text", { class: "tek__ref", x: 48, y }, kader).textContent = c;
    el("text", { class: "tek__ref", x: 1552, y }, kader).textContent = c;
  });
  [1, 2, 3, 4, 5, 6].forEach((n, i) => {
    const x = 56 + (1488 * (i + 0.5)) / 6;
    el("text", { class: "tek__ref", x, y: -off + 52 }, kader).textContent = String(n);
    el("text", { class: "tek__ref", x, y: H - off - 44 }, kader).textContent = String(n);
  });
  const as = el("line", { class: "tek__as", x1: 80, y1: 450, x2: 1520, y2: 450 }, svg);
  const woordG = el("g", { class: "tek__woord" }, svg);
  const coG = el("g", {}, svg);

  const woord = "SPECIFIED".split("");
  const grootte = 300;
  const kap = grootte * 0.72; // hoogte van een hoofdletter in Bebas
  const basis = 450 + grootte * 0.35;
  const meet = el("text", { "font-family": font, "font-size": grootte, y: -999 }, svg);
  const breedtes = woord.map((c) => {
    meet.textContent = c;
    return meet.getComputedTextLength();
  });
  meet.remove();
  const spatie = 10;
  const totaal = breedtes.reduce((a, b) => a + b, 0) + spatie * (woord.length - 1);
  const start = 800 - totaal / 2;

  // Eindbeeld: beeldmerk + woord als één logo, gecentreerd, in het bovenste derde.
  const tussen = kap * 0.22;
  const merkB = MERK_B * (kap / MERK_H);
  const verschuif = (merkB + tussen) / 2; // het woord maakt plaats voor het merk
  const eindY = Math.round(0.33 * H - off - 450);
  const m = merk(woordG, start + verschuif - tussen - merkB, basis - kap + eindY, kap);

  let x = start;
  const uit = 1.36;
  const letters = woord.map((c, i) => {
    const g = el("g", {}, woordG);
    const vul = el("text", { class: "tek__vul", "font-family": font, "font-size": grootte, x, y: basis }, g);
    vul.textContent = c;
    const lijn = el("text", { class: "tek__lijn", "font-family": font, "font-size": grootte, x, y: basis }, g);
    lijn.textContent = c;
    const w = breedtes[i];
    const midden = x + w / 2;
    const dx = (midden - 800) * (uit - 1);
    const dy = (i % 2 ? 1 : -1) * 34;
    const cx = midden + dx;
    const top = basis - kap + dy;
    const bot = basis + dy;

    const boven = i % 2 === 0;
    const ay = boven ? top - 14 : bot + 14;
    const ky = i === 0 || i === 8 ? 124 : boven ? 170 + (i % 4 === 0 ? 0 : 44) : 730 - (i % 4 === 1 ? 0 : 44);
    const links = (i < 4 && i !== 0) || i === 8; // buitenste letters wijzen naar binnen
    const kx = cx + (links ? -24 : 24);
    const eind = kx + (links ? -70 : 70);
    const co = el("g", { opacity: 0 }, coG);
    el("circle", { class: "tek__punt", cx, cy: ay, r: 3.5 }, co);
    const leider = el("polyline", { class: "tek__leider", points: `${cx},${ay} ${kx},${ky} ${eind},${ky}` }, co);
    const tx = eind + (links ? -12 : 12);
    const anchor = links ? "end" : "start";
    const rol = el("text", { class: "tek__rol", x: tx, y: ky - 4, "text-anchor": anchor }, co);
    rol.style.fontSize = `${19 * fTekst}px`;
    acro(rol, kies(`tekening.callout.${i}.titel`, TEKENING_CALLOUTS[i][0]));
    const sub = el("text", { class: "tek__sub", x: tx, y: ky - 4 + 24 * fTekst, "text-anchor": anchor }, co);
    sub.style.fontSize = `${19 * fTekst}px`;
    sub.textContent = kies(`tekening.callout.${i}.sub`, TEKENING_CALLOUTS[i][1]);

    x += w + spatie;
    return { g, vul, lijn, co, leider, dx, dy, ex: verschuif, ey: eindY };
  });

  // Titelblok rechtsonder in het blad, met de handtekening als goedkeuring.
  const tb = el("g", { opacity: 0 }, svg);
  const bx = 1084, bw = 460, bh = 176, by = 900 + off - 240;
  // Groeit vanuit de hoek rechtsonder, zodat het in het blad blijft staan.
  tb.setAttribute("transform", `translate(${(bx + bw) * (1 - fBlok)} ${(by + bh) * (1 - fBlok)}) scale(${fBlok})`);
  el("rect", { class: "tek__blok", x: bx, y: by, width: bw, height: bh }, tb);
  el("line", { class: "tek__blok", x1: bx, y1: by + 54, x2: bx + bw, y2: by + 54 }, tb);
  el("line", { class: "tek__blok", x1: bx + 262, y1: by + 54, x2: bx + 262, y2: by + bh }, tb);
  const veld = (lx: number, ly: number, label: string, waarde: string) => {
    el("text", { class: "tek__label", x: lx, y: ly }, tb).textContent = label;
    el("text", { class: "tek__waarde", x: lx, y: ly + 22 }, tb).textContent = waarde;
  };
  veld(bx + 14, by + 20, "Project", kies("tekening.titelblok.project", TEKENING.titelblok.project));
  veld(bx + 14, by + 76, "Locatie", kies("tekening.titelblok.locatie", TEKENING.titelblok.locatie));
  veld(bx + 14, by + 126, "Waarden", kies("tekening.titelblok.waarden", TEKENING.titelblok.waarden));
  el("text", { class: "tek__label", x: bx + 276, y: by + 76 }, tb).textContent = kies("tekening.titelblok.akkoord", TEKENING.titelblok.akkoord);
  const hand = el("path", { class: "tek__hand", d: HANDTEKENING, pathLength: 1, transform: `translate(${bx + 276} ${by + 88}) scale(.31)` }, tb);

  const logoB = merkB + tussen + totaal;
  return {
    letters,
    titelblok: tb,
    hand,
    as,
    woordG,
    kom: m.kom,
    boog: m.boog,
    merkAfstand: kap * 0.6,
    eindSchaal: Math.min(1, 1380 / logoB),
    eindMidden: [800, basis - kap / 2 + eindY],
    titelblokEinde: 0.6,
    kader,
    contour: 1600,
  };
}

/** Staand (telefoon, tablet rechtop): het woord rechtop, letter onder letter, callouts rechts. */
function bouwStaand(svg: SVGSVGElement, vw: number, vh: number, kies: Kies): Delen {
  // De tekening is 900x1600; op een breder scherm groeit het blad mee in breedte.
  const W = Math.max(900, Math.round((1600 * vw) / vh));
  const offX = (W - 900) / 2;
  svg.setAttribute("viewBox", `${-offX} 0 ${W} 1600`);
  const font = lettertype();

  const kader = el("g", {}, svg);
  el("rect", { class: "tek__rand", x: -offX + 24, y: 24, width: W - 48, height: 1552, pathLength: 1 }, kader);
  el("rect", { class: "tek__rand", x: -offX + 38, y: 38, width: W - 76, height: 1524, pathLength: 1 }, kader);
  const as = el("line", { class: "tek__as", x1: 240, y1: 110, x2: 240, y2: 1490 }, svg);
  const woordG = el("g", { class: "tek__woord" }, svg);
  const coG = el("g", {}, svg);

  const woord = "SPECIFIED".split("");
  const grootte = 150;
  const stap = 126;
  const kap = grootte * 0.72;
  const start = 800 - (stap * woord.length) / 2;
  const opbouw = woord.map((c, i) => {
    const basis = start + (i + 1) * stap - 14;
    const g = el("g", {}, woordG);
    const vul = el("text", { class: "tek__vul", "font-family": font, "font-size": grootte, x: 240, y: basis, "text-anchor": "middle" }, g);
    vul.textContent = c;
    const lijn = el("text", { class: "tek__lijn tek__lijn--dik", "font-family": font, "font-size": grootte, x: 240, y: basis, "text-anchor": "middle" }, g);
    lijn.textContent = c;
    return { g, vul, lijn, basis, w: vul.getComputedTextLength() };
  });

  // Eindbeeld: het woord draait naar horizontaal met het beeldmerk ervoor,
  // gecentreerd boven de kop, en schaalt daarna tot de breedte van het blad.
  const spatie = 8;
  const eindBasis = 560;
  const tussen = kap * 0.22;
  const merkB = MERK_B * (kap / MERK_H);
  const woordB = opbouw.reduce((a, l) => a + l.w, 0) + spatie * (woord.length - 1);
  const logoB = merkB + tussen + woordB;
  let ex = 450 - logoB / 2 + merkB + tussen;
  const m = merk(woordG, 450 - logoB / 2, eindBasis - kap, kap);

  const letters = opbouw.map((l, i) => {
    const cy = l.basis - grootte * 0.36;
    const dy = (cy - 800) * 0.2;
    const dx = (i % 2 ? 1 : -1) * 36;
    const ax = 240 + dx + l.w / 2 + 12;
    const ay = cy + dy;
    const co = el("g", { opacity: 0 }, coG);
    el("circle", { class: "tek__punt", cx: ax, cy: ay, r: 5 }, co);
    const leider = el("polyline", { class: "tek__leider tek__leider--dik", points: `${ax},${ay} 430,${ay} 452,${ay}` }, co);
    acro(el("text", { class: "tek__rol tek__rol--groot", x: 466, y: ay - 2 }, co), kies(`tekening.callout.${i}.titel`, TEKENING_CALLOUTS[i][0]));
    el("text", { class: "tek__sub tek__sub--groot", x: 466, y: ay + 32 }, co).textContent = kies(`tekening.callout.${i}.sub`, TEKENING_CALLOUTS[i][1]);
    const midden = ex + l.w / 2;
    ex += l.w + spatie;
    return { g: l.g, vul: l.vul, lijn: l.lijn, co, leider, dx, dy, ex: midden - 240, ey: eindBasis - l.basis };
  });

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
  waa(bx + 22, by + 90, kies("tekening.titelblok.project", TEKENING.titelblok.project));
  const [stad, regio] = kies("tekening.titelblok.locatie", TEKENING.titelblok.locatie).split(", ");
  lab(bx + 22, by + 158, "Locatie");
  waa(bx + 22, by + 206, `${stad},`);
  waa(bx + 22, by + 252, regio ?? "");
  lab(bx + kol + 22, by + 158, "Goedgekeurd");
  const hand = el("path", { class: "tek__hand tek__hand--dik", d: HANDTEKENING, pathLength: 1, transform: `translate(${bx + kol + 12} ${by + 168}) scale(.44)` }, tb);

  return {
    letters,
    titelblok: tb,
    hand,
    as,
    woordG,
    kom: m.kom,
    boog: m.boog,
    merkAfstand: kap * 0.9,
    // Zo breed als het blad toelaat, met wat marge, maar niet absurd groot op een tablet.
    eindSchaal: Math.min(1.8, (W - 140) / logoB),
    eindMidden: [450, eindBasis - kap / 2],
    titelblokEinde: 0,
    kader,
    contour: 800,
  };
}

/** Eén tijdlijn voor beide oriëntaties, gestuurd door de scroll. */
function tijdlijn(root: HTMLElement, d: Delen) {
  const L = d.letters;
  L.forEach((l) => {
    const len = l.leider.getTotalLength();
    gsap.set(l.leider, { strokeDasharray: len, strokeDashoffset: len });
  });
  gsap.set(d.hand, { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(d.as, { opacity: 0 });
  gsap.set(L.map((l) => l.lijn), { strokeOpacity: 0, strokeDasharray: d.contour, strokeDashoffset: d.contour });
  gsap.set(d.kom, { y: -d.merkAfstand });
  gsap.set(d.boog, { y: d.merkAfstand });

  const co = L.map((l) => l.co);
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.8 },
  });
  // 1. Merk wordt tekening: vulling weg, contour erin, letters uit elkaar.
  tl.to(".tekening__intro", { opacity: 0, y: -20, duration: 0.4 }, 0)
    .to(L.map((l) => l.vul), { fillOpacity: 0, duration: 1 }, 0.2)
    .to(L.map((l) => l.lijn), { strokeOpacity: 1, duration: 0.3 }, 0.15)
    // De contour tekent zichzelf rond elke letter, alsof iemand hem natrekt.
    .to(L.map((l) => l.lijn), { strokeDashoffset: 0, duration: 1.1, stagger: 0.05, ease: "power1.inOut" }, 0.15)
    .to(L.map((l) => l.g), { x: (i) => L[i].dx, y: (i) => L[i].dy, duration: 1.4, ease: "power1.inOut" }, 0.3)
    .to(d.as, { opacity: 0.6, duration: 0.6 }, 0.9)
    // 2. Callouts tekenen zich, letter voor letter.
    .to(co, { opacity: 1, duration: 0.2, stagger: 0.16 }, 1.8)
    .from(co.map((g) => g.querySelector("circle")), { scale: 0, transformOrigin: "50% 50%", duration: 0.25, stagger: 0.16, ease: "back.out(3)" }, 1.8)
    .to(L.map((l) => l.leider), { strokeDashoffset: 0, duration: 0.5, stagger: 0.16 }, 1.85)
    .from(co.flatMap((g) => Array.from(g.querySelectorAll("text"))), { opacity: 0, x: 14, duration: 0.35, stagger: 0.08, ease: "power2.out" }, 2.05)
    // 3. Callouts wijken; het titelblok komt en Specified tekent af.
    .to(co, { opacity: 0, duration: 0.5 }, 3.7)
    .to(d.titelblok, { opacity: 1, duration: 0.4 }, 4.0)
    .to(d.hand, { strokeDashoffset: 0, duration: 1, autoRound: false }, 4.2)
    // 4. Het woord klikt samen in limoen en het beeldmerk valt erbij: het logo.
    .to(d.as, { opacity: 0, duration: 0.5 }, 5.2)
    .to(d.titelblok, { opacity: d.titelblokEinde, duration: 0.5 }, 5.2)
    .to(L.map((l) => l.g), { x: (i) => L[i].ex, y: (i) => L[i].ey, duration: 1.2, ease: "power2.inOut" }, 5.3)
    .to(L.map((l) => l.vul), { fillOpacity: 1, fill: "#dffd7b", duration: 0.8 }, 5.9)
    .to(L.map((l) => l.lijn), { strokeOpacity: 0, duration: 0.6 }, 5.9)
    .to(d.woordG, { scale: d.eindSchaal, svgOrigin: `${d.eindMidden[0]} ${d.eindMidden[1]}`, duration: 0.8, ease: "power2.inOut" }, 5.8)
    .to(d.kom, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.7)" }, 6.2)
    .to(d.boog, { opacity: 1, y: 0, duration: 0.7, ease: "back.out(1.7)" }, 6.35)
    // Het logo licht één keer op wanneer de helften samenklikken.
    .to(d.woordG, { filter: "drop-shadow(0 0 22px rgba(223, 253, 123, 0.5))", duration: 0.25 }, 6.9)
    .to(d.woordG, { filter: "drop-shadow(0 0 0px rgba(223, 253, 123, 0))", duration: 0.6 }, 7.15)
    .to(".tekening__slot", { opacity: 1, duration: 0.6 }, 6.6)
    .to({}, { duration: 0.6 });
  return tl;
}

export default function HeroTekening() {
  const { tekst } = useTeksten();
  const ref = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      const svg = svgRef.current;
      if (!root || !svg) return;
      const mm = gsap.matchMedia();

      mm.add(
        {
          liggend: "(prefers-reduced-motion: no-preference) and (orientation: landscape)",
          staand: "(prefers-reduced-motion: no-preference) and (orientation: portrait)",
        },
        (ctx) => {
          const { staand } = ctx.conditions as { liggend: boolean; staand: boolean };
          let tl: gsap.core.Timeline | null = null;
          let verhouding = 0;
          let actief = true;
          let geladen = false;

          const opruimen = () => {
            tl?.scrollTrigger?.kill();
            tl?.kill();
            tl = null;
            gsap.set([".tekening__intro", ".tekening__slot"], { clearProps: "opacity,transform" });
            svg.replaceChildren();
            delete root.dataset.klaar;
          };

          // Bouwen na het laden van Bebas (letterbreedtes worden gemeten), en
          // opnieuw als de verhouding van het blad merkbaar verandert.
          const bouw = () => {
            if (!actief) return;
            const blad = svg.getBoundingClientRect();
            const vw = blad.width || innerWidth;
            const vh = blad.height || innerHeight;
            verhouding = vw / vh;
            opruimen();
            const delen = staand ? bouwStaand(svg, vw, vh, tekst) : bouwLiggend(svg, vw, vh, tekst);
            tl = tijdlijn(root, delen);
            ScrollTrigger.refresh();
            // Laadmoment (alleen de eerste keer, bovenaan de pagina): de rand van
            // het blad tekent zich, daarna neemt de tekening het woord over zodra
            // de HTML-letters opgerezen zijn.
            const eerste = !geladen && scrollY < 40;
            geladen = true;
            if (eerste) {
              gsap.fromTo(delen.kader.querySelectorAll("rect"), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.15, autoRound: false });
              gsap.from(delen.kader.querySelectorAll("text"), { opacity: 0, duration: 0.8, delay: 0.9, stagger: 0.02 });
            }
            const wacht = eerste ? Math.max(0, 950 - performance.now()) : 0;
            setTimeout(() => actief && (root.dataset.klaar = "true"), wacht);
          };
          document.fonts.ready.then(bouw);

          let wacht: ReturnType<typeof setTimeout> | undefined;
          const opResize = () => {
            clearTimeout(wacht);
            wacht = setTimeout(() => {
              const b = svg.getBoundingClientRect();
              if (b.height && Math.abs(b.width / b.height - verhouding) > 0.04) bouw();
            }, 200);
          };
          addEventListener("resize", opResize);

          return () => {
            actief = false;
            clearTimeout(wacht);
            removeEventListener("resize", opResize);
            opruimen();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="tekening" aria-labelledby="hero-titel">
      <div className="tekening__blad">
        <svg ref={svgRef} className="tekening__svg" aria-hidden="true" focusable="false" />
        {/* Staat er meteen (ook zonder JS); de tekening neemt het over zodra ze gebouwd is. */}
        <p className="tekening__woord display" aria-hidden="true">
          {/* Beeldmerk: alleen zichtbaar in de stilstaande versie (beweging
              beperkt of geen JS), die het eindbeeld van de tekening toont. */}
          <svg className="tekening__merk" viewBox="0 0 26.3 24.4" focusable="false">
            <path d={MERK_KOM} />
            <path d={MERK_BOOG} />
          </svg>
          {"SPECIFIED".split("").map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </p>
        <p className="tekening__intro">
          <b><T k="tekening.intro" /></b> <span><T k="tekening.scroll_hint" /></span>
        </p>
        <div className="tekening__slot">
          <div className="wrap">
            <h1 id="hero-titel" className="display tekening__titel">
              <T k="hero.prefix" /> <span className="tekening__accent"><T k="hero.woord" /></span>
              <br />
              <T k="hero.suffix" />
            </h1>
            <div className="hero__actions">
              <a href="#contact" className="btn btn-primary">
                <T k="hero.cta_bedrijven" />
              </a>
              <a href="/vacatures" className="btn btn-secondary">
                <T k="hero.cta_engineers" />
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
