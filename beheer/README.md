# Beheer van Specified

De nieuwe back-end van de Specified-website: rechtstreeks op Supabase (database, login, tweestapslogin) en Cloudflare R2 (beelden), zonder Payload. Draait naast de oude CMS in `cms/` tot de overstap; de website kiest met één omgevingsvariabele waar ze uit leest.

Look: de opbouw van de SteylVisuals-studio (matglas, trage gloed, glans onder de muis, glijdend blokje in de zijbalk, tabbalk op de telefoon) in de huisstijl van Specified (grafiet, limoen, Bebas Neue, Instrument Serif Italic, IBM Plex Sans, radius 2px, tekenraster en maatlijnen).

## Wat erin zit

| Onderdeel | Wie | Opmerking |
|---|---|---|
| Overzicht | iedereen | open vacatures, wat nog ontbreekt, artikels, laatste wijzigingen (beheerder) |
| Vacatures | iedereen | alle velden van de vacaturepagina; salaris in een aparte, afgeschermde tabel |
| SEO-bot | beheerder | Search Console, vakbronnen, metadata en AI-blogconcepten |
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
3. RLS in de database (`supabase/migrations/`): alles loopt als de ingelogde gebruiker; een account zonder profiel kan niets. De geheime sleutel wordt gebruikt voor gebruikersbeheer en de SEO-bot, na controle van de beheerrol of het cron-geheim.
4. Opgemaakte tekst wordt op de server opnieuw opgebouwd uit een vaste lijst (`lib/richtekst.ts`); de website rendert met dezelfde lijst.
5. Uploads: alleen vanaf het eigen domein, ingelogd, max 4 MB, type uit de eerste bytes (geen SVG).
6. Headers: CSP, HSTS, geen frames (behalve het websitevoorbeeld), `noindex`.

Rollen: `creator` (SteylVisuals, onzichtbaar voor de klant), `beheerder`, `redacteur`. Gebruikers, homepage en seizoensthema alleen voor beheerder en creator.

## Database

Schema `public` in het Supabase-project `specified-cms` (ref `htkcrkafetzbnpznektz`). Migraties in `supabase/migrations/`, op 2026-11-15 toegepast:

- `20261115_01_beheer_schema.sql`: tabellen, RLS, logboek-trigger.
- `20261115_02_inhoud_uit_payload.sql`: inhoud gekopieerd uit `payload` (5 vacatures, 3 artikels, homepage-teksten). Lexical omgezet naar Tiptap.
- `20261115_03_rolfuncties_naar_privaat.sql`: hulpfuncties uit de publieke API.
- `20261115_04_paginateksten.sql`: teksten voor de doorklikpagina’s.
- `20261115_05_seizoensthema.sql`: één publieke thema-instelling; wijzigingen alleen voor beheerders, met logboek.

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

1. ~~Vercel-project `specified-beheer`~~: aangemaakt op 2026-11-15 (root directory `beheer`, functies in `fra1`, variabelen gezet). Live op `https://specified-beheer.vercel.app`.
2. In Supabase: Authentication > Sign In / Providers > nieuwe registraties uitzetten (accounts komen alleen via het beheer of het script).
3. Accounts aanmaken (Sam als creator via het script; Simon en collega via Gebruikers).
4. Website (Vercel): `NEXT_PUBLIC_DATABRON=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BEHEER_URL`, `VERVERS_GEHEIM`. Terug naar de oude CMS: `NEXT_PUBLIC_DATABRON` weghalen.
5. Na een paar weken zonder problemen: `cms/` en het schema `payload` opruimen.


## SEO-bot in gebruik nemen

De bot verwerkt één ronde per week op maandag om 07.00 UTC (08.00 in de winter en 09.00 in de zomer in België). Resultaten staan in **Beheer > SEO-bot**. De bot leest 28 dagen afgewerkte Belgische zoekdata, zoekt per ronde maximaal vier keer via Apify bij vakorganisaties, en laat OpenAI maximaal drie metadatawijzigingen en één blogconcept uitwerken. Een blogconcept heeft bronnen van minstens twee organisaties. Beheerders kunnen voorstellen vergelijken, toepassen en verwerpen. Automatische metadata volgt dezelfde checks en wacht vier weken na de vorige aanpassing aan een pagina. Blogconcepten worden gepubliceerd vanuit de gewone blogeditor.

1. Voer `supabase/migrations/20261115_06_seo_bot.sql` uit in de SQL Editor van het bestaande Supabase-project.
2. Activeer de Search Console API in een Google Cloud-project. Maak een serviceaccount en geef het leestoegang tot de juiste property in Search Console. Zet in het Vercel-project **specified-beheer** de waarden `SEO_GSC_CLIENT_EMAIL`, `SEO_GSC_PRIVATE_KEY` en `SEO_GSC_PROPERTY` (bijvoorbeeld `sc-domain:specified.be`). Zet `SEO_SITE_URL` op de canonieke origin van de nieuwe publieke site na livegang (bijvoorbeeld `https://specified.be`). Alleen URL's op die origin worden meegenomen voor metadata.
3. Zet in dezelfde Vercel-omgeving `SEO_APIFY_TOKEN`, `SEO_OPENAI_API_KEY` en `CRON_SECRET` (genereer met `openssl rand -hex 32`). Stel de sleutels in als Sensitive. Gebruik aparte providerprojecten of tokens voor Specified. De website leest de toegepaste metadata via haar bestaande Supabase-configuratie.
4. Na akkoord op verbruik, zet `SEO_BOT_ENABLED=1` in **Production** en doe een herdeploy. Zet `SEO_BOT_IMAGES=1` voor maximaal één AI-cover per concept via R2. Zet `SEO_BOT_AUTO_METADATA=1` om geldige metadatavoorstellen meteen toe te passen. Beide opties starten uit. Zet `SEO_BOT_ENABLED=0` en herdeploy om nieuwe rondes te pauzeren.
5. Controleer de eerste ronde in het beheerscherm. De geplande Vercel-route gebruikt `CRON_SECRET` en kan desgewenst één keer zelf opgeroepen worden met een GET en een Authorization Bearer-header. Een tweede oproep in dezelfde UTC-week start geen nieuwe ronde. Kijk bij een mislukte ronde eerst naar het rapport en de functielogs.

Verbruik per ronde: Apify is technisch begrensd op $0,05 en vier resultatenpagina's. OpenAI krijgt maximaal één tekstaanvraag met 4.600 uitvoertokens (ongeveer $0,03 voor tekst bij de gebruikte hoeveelheden) en optioneel één medium cover van 1536 × 1024 (ongeveer $0,041 plus prompttokens). Zie [Apify-tarieven](https://apify.com/apify/google-search-scraper), [OpenAI-teksttarieven](https://developers.openai.com/api/docs/models/gpt-6.1-terra) en [OpenAI-beeldtarieven](https://developers.openai.com/api/docs/guides/image-generation#earlier-gpt-image-models).
