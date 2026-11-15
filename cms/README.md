# Specified CMS

Interne recruitmentomgeving van Specified: vacatures, kandidaten, bedrijven,
sollicitaties en het blog. Levert tegelijk de publieke content aan
[specified-website](https://github.com/steylvisuals96-creator/specified-website)
via de REST API.

Gebouwd op Payload CMS 3 (Next.js 16, MongoDB, Cloudflare R2).

## Lokaal draaien

```bash
npm install
```

Kopieer daarna `.env.example` naar `.env.local` en vul de waarden in. Zonder
`MONGODB_URI` en `PAYLOAD_SECRET` start de app bewust niet op.

```bash
npm run dev
```

De omgeving draait op http://localhost:3000.

## Twee interfaces

| Pad | Wat | Wie |
| --- | --- | --- |
| `/dashboard` | De eigen interface. Dit is wat het team gebruikt. | Elke ingelogde gebruiker |
| `/admin` | De standaard Payload-admin. Achterdeur voor structurele ingrepen. | Alleen rol `beheerder` |

`/admin`-links worden waar mogelijk doorgestuurd naar het overeenkomstige
dashboardscherm (zie `next.config.ts`). De rolcontrole zit in `middleware.ts`.

Rollen staan in `collections/Gebruikers.ts`: `beheerder` en `consultant`.

## Toegangsregels

Alle toegangscontrole loopt via de helpers in `lib/access.ts`. Het uitgangspunt
is dat niets publiek is tenzij de website het nodig heeft:

| Collectie | Publiek leesbaar |
| --- | --- |
| `vacatures` | Alleen `status: actief` én `zichtbaar_op_website` |
| `blog` | Alleen `status: gepubliceerd` |
| `team` | Alleen `actief` |
| `media` | Ja — blogafbeeldingen, teamfoto's, logo's |
| `kandidaten`, `bedrijven`, `sollicitaties`, `activiteiten`, `documenten`, `gebruikers` | Nee |

Twee dingen om te onthouden bij wijzigingen:

1. **De Local API negeert deze regels standaard.** Schrijf je een eigen route
   met `payload.find` of `payload.findByID`, geef dan expliciet
   `overrideAccess: false` mee plus de `user` — anders lekt de route data die de
   collectie zelf afschermt.
2. **Cv's en kandidaatfoto's horen in `documenten`, niet in `media`.** Die
   collectie staat achter een login en levert R2-links die na vijf minuten
   verlopen.

## API-routes

| Route | Beveiliging |
| --- | --- |
| `/api/[...slug]` | Payload REST API — volgt de toegangsregels hierboven |
| `/api/agenda/ics/[id]` | Sessie vereist |
| `/api/upload-media` | Sessie vereist |
| `/api/inbound-email` | `EMAIL_WEBHOOK_SECRET` in header `x-webhook-secret` |
| `/api/make-callback` | `MAKE_SECRET` in header `x-make-secret`, plus allowlist van collecties |
| `/api/health-check` | Publiek — meldt alleen of de website bereikbaar is |

Ontbreekt een secret in de omgeving, dan weigert de route alles. Dat is opzet:
liever stuk dan stil open.

## Deploy

Draait op Vercel, automatisch bij een push naar `main`. Alle variabelen uit
`.env.example` moeten in Vercel staan voor Production, Preview én Development.
