# DESIGN.md — Specified (richting: Signatuurmerk)

Meetlat voor de redesign en voor `impeccable`. Referentiebeelden: `design/referentie/1-hero … 5-contact.jpg`
(goedgekeurd 2026-09-25). Waar dit document en de beelden verschillen, wint dit document.

## Idee in één zin

Twee founders als merk: een donker dossier over mensen die ingenieurs begrijpen. Techniek spreekt in
condensed kapitalen, de mensen spreken in cursieve serif, en één handtekening bewijst dat er echte
mensen achter zitten.

## Kleur

| Token | Hex | Rol |
| --- | --- | --- |
| `--ink-900` | `#14140E` | Canvas (olijf-zwart). Nooit puur zwart. |
| `--ink-800` | `#1D1E16` | Verhoogde vlakken: infokaarten, mobiel menu |
| `--olive-600` | `#3A3F2A` | Lijnen met nadruk, hover-rand, scrollbar |
| `--bone-100` | `#E9E7DD` | Hoofdtekst en koppen |
| `--bone-400` | `#A6A496` | Secundaire tekst, metadata (contrast ≥ 4.5:1 op canvas) |
| `--lime-300` | `#DFFD7B` | Merkaccent Specified (behouden). Knoppen, handtekening, merkwoord, focus |
| `--line` | `rgba(233,231,221,0.14)` | Haarlijnen tussen rijen en rond kaarten |

Regels:
- Limoen is schaars: per scherm maximaal één limoen vlak (knop óf hover-balk óf merkwoord) plus de handtekening.
- Tekst op limoen is altijd `--ink-900`, nooit wit.
- Geen gradients, geen gekleurde schaduwen, geen glow behalve de handtekening-streek.

## Typografie

| Rol | Font | Gebruik |
| --- | --- | --- |
| Display (merk) | **Bebas Neue** (behouden, `next/font/google`) | Koppen, hero, disciplines, contactkop. Altijd kapitalen. |
| Mens-accent | **Instrument Serif Italic** (`next/font/google`) | Alleen woorden over mensen of beslissingen: *possibilities*, *stap*, *missie*, *kennismaken*, en disciplines in de marquee om en om. |
| Tekst & UI | **Instrument Sans** (`next/font/google`, variabel) | Lopende tekst, navigatie, knoppen, metadata, cijfers (`font-variant-numeric: tabular-nums`). Vervangt Avenir, dat niet als webfont geladen werd. |

Geen monospace-font: technische infokaartjes gebruiken Instrument Sans met tabulaire cijfers.

Schaal (basis 17px, verhouding 1.333 op tekst; display vrij geschaald op viewport):

| Stap | Grootte | Font / gewicht | Regelhoogte |
| --- | --- | --- | --- |
| `display-xl` | `clamp(4.5rem, 15vw, 15rem)` | Bebas 400 | 0.86 |
| `display-l` | `clamp(3.25rem, 9vw, 8.5rem)` | Bebas 400 | 0.9 |
| `display-m` | `clamp(2.5rem, 5vw, 4.5rem)` | Bebas 400 | 0.95 |
| `serif-accent` | zelfde grootte als de kop waarin het staat, optisch +4% | Instrument Serif Italic 400 | inherit |
| `title` | 1.75rem | Instrument Sans 600 | 1.15 |
| `body-l` | 1.1875rem | Instrument Sans 400 | 1.55 |
| `body` | 1.0625rem (17px) | Instrument Sans 400 | 1.6 |
| `meta` | 0.875rem | Instrument Sans 500, tabular-nums | 1.4 |

Regels:
- Geen fontWeight 300 of lager. Minimum 400.
- Geen tracked-out kapitalen-labels boven koppen. Kapitalen alleen in Bebas-koppen.
- Lopende tekst 60–70 tekens per regel (`max-width: 66ch`).
- Display-koppen gaan bewust boven de gebruikelijke 6rem: de richting vraagt reusachtige typografie.
  Tracking nooit strakker dan `-0.02em` (Bebas is al condensed); koppen met `text-wrap: balance`.
  Test elke kop met de echte CMS-tekst op 375px, 768px en 1440px; niets mag overlopen.
- Een kop mixt maximaal één serif-woord, en alleen als dat woord over mensen gaat.

## Layout & spacing

