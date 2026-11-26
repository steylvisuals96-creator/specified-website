# 007 - Contact: onderlijn onder het e-mailadres via transform

- **Status**: DONE
- **Commit**: 06fe3b5
- **Severity**: LOW
- **Category**: Performance
- **Estimated scope**: 3 bestanden (`components/CTA.tsx`, `app/globals.css`, `components/ScrollMomenten.tsx`), klein

## Problem

De limoen onderlijn onder het e-mailadres in de contactsectie trekt zich met de scroll (scrub). Dat gebeurt door `background-size` te animeren. `background-size` is geen compositor-eigenschap: bij elk scrollframe wordt het element opnieuw geschilderd. Het gaat om één element, dus de winst is klein, maar het is het enige scroll-moment op de pagina dat niet via `transform` loopt.

```tsx
/* components/ScrollMomenten.tsx:81-89 - huidig */
gsap.fromTo(
  ".cta__mail",
  { backgroundSize: "0% 3px" },
  {
    backgroundSize: "100% 3px",
    ease: "none",
    scrollTrigger: { trigger: ".cta__mail", start: "top 90%", end: "top 55%", scrub: 0.6 },
  },
);
```

```css
/* app/globals.css:551-557 - huidig */
.cta__mail {
  font-size: clamp(1.75rem, 5.5vw, 5rem); font-weight: 600; line-height: 1.05; letter-spacing: -0.02em;
  color: var(--bone-100); text-decoration: none; overflow-wrap: anywhere;
  background-image: linear-gradient(var(--lime-300), var(--lime-300));
  background-size: 100% 3px; background-position: 0 100%; background-repeat: no-repeat; padding-bottom: 0.1em;
  transition: color 160ms ease-out;
}
```

```tsx
/* components/CTA.tsx:11-13 - huidig */
<a href={`mailto:${mail}`} className="cta__mail">
  {mail}
</a>
```

## Target

De lijn wordt een eigen `<span>` die met `transform: scaleX()` groeit vanaf links. Zonder JS (en bij reduced motion) staat de lijn volledig, net als nu.

```tsx
/* components/CTA.tsx - target */
<a href={`mailto:${mail}`} className="cta__mail">
  {mail}
  <span className="cta__lijn" aria-hidden="true" />
</a>
```

```css
/* app/globals.css - target */
.cta__mail {
  position: relative;
  font-size: clamp(1.75rem, 5.5vw, 5rem); font-weight: 600; line-height: 1.05; letter-spacing: -0.02em;
  color: var(--bone-100); text-decoration: none; overflow-wrap: anywhere; padding-bottom: 0.1em;
  transition: color 160ms ease-out;
}
/* De onderlijn: een eigen element, zodat de scroll alleen transform hoeft te animeren. */
.cta__lijn {
  position: absolute; left: 0; right: 0; bottom: 0; height: 3px;
  background: var(--lime-300); transform-origin: left center;
}
```

```tsx
/* components/ScrollMomenten.tsx - target, vervangt regels 81-89 */
gsap.fromTo(
  ".cta__lijn",
  { scaleX: 0 },
  {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: ".cta__mail", start: "top 90%", end: "top 55%", scrub: 0.6 },
  },
);
```

## Repo conventions to follow

- Scroll-momenten staan allemaal in `components/ScrollMomenten.tsx`, binnen `mm.add("(prefers-reduced-motion: no-preference)", ...)`. Zo blijft de lijn bij reduced motion vanzelf volledig staan.
- `DESIGN.md`: "alles is zichtbaar in de HTML zonder JavaScript"; de beginstaat (`scaleX: 0`) wordt pas door GSAP gezet. Zet dus GEEN `transform: scaleX(0)` in de CSS.
- Exemplaar van hetzelfde patroon: `.jobs__veeg` in `app/globals.css` (een `<span aria-hidden>` dat GSAP met `scaleX` animeert, `components/ScrollMomenten.tsx:46-56`).

## Steps

1. `components/CTA.tsx`: voeg binnen de `<a className="cta__mail">`, na `{mail}`, de regel `<span className="cta__lijn" aria-hidden="true" />` toe.
2. `app/globals.css`: in `.cta__mail` voeg `position: relative;` toe en verwijder de drie declaraties `background-image`, `background-size`, `background-position` en `background-repeat` (laat `padding-bottom: 0.1em` staan). Voeg direct onder het `.cta__mail`-blok de `.cta__lijn`-regel uit Target toe, met het commentaar erboven.
3. `components/ScrollMomenten.tsx`: vervang het `gsap.fromTo(".cta__mail", ...)`-blok (regels 81-89) door het blok uit Target. De `scrollTrigger.trigger` blijft `".cta__mail"`.

## Boundaries

- De kop `.cta h2` (schaal 0.82 naar 1) niet aanraken.
- Hover-kleur van `.cta__mail` (`:hover { color: var(--lime-300); }`) blijft zoals hij is.
- Geen andere scroll-momenten wijzigen.
- Geen nieuwe dependencies.
- Wijkt een excerpt af van de code (drift sinds commit 06fe3b5): STOP en rapporteer.

## Verification

- **Mechanical**: `npx tsc --noEmit` en `npm run build` slagen.
- **Feel check**: open de homepage en scroll naar de contactsectie.
  - De limoen lijn groeit van links naar rechts onder het e-mailadres terwijl je scrolt, en krimpt terug als je terug omhoog scrolt.
  - De lijn ligt op dezelfde plek als voorheen: direct onder de tekst, over de volle breedte van het adres. Controleer ook op 375px breed, waar het adres over twee regels kan lopen: de lijn staat dan onder het hele blok, zoals nu ook.
  - DevTools > Performance, scroll door de sectie: geen "Paint" meer voor `.cta__mail` per frame (alleen composite).
  - Rendering > `prefers-reduced-motion: reduce`: de lijn staat volledig, zonder beweging.
  - JavaScript uitschakelen: de lijn staat volledig.
- **Done when**: `backgroundSize` komt niet meer voor in `components/ScrollMomenten.tsx` en `background-size` niet meer in de `.cta__mail`-regel.
