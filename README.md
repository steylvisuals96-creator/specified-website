# Specified — website

Publieke site van Specified, een recruitmentkantoor voor engineeringprofielen.
Next.js 16 met Tailwind v4 en framer-motion.

Alle inhoud — vacatures, blog, team, instellingen — komt uit
[specified-cms](https://github.com/steylvisuals96-creator/specified-cms) via de
REST API. Deze repo bevat geen content.

## Lokaal draaien

```bash
npm install && npm run dev
```

Draait op http://localhost:3000 en praat standaard tegen de productie-CMS. Wil
je een andere CMS gebruiken, kopieer dan `.env.example` naar `.env.local` en zet
`NEXT_PUBLIC_CMS_URL`.

## Hoe de content binnenkomt

| Bron | Waar |
| --- | --- |
| Vacatures | `app/page.tsx` (5 recentste), `app/vacatures/page.tsx` (alle) |
| Blog | `lib/blog.ts` |
| Team, instellingen, stats | `lib/settings.ts` |

Pagina's draaien op `revalidate = 60`: een wijziging in de CMS staat binnen een
minuut op de site, zonder redeploy.

De CMS geeft alleen actieve en zichtbaar-gemarkeerde vacatures terug. De filters
in de fetch-URL's zijn dus een tweede net, geen enige beveiliging.

## Cookies en analytics

Vercel Analytics en Speed Insights laden **pas na toestemming**. De keten:

- `lib/consent.ts` — leest en schrijft de keuze, en meldt wijzigingen
- `components/CookieBanner.tsx` — vraagt de keuze
- `components/AnalyticsGate.tsx` — mount de scripts alleen bij "accepted"
- `components/CookieVoorkeurenLink.tsx` — in de footer, maakt de keuze herroepbaar

Voeg je een script toe dat gegevens verzamelt, hang het dan achter dezelfde
gate. Anders klopt de privacyverklaring niet meer.

## Security headers

`next.config.ts` zet CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy` en `Permissions-Policy` op alle routes. De CSP heeft nog
`'unsafe-inline'` voor scripts nodig, omdat Next.js en Vercel Analytics inline
scripts injecteren; dat kan pas weg met nonces per request.

Voeg je een externe dienst toe (fonts, embeds, tracking), dan moet de bijhorende
host expliciet in de CSP. Zonder dat blokkeert de browser hem stil.

## Deploy

Vercel, automatisch bij een push naar `main`.