- 12-koloms raster, max-breedte 1440px, marge `clamp(20px, 4vw, 64px)`, gutter 24px.
- 8px-basis. Sectie-ruimte verticaal `clamp(96px, 14vw, 200px)`.
- Links uitgelijnd. Alleen de contactafsluiter staat gecentreerd.
- Display-koppen mogen tot de rand van het scherm lopen (bleed); tekstblokken blijven in het raster.

```
HERO (100svh, typografisch, geen foto's)
┌──────────────────────────────────────────────┐
│ SPECIFIED      Diensten Jobs Blog Over ons  [Neem contact op] │
│                              intro-tekst + 2 knoppen (rechts) │
│                                                               │
│ WE ENGINEER                                                   │
│ POSSIBILITIES.  ~~~handtekening door de onderste regel~~~     │
└──────────────────────────────────────────────┘
DISCIPLINES (scroll-scrub, rijen schuiven om en om links/rechts)
VOOR KANDIDATEN | VOOR BEDRIJVEN (2 kolommen, tekst + knop)
VACATURES (rijen met haarlijn, hover = limoen balk)
FOUNDERS (2 portretten + handtekening naast gezicht + infokaart)
CONTACT (gecentreerd, e-mail groot, 1 knop) + FOOTER
```

## Componenten

**Knoppen** — radius 0. Hoogte 52px, padding `0 28px`, Instrument Sans 600 16px, zinshoofdletter.
- Primair: limoen vlak, `--ink-900` tekst. Hover: vlak wordt `--bone-100`.
- Secundair: 1.5px rand `--bone-100`, transparant. Hover: rand en tekst limoen.
- Nooit pijltjes (→ ↗) in knoppen of links. Linktekst zegt wat er gebeurt ("Bekijk alle vacatures").

**Infokaart** — 1px rand `--line`, achtergrond `--ink-800`, padding 16–20px, radius 0. Inhoud: één waarde
(`title`, tabulaire cijfers) + één regel `meta`. Alleen echte gegevens uit de CMS; geen verzonnen cijfers.

**Vacaturerij** — haarlijn boven/onder, hoogte ≥ 88px. Kolommen: titel (`title`), regio, discipline,
niveau, contract (`meta`, `--bone-400`). Links in de rij het aantal dagen online in Bebas limoen
("3d", "12d") in plaats van 01/02/03: vacatures zijn geen volgorde, versheid is wel informatie.
Hover/focus: limoen balk over de volle breedte, tekst `--ink-900`. De hele rij is één link.

**Sfeerbeelden** — AI-gegenereerd (Higgsfield), nooit mensen die als kandidaat of team kunnen
doorgaan: engineering-materie (turbine, installatie, werf van op de rug). Donker, olijf-gegrade, één
limoen lichtaccent. Hero: scroll-gestuurde turbine (Kling 3.0-lus als framereeks `videos/turbine-frames/{desktop,mobiel}/*.webp`, 95/76 frames op 1912/1200 px, 4,7/1,9 MB) met poster `images/beeld/hero-turbine-poster.jpg`; diensten: `kandidaten-engineer.jpg`,
`bedrijven-installatie.jpg`.

**Handtekening** — SVG-pad in `--lime-300`, 3px streek, ronde uiteinden. Staat naast of onder een
portret, nooit over een gezicht. Doel: echte handtekeningen van Tom en Simon (op papier, gevectoriseerd);
tot dan een placeholder-pad.

**Portretten** — alleen in de founders-sectie, niet in de hero (keuze Sam 2026-09-25: geen cut-outs).
De originele foto's als rechthoekige portretten (3:4), donkere grade: verzadiging 0.75, helderheid −8%,
contrast +8%, plus een verloop van `--ink-900` onderaan zodat de infokaart erin overloopt.
Geen AI-hertekende gezichten, geen uitgeknipte foto's.

**Focus** — 2px outline `--lime-300`, offset 3px, op alles wat focusbaar is.

**Browser-oppervlakken** — ook in het palet:
- Tekstselectie: achtergrond `--lime-300`, tekst `--ink-900`.
- Caret in formuliervelden: `caret-color: var(--lime-300)`.
- Scrollbar: duim `--olive-600`, spoor `--ink-900`, 10px (`scrollbar-color` + webkit-fallback).
- Links in lopende tekst: onderlijn 1px, `text-underline-offset: 0.2em`, hover limoen.
- Cijfers in tabellen, vacaturerijen en infokaarten: `tabular-nums`.

