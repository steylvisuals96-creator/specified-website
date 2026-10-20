# 005 — Limoenveeg vacatures: ease-out in plaats van ease-in

- **Status**: DONE
- **Commit**: a3980d2
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 bestand (`components/ScrollMomenten.tsx`), 1 regel

## Problem

De veeg over de vacaturerijen begint met `power2.in`: traag starten op het moment dat de bezoeker kijkt. Ease-in op UI is altijd een bevinding.

```tsx
/* components/ScrollMomenten.tsx:50-55 — huidig */
.fromTo(
  vegen,
  { scaleX: 0, transformOrigin: "left center" },
  { scaleX: 1, duration: 0.35, ease: "power2.in", stagger: 0.09 },
)
.to(vegen, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: "power2.out", stagger: 0.09 }, 0.3);
```

## Target

Intrede (links naar rechts) met `power2.out`; de uitgaande beweging blijft `power2.out`.

```tsx
{ scaleX: 1, duration: 0.35, ease: "power2.out", stagger: 0.09 },
```

## Repo conventions to follow

- GSAP-easings in dit bestand zijn `"none"` (scrub) of `power2.*`; blijf bij `power2.out`.

## Steps

1. `components/ScrollMomenten.tsx` regel 53: vervang `ease: "power2.in"` door `ease: "power2.out"`.

## Boundaries

- Geen wijziging aan duur, stagger of `scrollTrigger`-config.
- Raak de andere ScrollTrigger-blokken niet aan.
- Drift t.o.v. de excerpt: STOP en rapporteer.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npm run lint`.
- **Feel check**: scroll op de homepage naar de vacaturelijst.
  - De veeg start direct en remt aan het einde; hij voelt niet meer "aarzelend".
  - Overlap tussen intrede en uitgang (`0.3`) ziet er nog netjes uit; zo niet, meld het zonder zelf de timing te wijzigen.
  - `prefers-reduced-motion: reduce`: geen veeg (zit in `matchMedia`).
- **Done when**: `power2.in` komt niet meer voor in `ScrollMomenten.tsx`.
