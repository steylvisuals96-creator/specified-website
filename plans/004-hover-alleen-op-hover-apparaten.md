# 004 — Beweging bij hover alleen op apparaten met echte hover

- **Status**: TODO
- **Commit**: a3980d2
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 bestand (`app/globals.css`), 3 blokken

## Problem

Op touch triggert een tik een "plakkende" `:hover`. De limoenveeg op de vacaturerij en de logo-animatie blijven daardoor hangen of spelen onverwacht af na een tik.

```css
/* app/globals.css:470-474 — huidig */
  background: var(--lime-300); transform: scaleX(0); transform-origin: left;
  transition: transform 220ms cubic-bezier(0.2, 0, 0, 1);
}
.jobs__rij:hover::before, .jobs__rij:focus-visible::before { transform: scaleX(1); }
.jobs__rij:hover, .jobs__rij:focus-visible { color: var(--ink-900); }
```
```css
/* app/globals.css:475-477 — huidig (gebruik `sed -n 474,480p app/globals.css` voor de volledige selectoren) */
.jobs__rij:hover .jobs__meta, .jobs__rij:hover .jobs__vers-label,
.jobs__rij:focus-visible .jobs__meta, .jobs__rij:focus-visible .jobs__vers-label,
.jobs__rij:hover .jobs__getal, .jobs__rij:focus-visible .jobs__getal { color: var(--ink-900); }
```
```css
/* app/globals.css:605-608 — huidig */
@media (prefers-reduced-motion: no-preference) {
  a:hover > .logo .logo__kom, a:focus-visible > .logo .logo__kom { animation: logo-kom 620ms var(--ease-out); }
  a:hover > .logo .logo__boog, a:focus-visible > .logo .logo__boog { animation: logo-boog 620ms var(--ease-out); }
}
```

## Target

`:hover`-selectors alleen binnen `@media (hover: hover) and (pointer: fine)`; `:focus-visible` blijft altijd actief (toetsenbord). Kleurwissels op knoppen/links blijven buiten scope: die zijn onschadelijk.

```css
/* target jobs-rij */
.jobs__rij:focus-visible::before { transform: scaleX(1); }
.jobs__rij:focus-visible { color: var(--ink-900); }
.jobs__rij:focus-visible .jobs__meta, .jobs__rij:focus-visible .jobs__vers-label,
.jobs__rij:focus-visible .jobs__getal { color: var(--ink-900); }
@media (hover: hover) and (pointer: fine) {
  .jobs__rij:hover::before { transform: scaleX(1); }
  .jobs__rij:hover { color: var(--ink-900); }
  .jobs__rij:hover .jobs__meta, .jobs__rij:hover .jobs__vers-label,
  .jobs__rij:hover .jobs__getal { color: var(--ink-900); }
}
```
```css
/* target logo */
@media (prefers-reduced-motion: no-preference) {
  a:focus-visible > .logo .logo__kom { animation: logo-kom 620ms var(--ease-out); }
  a:focus-visible > .logo .logo__boog { animation: logo-boog 620ms var(--ease-out); }
}
@media (prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) {
  a:hover > .logo .logo__kom { animation: logo-kom 620ms var(--ease-out); }
  a:hover > .logo .logo__boog { animation: logo-boog 620ms var(--ease-out); }
}
```

## Repo conventions to follow

- Reduced-motion staat al in `@media (prefers-reduced-motion: ...)`-blokken (`app/globals.css:306`, `:605`). Behoud dat; combineer waar nodig met `and`.

## Steps

1. Lees `app/globals.css:462-480` en splits de `.jobs__rij`-regels met `:hover` zoals in Target; neem alle bestaande `:hover`-selectoren uit de regels 473-477 mee (niets laten vallen).
2. Doe hetzelfde voor de logo-regels op 605-608.
3. Laat de kleur-`fill`-hover op regel 603-604 staan.

## Boundaries

- Geen wijziging aan duur, easing of kleur; alleen de gating.
- Geen aanpassingen in `.btn`, `.site-nav__link`, `.text-link`.
- Drift t.o.v. de excerpts: STOP en rapporteer.

## Verification

- **Mechanical**: `npm run build` slaagt (CSS parseert).
- **Feel check**:
  - Desktop (muis): hover op een vacaturerij laat de limoenveeg lopen; hover op het logo speelt de animatie.
  - DevTools > device-modus (touch): tik op een vacaturerij of het logo; geen veeg/animatie blijft hangen.
  - Toetsenbord: Tab naar een rij en naar het logo; de focus-stijl werkt nog.
- **Done when**: geen `:hover` meer buiten een `(hover: hover)`-query in de gewijzigde blokken.