**Staten** (alle inhoud komt uit de CMS, dus elk blok heeft ze):
- Geen vacatures: één zin + knop "Stuur een open sollicitatie" (mailto), geen lege lijst.
- CMS onbereikbaar: sectie valt terug op de laatst gebouwde versie (ISR); nooit een foutmelding
  aan de bezoeker, wel een log.
- Ontbrekende teamfoto: portret wordt een ink-800 vlak met de naam in Bebas, geen kapot beeld.
- Knoppen: hover, focus, active (1px omlaag), disabled (40% dekking, geen cursor-pointer).

## Motion

Eén laadmoment, een doorlopende rotator in de hero, en per sectie één eigen scroll-moment (keuze Sam 2026-09-26: de site moet voelbaar scrollen). Elk moment heeft een ander karakter; nooit dezelfde fade op elke sectie.

Basisregel: alles is zichtbaar in de HTML zonder JavaScript. Animatie verfraait een pagina die al af is;
de beginstaat wordt pas door JS gezet vlak voor het afspelen (geen verborgen content bij trage JS).
Easing standaard exponentieel uit (`cubic-bezier(0.22,1,0.36,1)`); naast transform/opacity mogen ook
`clip-path` en `mask` (voor het onthullen van de kopregels).

| Moment | Wat | Timing |
| --- | --- | --- |
| Hero-laadsequentie (één keer) | Kopregels schuiven van onder hun eigen masker in (per regel, 80ms stagger), daarna tekent de handtekening zichzelf (`stroke-dashoffset`) | kop 700ms `cubic-bezier(0.22,1,0.36,1)`; handtekening 1200ms `ease-in-out`, start na 400ms |
| Hero-rotator | Woord wisselt elke 2,6 s (engineer, shape, unlock, build, define of CMS `hero_woorden`), schuift van onder in | 620ms |
| Handtekening (scroll) | Schrijft zich met de scroll tijdens de gepinde hero (0–800 px op desktop), wist bij terugscrollen; zonder JS/reduced motion volledig zichtbaar | scrub |
| Hero (scroll, gepind) | Hero pint 130% schermhoogte; de scroll speelt de turbine-frames af (vooruit/terug); intro vervaagt, beeld zoomt tot 110%, kop schuift op het einde weg | scrub 0,4 |
| Diensten (scroll) | Beeld opent als een sluiter (`clip-path` inset → 0) en zoomt uit | scrub |
| Vacatures (scroll, eenmalig) | Eén limoen veeg golft over de rijen | 0,35 s in + 0,4 s uit, 90ms stagger |
| Founders (scroll) | Foto schuift trager dan de pagina (diepte) | scrub |
| Contact (scroll) | Kop groeit van 82% naar volle maat; onderlijn onder het e-mailadres trekt zich | scrub |
| Disciplines (scroll-scrub) | Rijen bewegen horizontaal met de scroll, om en om links/rechts, GSAP ScrollTrigger `scrub: 0.6` | gekoppeld aan scroll, geen eigen duur |
| Vacaturerij (gebruiker) | Limoen balk schuift van links in | 220ms `cubic-bezier(0.2,0,0,1)` |
| Knoppen (gebruiker) | Kleurwissel | 160ms ease-out |

Verboden: fade-in-up op elke sectie, parallax op tekstblokken, custom cursor (de huidige `CursorGlow`
verdwijnt), animaties die blijven lopen zonder reden. Uitzondering: de SPECIFIED-marquee in de footer
beweegt traag (60s per cyclus) en stopt bij hover.

`prefers-reduced-motion: reduce`: geen laadsequentie (alles direct zichtbaar, handtekening volledig
getekend), disciplines statisch als lijst, marquee stil.

## Toegankelijkheid

- Contrast tekst ≥ 4.5:1, grote koppen ≥ 3:1. `--bone-400` alleen voor tekst vanaf 14px.
- Decoratieve display-tekst die dubbel is met echte content krijgt `aria-hidden`.
- Alle cijfers en teksten staan in de HTML vóór JavaScript (geen "0+" die pas later telt).

## Huisregels (niet onderhandelbaar)

Geen stip-labels, geen pill-knoppen, geen →/↗-pijltjes, geen fontWeight 300, geen identieke
fade-animaties, geen middle-dot-reeksen als opmaak (`A · B · C`) in de UI.
