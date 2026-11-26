# 008 - Mobiel menu: zakt open vanuit de navigatiebalk

- **Status**: DONE
- **Commit**: 06fe3b5
- **Severity**: LOW
- **Category**: Missed opportunity
- **Estimated scope**: 1 bestand (`app/globals.css`), 1 blok

## Problem

Het hamburgerknopje animeert al (de twee streepjes draaien in 220ms tot een kruis, `app/globals.css:279-282`), maar het menu zelf staat er in één frame: het wordt voorwaardelijk gerenderd zonder enige overgang. Het scherm wisselt dus abrupt van pagina naar een vol paneel, terwijl het knopje suggereert dat er iets opengaat.

```tsx
/* components/Nav.tsx:68-69 - huidig */
{menuOpen && (
  <nav id="mobiel-menu" className="site-nav__mobile" aria-label="Mobiel menu">
```

```css
/* app/globals.css:283-287 - huidig */
.site-nav__mobile {
  background: var(--ink-900); border-top: 1px solid var(--line);
  padding: 1.5rem var(--gutter) 2rem; display: flex; flex-direction: column; gap: 0.25rem;
  min-height: calc(100svh - 76px);
}
```

## Target

Het paneel opent als een sluiter vanuit de navigatiebalk naar beneden (`clip-path`, toegestaan in `DESIGN.md`: "naast transform/opacity mogen ook `clip-path` en `mask`"), 280ms met de standaardcurve. Bij reduced motion alleen een korte fade. De intrede gebruikt `@starting-style`, dus geen JavaScript en geen wijziging in `Nav.tsx`.

```css
/* app/globals.css - target, vervangt het huidige .site-nav__mobile-blok */
.site-nav__mobile {
  background: var(--ink-900); border-top: 1px solid var(--line);
  padding: 1.5rem var(--gutter) 2rem; display: flex; flex-direction: column; gap: 0.25rem;
  min-height: calc(100svh - 76px);
  clip-path: inset(0 0 0 0);
  transition: opacity 160ms ease-out;
}
/* Intrede: het menu zakt open vanuit de balk; bij beperkte beweging alleen een fade. */
@starting-style {
  .site-nav__mobile { opacity: 0; }
}
@media (prefers-reduced-motion: no-preference) {
  .site-nav__mobile { transition: clip-path 280ms var(--ease-out), opacity 160ms ease-out; }
  @starting-style {
    .site-nav__mobile { clip-path: inset(0 0 100% 0); }
  }
}
```

Waarom deze waarden:
- 280ms valt binnen het bereik voor panelen en lades (200-500ms) en blijft onder de 300ms voor UI.
- `var(--ease-out)` = `cubic-bezier(0.22, 1, 0.36, 1)`, de vastgelegde standaardcurve.
- `clip-path: inset(0 0 0 0)` staat expliciet in de eindtoestand: van `inset(...)` naar `none` kan een browser niet interpoleren.

## Repo conventions to follow

- Easing-token `--ease-out` staat in `app/globals.css:20`; gebruik `var(--ease-out)`, typ de curve niet opnieuw.
- Reduced motion: behoud de overgang van toestand (fade), laat de beweging vallen. Vergelijk `.tekening__woord` / reduced-motion-blokken in hetzelfde bestand.
- Kleurwissels blijven `160ms ease-out` (`DESIGN.md`, rij "Knoppen").

## Steps

1. Vervang in `app/globals.css` het blok `.site-nav__mobile { ... }` (regels 283-287) door het volledige Target-blok hierboven, inclusief de `@starting-style`- en `@media`-blokken en het commentaar.

## Boundaries

- `components/Nav.tsx` NIET wijzigen (geen state, geen `AnimatePresence`, geen extra attributen).
- Geen sluitanimatie: het menu verdwijnt bij sluiten direct, zoals nu. Een exit vraagt om JS en valt buiten dit plan.
- Geen stagger op de menulinks.
- De burger-animatie (`.site-nav__burger span`) niet aanraken.
- Geen nieuwe dependencies.
- Wijkt het huidige `.site-nav__mobile`-blok af van de excerpt (drift sinds commit 06fe3b5): STOP en rapporteer.

## Verification

- **Mechanical**: `npm run build` slaagt (Tailwind v4 / Lightning CSS moet `@starting-style` doorlaten; controleer in de gebouwde CSS onder `.next/static/css` dat `@starting-style` erin staat).
- **Feel check**: open de site op 375px breed (DevTools device-modus) of op een echte telefoon.
  - Tik op het hamburgerknopje: het paneel zakt in ~0,3 s open vanaf de navigatiebalk naar beneden, gelijk met het kruisje.
  - Tik meteen nog eens (sluiten): het menu verdwijnt direct, zonder haperen.
  - Open en sluit snel vijf keer achter elkaar: geen flikkering, geen half-open paneel dat blijft staan.
  - DevTools > Animations op 10%: de onderrand van het paneel schuift naar beneden; de inhoud zelf beweegt niet.
  - Rendering > `prefers-reduced-motion: reduce`: geen sluitereffect, alleen een korte fade.
  - In een browser zonder `@starting-style` (oudere Safari < 17.5) verschijnt het menu direct, zoals nu. Dat is de bedoelde terugval.
- **Done when**: het menu opent met de sluiter op mobiel, en `components/Nav.tsx` is ongewijzigd.
