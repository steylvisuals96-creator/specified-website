# 003 — Detailpaneel: korter en versneld

- **Status**: DONE
- **Commit**: a3980d2
- **Severity**: MEDIUM
- **Category**: Easing & duration / performance
- **Estimated scope**: 1 bestand (`components/VacaturesClient.tsx`), 3 regels

## Problem

Het detailpaneel schuift 500ms met `x` (Framer-shorthand, main thread). Wie door de vacatures klikt, wacht telkens een halve seconde. UI-animaties horen onder 300ms.

```tsx
/* components/VacaturesClient.tsx:195-199 — huidig */
<motion.div
  key={String(selectedJob.id)}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, ease: EASE }}
```

## Target

```tsx
/* target */
<motion.div
  key={String(selectedJob.id)}
  initial={{ opacity: 0, transform: "translateX(12px)" }}
  animate={{ opacity: 1, transform: "translateX(0px)" }}
  transition={{ duration: 0.25, ease: EASE }}
```

## Repo conventions to follow

- `EASE` (`:6`) blijft de curve. Het paneel heeft `position: sticky` in `style`; geen `transform` in `style` zetten.

## Steps

1. Vervang regels 197-199 door de Target-waarden (`key` en `className` blijven).

## Boundaries

- Geen exit-animatie / `AnimatePresence` (aparte "gemiste kans").
- Geen wijziging aan de inhoud of de sticky-positie.
- Drift t.o.v. de excerpt: STOP en rapporteer.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npm run lint`.
- **Feel check**: `/vacatures`, klik een rij, dan een andere rij.
  - Het paneel staat binnen ~250ms op zijn plek, glijdt 12px van rechts.
  - Snel wisselen tussen rijen voelt niet traag.
  - DevTools > Animations op 10%: alleen opacity + translateX; geen layout-sprongen in de lijst ernaast.
  - `prefers-reduced-motion: reduce`: paneel verschijnt zonder verplaatsing.
- **Done when**: duur 0.25 en geen `x`-prop meer in dit blok.
