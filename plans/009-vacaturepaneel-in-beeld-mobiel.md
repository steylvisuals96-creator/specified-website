# 009 - Vacatures op mobiel: geopend detail in beeld brengen

- **Status**: TODO
- **Commit**: 06fe3b5
- **Severity**: MEDIUM
- **Category**: Missed opportunity
- **Estimated scope**: 1 bestand (`components/VacaturesClient.tsx`), klein

## Problem

Onder 768px wordt de vacaturepagina één kolom (`app/globals.css:184-188`). Het detailpaneel staat dan ná de hele lijst. Wie op een vacature tikt, ziet alleen het label van "Bekijk" naar "Sluiten" springen; het paneel opent buiten beeld.

Gemeten in de preview op 375x812 met 4 vacatures: de aangetikte rij stond op y = 570px, het geopende paneel op y = 1177px, onder de onderrand van het scherm (812px). Er is geen beweging of verwijzing die uitlegt waar de inhoud naartoe ging.

```tsx
/* components/VacaturesClient.tsx:4 - huidig */
import { useState } from "react";
```

```tsx
/* components/VacaturesClient.tsx:101 - huidig */
const selectedJob = vacatures.find((v) => v.id === selected);
```

```tsx
/* components/VacaturesClient.tsx:194-201 - huidig */
{selectedJob && (
  <motion.div
    key={String(selectedJob.id)}
    initial={{ opacity: 0, transform: "translateX(12px)" }}
    animate={{ opacity: 1, transform: "translateX(0px)" }}
    transition={{ duration: 0.25, ease: EASE }}
    className="vac-detail"
    style={{ position: "sticky", top: "calc(72px + 2rem)", backgroundColor: "var(--wash)", border: "1px solid var(--border)", borderRadius: 0, padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}
  >
```

## Target

Alleen op mobiel (max-width 767px, dezelfde grens als de CSS) scrolt de pagina na het openen naar het paneel, zacht, of direct bij reduced motion. Het paneel stopt 92px onder de bovenrand (76px navigatiebalk + 16px lucht). Op desktop verandert er niets: daar staat het paneel al naast de lijst.

```tsx
/* import - target */
import { useEffect, useRef, useState } from "react";
```

```tsx
/* direct onder regel 101 (const selectedJob = ...) - target */
const paneel = useRef<HTMLDivElement>(null);

// Op mobiel staat het detail onder de hele lijst: breng het in beeld na het openen.
useEffect(() => {
  if (selected === null) return;
  if (!matchMedia("(max-width: 767px)").matches) return;
  const zacht = matchMedia("(prefers-reduced-motion: no-preference)").matches;
  paneel.current?.scrollIntoView({ behavior: zacht ? "smooth" : "auto", block: "start" });
}, [selected]);
```

```tsx
/* motion.div van het paneel - target (alleen ref en scrollMarginTop erbij) */
<motion.div
  ref={paneel}
  key={String(selectedJob.id)}
  initial={{ opacity: 0, transform: "translateX(12px)" }}
  animate={{ opacity: 1, transform: "translateX(0px)" }}
  transition={{ duration: 0.25, ease: EASE }}
  className="vac-detail"
  style={{ position: "sticky", top: "calc(72px + 2rem)", scrollMarginTop: "92px", backgroundColor: "var(--wash)", border: "1px solid var(--border)", borderRadius: 0, padding: "2.5rem", display: "flex", flexDirection: "column", gap: "2rem" }}
>
```

## Repo conventions to follow

- De mobiele grens is 767px: `@media (max-width: 767px)` in `app/globals.css:184` maakt `.vac-grid` één kolom. Gebruik exact dezelfde query.
- Reduced motion wordt elders in dit bestand via `<MotionConfig reducedMotion="user">` geregeld; dat geldt niet voor scrollen, daarom de eigen `matchMedia`-controle.
- De navigatiebalk is 76px hoog (`.site-nav__bar { height: 76px; }`).
- Commentaar: Nederlands, kort, boven het blok.

## Steps

1. Regel 4: vervang `import { useState } from "react";` door `import { useEffect, useRef, useState } from "react";`.
2. Voeg direct onder `const selectedJob = vacatures.find((v) => v.id === selected);` (regel 101) de `useRef` en de `useEffect` uit Target toe, met het commentaar.
3. Voeg op de `motion.div` van het detailpaneel (regel 195) `ref={paneel}` toe als eerste prop.
4. Voeg in het `style`-object van diezelfde `motion.div` `scrollMarginTop: "92px",` toe direct na `top: "calc(72px + 2rem)",`.

## Boundaries

- Geen wijziging aan `initial`, `animate` of `transition` van het paneel.
- Geen wijziging aan de lijst, de filters of de grid-indeling.
- Geen focusverplaatsing naar het paneel (aparte toegankelijkheidskeuze, buiten dit plan).
- Niets doen bij sluiten (`selected === null`).
- Geen nieuwe dependencies.
- Wijkt een excerpt af van de code (drift sinds commit 06fe3b5): STOP en rapporteer.

## Verification

- **Mechanical**: `npx tsc --noEmit` slaagt; `npx eslint components/VacaturesClient.tsx` geeft geen nieuwe fouten (let op `react-hooks/exhaustive-deps`: de afhankelijkheid is alleen `selected`).
- **Feel check**:
  - DevTools device-modus 375x812, open `/vacatures`, tik op de eerste vacature: de pagina glijdt naar het paneel; de bovenkant van het paneel staat net onder de navigatiebalk, niet erachter.
  - Tik daarna een andere vacature in de lijst aan (scroll eerst terug): de pagina scrolt opnieuw naar het nieuwe paneel.
  - Tik "Sluiten": er gebeurt geen scroll.
  - Rendering > `prefers-reduced-motion: reduce`: de pagina springt direct naar het paneel, zonder glijden.
  - Desktop (1440px breed): klik een vacature; de pagina scrolt NIET, het paneel verschijnt naast de lijst zoals voorheen.
  - Desktop met muis, venster smaller dan 768px gemaakt: hier draait Lenis (vloeiend scrollen). Controleer dat het naar het paneel scrollen niet hapert of terugspringt. Hapert het, rapporteer dat zonder zelf iets aan Lenis te veranderen.
- **Done when**: op 375px staat de bovenkant van het geopende paneel binnen het scherm, en op desktop is het gedrag ongewijzigd.
