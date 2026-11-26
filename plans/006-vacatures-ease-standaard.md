# 006 - Vacatures: Framer-easing gelijk aan de standaardcurve

- **Status**: VERVALLEN
- **Commit**: 06fe3b5
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 bestand (`components/VacaturesClient.tsx`), 1 regel

## Problem

`DESIGN.md` (sectie Motion) legt de standaardcurve vast: "Easing standaard exponentieel uit (`cubic-bezier(0.22,1,0.36,1)`)". In CSS staat die als token in `app/globals.css:20`:

```css
/* app/globals.css:20 - huidig */
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
```

De vacaturepagina gebruikt in Framer Motion een eigen, bijna gelijke curve:

```tsx
/* components/VacaturesClient.tsx:6 - huidig */
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
```

`EASE` wordt gebruikt op regel 128 (h1-intrede), 144 (filterblok), 169 (vacaturerijen) en 199 (detailpaneel). Het verschil is klein, maar het is een tweede curve naast de vastgelegde standaard; bij elke volgende aanpassing groeit de kans dat de twee uit elkaar lopen.

## Target

```tsx
/* components/VacaturesClient.tsx:6 - target */
// Zelfde curve als --ease-out in app/globals.css (standaard uit DESIGN.md).
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
```

## Repo conventions to follow

- De standaardcurve is `cubic-bezier(0.22, 1, 0.36, 1)`, als CSS-token `--ease-out` (`app/globals.css:20`).
- Framer Motion kan geen CSS-variabele als `ease` lezen; daarom blijft het een array in dit bestand, met een commentaar dat naar het token verwijst.
- Commentaar in deze codebase is Nederlands, kort, boven de regel.

## Steps

1. Vervang regel 6 van `components/VacaturesClient.tsx` door de twee regels uit Target (commentaar + constante).

## Boundaries

- Niets anders in het bestand wijzigen: geen duur, delay of transform.
- `.jobs__rij` in `app/globals.css` gebruikt bewust `cubic-bezier(0.2, 0, 0, 1)` (vastgelegd in `DESIGN.md`, rij "Vacaturerij"). Niet aanraken.
- Geen nieuwe dependencies.
- Wijkt regel 6 af van de excerpt (drift sinds commit 06fe3b5): STOP en rapporteer.

## Verification

- **Mechanical**: `npx tsc --noEmit` slaagt; `npx eslint components/VacaturesClient.tsx` geeft geen nieuwe fouten.
- **Feel check**: open `/vacatures`.
  - Laad de pagina: titel, filterblok en rijen komen nog steeds vlot binnen en remmen zacht af.
  - Klik een vacature open: het paneel glijdt in zoals voorheen.
  - DevTools > Animations op 10%: de beweging start snel en ebt lang uit; geen merkbaar verschil met de knoppen en het menu elders op de site.
- **Done when**: `grep -n "0.16, 1, 0.3, 1" components/VacaturesClient.tsx` geeft niets terug.
