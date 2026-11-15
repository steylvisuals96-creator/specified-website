# Beheer van Specified

De nieuwe back-end van de Specified-website: rechtstreeks op Supabase (database, login, tweestapslogin) en Cloudflare R2 (beelden), zonder Payload. Draait naast de oude CMS in `cms/` tot de overstap; de website kiest met één omgevingsvariabele waar ze uit leest.

Look: de opbouw van de SteylVisuals-studio (matglas, trage gloed, glans onder de muis, glijdend blokje in de zijbalk, tabbalk op de telefoon) in de huisstijl van Specified (grafiet, limoen, Bebas Neue, Instrument Serif Italic, IBM Plex Sans, radius 2px, tekenraster en maatlijnen).

## Wat erin zit

| Onderdeel | Wie | Opmerking |
|---|---|---|
| Overzicht | iedereen | open vacatures, wat nog ontbreekt, artikels, laatste wijzigingen (beheerder) |
| Vacatures | iedereen | alle velden van de vacaturepagina; salaris in een aparte, afgeschermde tabel |
| Blog | iedereen | tekstverwerker (Tiptap), cover uit media of extern, live voorbeeld (op brede schermen) |
| Team | iedereen | met live voorbeeld van de teamsectie |
| Media | iedereen | upload naar R2 (privé), browser verkleint vooraf, echte bestandscontrole op de server |
| Homepage | beheerder | velden links, website rechts; het voorbeeld scrollt naar het veld waarin je typt en zet er een kader om |
| Gebruikers | beheerder | account aanmaken met een uitnodigingslink die je zelf bezorgt; nieuwe inloglink bij een vergeten wachtwoord |
| Logboek | beheerder | wie wijzigde wat, bijgehouden door een trigger in de database |
| Account | iedereen | naam, wachtwoord, tweestapslogin (authenticator-app) |

Niet meegenomen (bewust): het recruitment-CRM uit de oude CMS (kandidaten, bedrijven, sollicitaties, pipeline, agenda, inkomende mail). Die tabellen blijven onaangeroerd in het schema `payload`.

## Beveiliging in lagen

1. `proxy.ts`: zonder (volledige) login naar `/login`; met tweestapslogin eerst de code.
2. Elke pagina en actie controleert zelf de sessie en rol (`lib/sessie.ts`).
3. RLS in de database (`supabase/migrations/`): alles loopt als de ingelogde gebruiker; een account zonder profiel kan niets. De geheime sleutel wordt alleen gebruikt voor gebruikersbeheer, na een rolcontrole.
4. Opgemaakte tekst wordt op de server opnieuw opgebouwd uit een vaste lijst (`lib/richtekst.ts`); de website rendert met dezelfde lijst.
5. Uploads: alleen vanaf het eigen domein, ingelogd, max 4 MB, type uit de eerste bytes (geen SVG).
6. Headers: CSP, HSTS, geen frames (behalve het websitevoorbeeld), `noindex`.

Rollen: `creator` (SteylVisuals, onzichtbaar voor de klant), `beheerder`, `redacteur`. Gebruikers en homepage alleen voor beheerder en creator.

## Database

Schema `public` in het Supabase-project `specified-cms` (ref `htkcrkafetzbnpznektz`). Migraties in `supabase/migrations/`, op 2026-11-15 toegepast:

- `20261115_01_beheer_schema.sql`: tabellen, RLS, logboek-trigger.
- `20261115_02_inhoud_uit_payload.sql`: inhoud gekopieerd uit `payload` (5 vacatures, 3 artikels, homepage-teksten). Lexical omgezet naar Tiptap.
- `20261115_03_rolfuncties_naar_privaat.sql`: hulpfuncties uit de publieke API.

Getest met rolscenario's in SQL: anoniem, account zonder profiel, redacteur, beheerder, creator (13 van 13 zoals bedoeld).

## Lokaal draaien

```bash
cd beheer
cp .env.example .env.local   # en invullen
npm install
npm run gebruiker:maken      # eerste account (vraagt naam, e-mail, rol, wachtwoord)
npm run dev                  # http://localhost:3004
```

Voor het live voorbeeld draait de website ernaast (`NEXT_PUBLIC_WEBSITE_URL`), met in haar `.env.local` `NEXT_PUBLIC_BEHEER_URL=http://localhost:3004`.

## Overstap (nog te doen)

1. Vercel-project `specified-beheer` aanmaken op deze repo, root directory `beheer`, omgevingsvariabelen uit `.env.example`.
2. In Supabase: Authentication > Sign In / Providers > nieuwe registraties uitzetten (accounts komen alleen via het beheer of het script).
3. Accounts aanmaken (Sam als creator via het script; Simon en collega via Gebruikers).
4. Website (Vercel): `NEXT_PUBLIC_DATABRON=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BEHEER_URL`, `VERVERS_GEHEIM`. Terug naar de oude CMS: `NEXT_PUBLIC_DATABRON` weghalen.
5. Na een paar weken zonder problemen: `cms/` en het schema `payload` opruimen.
