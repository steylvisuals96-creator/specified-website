# 001 — Vervang `transition: all` door expliciete eigenschappen (vacatures)

- **Status**: DONE
- **Commit**: a3980d2
- **Severity**: HIGH
- **Category**: Performance / easing & duration
- **Estimated scope**: 1 bestand (`components/VacaturesClient.tsx`), 3 regels

## Problem

`transition: all` animeert ook eigenschappen die niet bedoeld zijn (layout, padding, border-width) en valt terug op de standaard `ease`. Op de filterknoppen en de vacaturerijen gebeurt dat bij elke klik.

```tsx
/* components/VacaturesClient.tsx:68 — filterknop, huidig */
cursor: "pointer", transition: "all 0.2s", border: "1px solid",
```
```tsx
/* components/VacaturesClient.tsx:173 — vacaturerij, einde van de style-prop, huidig */
borderLeft: selected === job.id ? "2px solid var(--lime)" : "2px solid transparent", transition: "all 0.2s" }}
```
```tsx
/* components/VacaturesClient.tsx:185 — "Bekijk/Sluiten"-label, huidig */
fontSize: "1rem", transition: "color 0.2s" }}
```

## Target

Alleen de eigenschappen die echt veranderen, 160ms, `ease-out` (de rest van de site gebruikt 160ms ease-out voor kleurwissels, zie `app/globals.css:127`).

```tsx
/* regel 68 — target */
transition: "background-color 160ms ease-out, color 160ms ease-out, border-color 160ms ease-out",
/* regel 173 — target */
transition: "background-color 160ms ease-out, border-left-color 160ms ease-out",
/* regel 185 — target */
transition: "color 160ms ease-out"
```

## Repo conventions to follow

- Kleurtransities zijn 160ms `ease-out`: `app/globals.css:127` (`.btn`).
- Dit bestand gebruikt inline `style`-props; houd dat zo, voeg geen CSS-bestand toe.

## Steps

1. In `components/VacaturesClient.tsx` regel 68: vervang `transition: "all 0.2s"` door de waarde uit Target.
2. Regel 173: vervang `transition: "all 0.2s"` door de waarde uit Target. `borderLeft` wisselt tussen `2px solid var(--lime)` en `2px solid transparent`; alleen de kleur verandert, dus `border-left-color` volstaat.
3. Regel 185: vervang `transition: "color 0.2s"` door `transition: "color 160ms ease-out"`.
4. Controleer met `grep -n "transition" components/VacaturesClient.tsx` dat er geen `all` meer in staat.

## Boundaries

- Raak de `motion.*`-props (`initial/animate/transition`) niet aan; dat zijn plan 002 en 003.
- Geen markup- of kleurwijzigingen.
- Geen nieuwe dependencies.
- Wijkt de code af van de excerpts (drift sinds commit a3980d2): STOP en rapporteer.

## Verification

- **Mechanical**: `npx tsc --noEmit` en `npm run lint` zonder nieuwe fouten.
- **Feel check**: open `/vacatures`.
  - Klik filterknoppen snel achter elkaar; kleur wisselt vlot, niets "zwemt" of verspringt in maat.
  - Selecteer en deselecteer een rij; alleen achtergrond en linkerrand-kleur faden.
  - DevTools > Animations op 10%: alleen de genoemde properties animeren.
- **Done when**: geen `transition: "all` meer in `VacaturesClient.tsx`.
