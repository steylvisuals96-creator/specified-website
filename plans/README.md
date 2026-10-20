# Animatieplannen

Opgesteld op commit `a3980d2`, branch `preview/animatie-audit`.

| # | Titel | Ernst | Status |
|---|---|---|---|
| 001 | `transition: all` vervangen (vacatures) | HIGH | TODO |
| 002 | Vacaturelijst: begrensde stagger, versnelde intrede | MEDIUM | TODO |
| 003 | Detailpaneel korter en versneld | MEDIUM | TODO |
| 004 | Hover-beweging alleen op hover-apparaten | MEDIUM | TODO |
| 005 | Limoenveeg: ease-out | MEDIUM | TODO |

## Volgorde

1. 001, 002, 003 raken allemaal `components/VacaturesClient.tsx`; voer ze na elkaar uit (niet parallel), in deze volgorde.
2. 004 (`app/globals.css`) en 005 (`components/ScrollMomenten.tsx`) zijn onafhankelijk van de rest en van elkaar.

## Afhankelijkheden

Geen inhoudelijke; alleen het bestand-conflict hierboven.
