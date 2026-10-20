# 002 — Vacaturelijst: begrensde stagger, hardware-versnelde intrede

- **Status**: TODO
- **Commit**: a3980d2
- **Severity**: MEDIUM
- **Category**: Performance / purpose & frequency
- **Estimated scope**: 1 bestand (`components/VacaturesClient.tsx`), 1 blok

## Problem

Elke vacaturerij animeert met Framer Motion-shorthand `y` (draait op de main thread), heeft geen easing (valt terug op de Framer-default) en een onbegrensde `delay: i * 0.06`. Bij veel vacatures wacht de laatste rij ruim over een halve seconde. Filteren is een veelgebruikte actie, dus dit herhaalt zich.

```tsx
/* components/VacaturesClient.tsx:165-169 — huidig */
<motion.button
  key={job.id}
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, delay: i * 0.06 }}
```

## Target

Volledige transform-string (Framer-shorthand is niet versneld), `ease-out` met de bestaande `EASE`-constante (`components/VacaturesClient.tsx:6`), 250ms, en een stagger van 40ms die na de 5e rij stopt (max 160ms wachttijd).

```tsx
/* target */
<motion.button
  key={job.id}
  initial={{ opacity: 0, transform: "translateY(12px)" }}
  animate={{ opacity: 1, transform: "translateY(0px)" }}
  transition={{ duration: 0.25, delay: Math.min(i, 4) * 0.04, ease: EASE }}
```

## Repo conventions to follow

- `EASE = [0.16, 1, 0.3, 1]` staat bovenaan het bestand en wordt al gebruikt op de h1 (`:128`) en het paneel (`:199`). Hergebruik die.
- `MotionConfig reducedMotion="user"` (`:120`) omhult alles; laat dat staan.

## Steps

1. Vervang het `initial`/`animate`/`transition`-trio op regel 167-169 door de Target-waarden. Laat `key`, `type`, `aria-*`, `onClick` en `style` ongemoeid.
2. Controleer dat de `transform` in `style` van de knop geen eigen `transform` zet (nu niet; zo houden).

## Boundaries

- Niet de `transition: "all"` in `style` aanpassen (plan 001).
- Niet het detailpaneel (plan 003) en niet de h1/filterblok-intrede.
- Geen nieuwe dependencies, geen `AnimatePresence` toevoegen.
- Drift t.o.v. de excerpt: STOP en rapporteer.

## Verification

- **Mechanical**: `npx tsc --noEmit`, `npm run lint`.
- **Feel check**: `/vacatures`.
  - Laden en filteren: de lijst bouwt zichtbaar sneller op; rijen 6+ verschijnen samen met rij 5.
  - Spam de filterknoppen; geen haperingen.
  - DevTools > Animations op 10%: beweging is 12px omhoog + fade, begint snel en ebt uit.
  - Rendering > `prefers-reduced-motion: reduce`: geen verplaatsing meer (MotionConfig regelt dit).
- **Done when**: laatste rij begint uiterlijk 160ms na de eerste en de props gebruiken `transform` in plaats van `y`.
