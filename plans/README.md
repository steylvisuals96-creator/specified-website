# Animatieplannen

Opgesteld op commit `a3980d2`, branch `preview/animatie-audit`.

| # | Titel | Ernst | Status |
|---|---|---|---|
| 001 | `transition: all` vervangen (vacatures) | HIGH | DONE |
| 002 | Vacaturelijst: begrensde stagger, versnelde intrede | MEDIUM | DONE |
| 003 | Detailpaneel korter en versneld | MEDIUM | DONE |
| 004 | Hover-beweging alleen op hover-apparaten | MEDIUM | DONE |
| 005 | Limoenveeg: ease-out | MEDIUM | DONE |

## Volgorde

1. 001, 002, 003 raken allemaal `components/VacaturesClient.tsx`; voer ze na elkaar uit (niet parallel), in deze volgorde.
2. 004 (`app/globals.css`) en 005 (`components/ScrollMomenten.tsx`) zijn onafhankelijk van de rest en van elkaar.

## Afhankelijkheden

Geen inhoudelijke; alleen het bestand-conflict hierboven.
