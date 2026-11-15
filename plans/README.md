# Animatieplannen

Ronde 1 (001-005) opgesteld op commit `a3980d2`, uitgevoerd en samengevoegd via PR #7.
Ronde 2 (006-009) opgesteld op commit `06fe3b5` (main).

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
| 009 | Vacatures op mobiel: geopend detail in beeld | MEDIUM | TODO |

Controle 001-005 op `06fe3b5`: geen `transition: all` en geen `power2.in` meer, de rij- en paneel-intrede gebruiken `transform`, en de hover-regels staan achter `(hover: hover) and (pointer: fine)`.

## Volgorde ronde 2

1. **009** eerst: het enige punt waar een bezoeker echt iets mist (op mobiel opent het detail buiten beeld).
2. **006** daarna. Zowel 006 als 009 raken `components/VacaturesClient.tsx`: na elkaar uitvoeren, niet parallel.
3. **008** en **007** zijn onafhankelijk van de rest en van elkaar. Let op: allebei raken `app/globals.css`, op verschillende plekken. Na elkaar uitvoeren als het in één werkkopie gebeurt.

## Afhankelijkheden

Geen inhoudelijke; alleen de gedeelde bestanden hierboven.

## Afgevoerd (geen plan)

| Bevinding uit ronde 1 | Waarom geen plan |
|---|---|
| Logo-hover als `@keyframes` van 620ms | Vastgelegd in `DESIGN.md` (rij "Logo nav/footer"). Bewuste keuze, niet heropenen. |
| Callout-puntjes in de hero starten op `scale: 0` met `back.out` | Vastgelegd in `DESIGN.md` ("callout-punten ploppen (back.out)"), en het is een scrub, geen UI-intrede. |
| Glow in de hero boven 20px | Opgelost in PR #9 (22px naar 18px). |
| `.jobs__rij` gebruikt een eigen curve `cubic-bezier(0.2, 0, 0, 1)` | Vastgelegd in `DESIGN.md` (rij "Vacaturerij"). |
| Lijst animeren bij filterwijziging | Bewust niet: filteren gebeurt vaak achter elkaar, en beweging bij elke klik vertraagt juist. De nieuwe rijen hebben al een korte, begrensde intrede (plan 002). |
| Sluitanimatie van het vacaturepaneel | Bij sluiten springt ook de grid van twee naar één kolom; een nette exit vraagt om een layout-animatie van de grid. Te veel risico voor een kleine winst. |
