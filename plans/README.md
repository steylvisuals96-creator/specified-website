# Animatieplannen

Ronde 1 (001-005) opgesteld op commit `a3980d2`, uitgevoerd en samengevoegd via PR #7.
Ronde 2 (006-009) opgesteld op commit `06fe3b5`.

| # | Titel | Ernst | Status |
|---|---|---|---|
| 001 | `transition: all` vervangen (vacatures) | HIGH | DONE |
| 002 | Vacaturelijst: begrensde stagger, versnelde intrede | MEDIUM | DONE |
| 003 | Detailpaneel korter en versneld | MEDIUM | DONE |
| 004 | Hover-beweging alleen op hover-apparaten | MEDIUM | DONE |
| 005 | Limoenveeg: ease-out | MEDIUM | DONE |
| 006 | Vacatures: Framer-easing gelijk aan de standaardcurve | LOW | TODO |
| 007 | Contact: onderlijn via transform | LOW | TODO |
| 008 | Mobiel menu: zakt open vanuit de balk | LOW | TODO |
| 009 | Vacatures op mobiel: geopend detail in beeld | MEDIUM | VERVALLEN |

009 vervalt: het detailpaneel is vervangen door een pagina per vacature (2026-11-12). Kijk bij 006 eerst na of `components/VacaturesClient.tsx` nog de code bevat die het plan beschrijft.

## Volgorde ronde 2

1. 006 raakt `components/VacaturesClient.tsx`.
2. 007 en 008 raken allebei `app/globals.css`, op verschillende plekken: na elkaar uitvoeren.

## Volgorde ronde 1 (uitgevoerd)

1. 001, 002, 003 raken allemaal `components/VacaturesClient.tsx`; voer ze na elkaar uit (niet parallel), in deze volgorde.
2. 004 (`app/globals.css`) en 005 (`components/ScrollMomenten.tsx`) zijn onafhankelijk van de rest en van elkaar.

## Afhankelijkheden

Geen inhoudelijke; alleen het bestand-conflict hierboven.
