# Draaiboek Specified-website

Dit is de ene plek waar staat wat de website van Specified is, hoe die in elkaar zit en wat er nog open staat. Het gaat over twee repositories die samen één product vormen: de website en de CMS.

**Bijhouden:** de delen 1 tot en met 8 schrijft Claude bij zodra iets verandert (regel staat in `CLAUDE.md`). Deel 9 (wijzigingslog) wordt automatisch uit git gebouwd bij elke commit, via `scripts/draaiboek-bijwerken.sh`. Buiten de markeringen in deel 9 niets met de hand wijzigen in dat deel.

Laatst handmatig nagekeken: 2026-11-12.

De ingevulde invullijst van de klant (2026-11-12) staat uitgewerkt in `BRIEFING.md`: wensen per pagina en functie, tegenstrijdigheden en gevolgen voor wat er nu staat.

---

## 1. Overzicht

| | Website | CMS |
|---|---|---|
| Repo | `steylvisuals96-creator/specified-website` | `steylvisuals96-creator/specified-cms` |
| Map lokaal | `~/specified-website` | `~/specified-cms` |
| Live | `specified-website.vercel.app` | `specified-cms.vercel.app` |
| Stack | Next.js 16.3.6, React 19, Tailwind 4, GSAP, Lenis, Framer Motion | Next.js 16.3.6, Payload 3.90.2, Tailwind 4, shadcn, Tiptap |
| Data | haalt alles uit de CMS (revalidate 60 s) | Supabase Postgres, schema `payload` |
| Media | beelden in `public/` | Cloudflare R2 (privé, ondertekende links) |
| Hosting | Vercel, deploy bij push naar `main` | Vercel, deploy bij push naar `main` |

Klant: **Specified NV** (BE 0727.537.711), Veldkant 31a, 2550 Kontich. Engineering consultancy met eigen consultants, opgericht januari 2025, 13 mensen op de payroll en 32 in totaal. Oprichters Tom Wijdooghe en Simon Claeys; aanspreekpunt voor het project, facturen en storingen is Simon Claeys (Managing Partner). Algemeen adres op de site: `info@specified.be`. Gebouwd en gehost door SteylVisuals (Sam). De bestaande site op `specified.be` (gebouwd door Rocketship) draait nog; de nieuwe staat op de Vercel-adressen tot de livegang, gewenst op **2027-01-11**. Teksten van de klant zijn klaar op 2026-12-21.

Werkafspraak: rechtstreeks naar `main` pushen, geen feature-branches en PR's (zie `CLAUDE.md`).

---

## 2. Ontwerp

Richting **Signatuurmerk**. Alles staat in `DESIGN.md`; hier de kern.

- Palet: donker `#1E1E21` en `#323236`, limoen `#DFFD7B` als accent. Tokens in `app/globals.css`.
- Lettertypen: Bebas Neue voor koppen, Instrument Serif Italic als accent en IBM Plex Sans voor tekst en UI (via `next/font`, sinds 2026-10-29; ook in de CMS).
- Radius 0 op de site, 2px in de back-office. Geen pill-knoppen, geen pijltjes, geen kapitalen-labels, geen middenpunten of streepjes in teksten (komma of koppelteken).
- **Licht thema** (2026-11-12): de bezoeker kiest via de knop in de navigatie (`components/ThemaKnop.tsx`, `lib/thema.ts`), donker blijft de standaard. Dezelfde tokens, omgekeerd, onder `:root[data-thema="licht"]` in `globals.css`. Limoen als vlak is `--lime-vlak` met tekst `--on-lime`; `--lime-300` is het accent als tekst en lijn en wordt in licht een donker olijfgroen.
- Motion is stil en bewust. Geen constante beweging in de hero (dat is teruggedraaid, de variant leeft op de branch `preview/hero-ambient`).
- `prefers-reduced-motion` en geen-JS tonen een stilstaande hero met het logo als eindbeeld.

---

## 3. Website

### Pagina's

| Route | Inhoud |
|---|---|
| `/` | Hero als technische tekening, disciplines, diensten, vacatures, team, contact |
| `/vacatures` | Lijst met één filter op vakgebied; elke rij linkt naar de vacaturepagina. Ingevulde vacatures staan onderaan, gemarkeerd |
| `/vacatures/[slug]` | Pagina per vacature: tekst, kenmerken (vakgebied, locatie, uren, ervaring, opleiding, talen, plaatsingsdatum, geen salaris), sollicitatieformulier en JobPosting voor Google. Ingevuld: geen formulier, `noindex` |
| `/voor-bedrijven`, `/voor-engineers` | Diensten, profielen, sectoren, werkwijze, cijfers en attesten; aanvraagformulier voor een consultant |
| `/open-sollicitatie`, `/contact`, `/faq` | Formulieren en veelgestelde vragen (met FAQPage-gegevens) |
| `/blog`, `/blog/[slug]` | Artikelen uit de CMS |
| `/privacy`, `/cookies`, `/disclaimer`, `/toegankelijkheid`, `/algemene-voorwaarden` | Juridische pagina's (`components/LegalPage.tsx`). Algemene voorwaarden is een plaatshouder met `noindex` tot Specified de tekst levert |
| `/api/formulier` | Ontvangt de vier formulieren en mailt ze via Resend (zie Formulieren) |
| `/api/health` | Gezondheidscheck: site draait en bereikt de CMS (503 bij fout) |
| `sitemap`, `robots`, `opengraph-image` | SEO; JSON-LD op home met `legalName`, `vatID`, volledig adres en oprichtingsdatum |

Misschien later (invullijst): Over ons, Cases zonder klantnamen, Team, Evenementen.

### Formulieren (2026-11-12)

Vier formulieren uit één beschrijving (`lib/formulieren.ts`): sollicitatie bij een vacature, open sollicitatie, contact en aanvraag consultant. `components/Formulier.tsx` tekent ze, `app/api/formulier/route.ts` controleert opnieuw en mailt via Resend: een melding naar Specified (cv als bijlage, antwoorden gaat naar de bezoeker) en een bevestiging naar de bezoeker. Er wordt niets opgeslagen. Beveiliging: alleen eigen origin, verborgen valkuilveld, minimale invultijd, 5 per 10 minuten per IP (per server), cv alleen pdf of Word tot 4 MB.

Nodig in Vercel (website): `RESEND_API_KEY`, `FORMULIER_AAN` (ontvanger, later `Simon.claeys@specified.be`), `FORMULIER_VAN` (afzender op een in Resend geverifieerd domein). **Zonder geverifieerd domein bezorgt Resend alleen bij de eigenaar van het account**: de melding naar Simon en de bevestiging naar bezoekers werken dus pas na verificatie van `specified.be` in Resend (DNS-records). Zonder sleutels geeft het formulier in productie een nette foutmelding met het e-mailadres.

Alle teksten op de nieuwe pagina's zijn voorlopig (bron: invullijst, `lib/inhoud.ts`). Zelf geschreven en door Specified na te kijken: de drie stappen op Voor bedrijven, de FAQ-antwoorden, de omschrijvingen bij diensten en waarden, disclaimer en toegankelijkheidsverklaring.

### De hero (technische tekening)

SPECIFIED getekend als blad met titelblok. Elke letter heeft een callout (acrostichon: Studies, Projecten, Elektromechanica, Consultants, Industrie, Focus, Integratie, Extra mile, Drive). De tekening wordt natekend, callouts poppen op (`back.out`, bewust), en de hele hero is gekoppeld aan scroll. Op mobiel draait SPECIFIED op het einde naar horizontaal. Component: `components/HeroTekening.tsx`. Teksten: `lib/inhoud.ts` (`TEKENING_CALLOUTS`, `TEKENING`).

### Bouwstenen

`Nav` (met `ThemaKnop`), `Pagina` (raamwerk met `Blok`, `Lijst`, `Stappen`, `Kenmerken`), `Formulier`, `HeroTekening`, `Disciplines` (scroll-scrub), `ScrollMomenten`, `Split`, `Jobs`, `VacaturesClient`, `Team`, `CTA`, `Footer`, `Logo` (hover als keyframes, vastgelegd), `Vizier` (CAD-muiswijzer, alleen desktop), `VloeiendScrollen` (Lenis, alleen desktop), `HashScroll`, `CookieBanner` en `AnalyticsGate`.

### Inhoud: waar komt tekst vandaan

| Wat | Bron |
|---|---|
| Hero-tekening, callouts, titelblok, diensten | `lib/inhoud.ts`, en per veld te overschrijven vanuit de CMS (live editor, deel 4) |
| Vacatures | CMS via REST, één plek: `lib/vacatures.ts` (labels, lijst, één vacature op slug). Is de CMS onbereikbaar, dan blijft de laatst gebouwde pagina staan |
| Teksten van de nieuwe pagina's (diensten, profielen, sectoren, waarden, cijfers, attesten, stappen) | `lib/inhoud.ts`, nog niet in de CMS |
| Blog, team, instellingen | CMS via REST (`lib/settings.ts`, `lib/blog.ts`) |
| Contact-e-mail, telefoon, LinkedIn, footertekst | Homepage-editor (global `website`, groep `contact`); leeg valt terug op `Instellingen` (`getSettings()`, sinds 2026-10-27). LinkedIn alleen als `https`-link |
| Cijfers (statistieken) | CMS `statistieken`, nu leeg, daarom verborgen |

### Beveiliging van de site

Security-headers in `next.config.ts`: CSP, HSTS, nosniff, frame-deny, referrer-policy, permissions-policy. De CSP heeft `'unsafe-inline'` voor scripts nodig (Next.js en Vercel Analytics), pas weg met nonces. Blog is dichtgezet tegen XSS (javascript:-links, koptags, JSON-LD). Cookiebanner is server-gerenderd, keuzes zijn gelijkwaardig, analytics pas na toestemming.

### Prestaties (meting 2026-09-27, lokale productiebuild)

Lighthouse mobiel: home 95 tot 97, vacatures 99, blog 93. Toegankelijkheid, best practices en SEO 100. LCP net boven 2,5 s op home en blog (full-screen poster deelt 4G-simulatie met de bundels). Sindsdien niet opnieuw gemeten.

---

## 4. CMS en dashboard

Eén codebase met twee ingangen:

| Pad | Wat | Wie |
|---|---|---|
| `/dashboard` | Eigen interface in de huisstijl | Elke ingelogde gebruiker |
| `/admin` | Standaard Payload-admin ("Geavanceerd beheer"), ingeklapt onder "Ruwe gegevens" | Alleen de creator |

### Vacatures beheren (2026-11-12)

Eén formulier voor nieuw en bewerken (`components/VacatureVelden.tsx`, `lib/vacatureVorm.ts`): kenmerken, jobomschrijving, profiel, nice to have, aanbod, status, plaatsingsdatum en zichtbaarheid. Daarvoor kon de klant de jobtekst alleen in `/admin` invullen, waar hij niet bij kan. Nieuwe velden: `uren`, `opleidingsniveau`, `talen`, en `slug` (vast adres op de website, automatisch uit de titel). Vakgebied kreeg de optie Automatisering. Salaris blijft een intern veld. De API geeft anoniem nu ook ingevulde vacatures terug (de website toont ze als ingevuld). Migratie `20261112_120830_vacature_velden`, op Supabase toegepast op 2026-11-12 (`scripts/sql/20261112_vacature_velden.sql`).

Menu voor de klant: Overzicht, Vacatures, Homepage, Blog, Team, Media, Gebruikers. Pipeline, Kandidaten, Sollicitaties, Bedrijven, Agenda en Activiteiten ziet alleen de creator nog (de pagina's zelf bestaan nog en zijn per URL bereikbaar voor wie ingelogd is).

### Rollen

`creator` (Sam, onzichtbaar voor de klant) boven `beheerder` boven `consultant`. Instellingen wijzigen mag alleen beheerder en creator; het menu-item Instellingen ziet alleen de creator nog (2026-10-27), de klant past alles aan via Homepage. Rol zit in de JWT. Alle toegangscontrole loopt via `lib/access.ts`; niets is publiek tenzij de website het nodig heeft (vacatures actief en zichtbaar, blog gepubliceerd, team actief, media).

### Collecties en globals

`Vacatures`, `Kandidaten`, `Bedrijven`, `Sollicitaties`, `Activiteiten`, `Documenten`, `Blog`, `Team`, `Media`, `Gebruikers`; globals `Instellingen` en `Website` (homepage-teksten).

### Dashboardonderdelen

Overzicht, kandidaten (filters, voortgangslijn, status wijzigen, snelle notitie), bedrijven, vacatures, sollicitaties, pipeline (kanban), agenda, activiteiten, blog, team, media, gebruikers, instellingen (alleen creator) en **homepage**, met sinds 2026-10-27 een blok Contact en footer.

### Live editor (nieuw, 2026-10)

In `/dashboard` zijn Homepage, Blog en Team te bewerken met de website ernaast (`components/LiveEditor.tsx`). "Op de pagina bewerken": klik een tekst in het voorbeeld, pas aan in een pop-up (`PaginaEditor.tsx`), opslaan. De klik-detectie zoekt de tekst onder de muis, niet het aangeklikte element (`BewerkOverlay`). Bewerkbaar zijn: hero-teksten, callouts (acrostichon-omschrijvingen) en het titelblok van de tekening, met validatie per veld (patroon en hint). Teksten staan in de globals `Website`.

### Koppelingen naar buiten

| Route | Doel | Beveiliging |
|---|---|---|
| `/api/inbound-email` | Inkomende e-mail (Postmark/Make) | geheim `EMAIL_WEBHOOK_SECRET`, weigert zonder |
| `/api/make-callback` | Make.com, allowlist van collecties | geheim `MAKE_SECRET`, weigert zonder |
| `/api/health`, `/api/health-check` | Uptime en databasecheck | geven alleen ok of fout |
| `/api/upload-media` | Uploads naar R2 | ingelogd, alleen rasterbeelden |

---

## 5. Infrastructuur

- **Vercel**: twee projecten, deploy bij push naar `main`. Website-project staat in `.vercel/`; CMS-map was ooit aan `som-vastgoed-cms` gekoppeld en is opnieuw aan `specified-cms` gehangen.
- **Supabase**: project `specified-cms` (ref `htkcrkafetzbnpznektz`, Frankfurt, gratis plan). Schema `payload`, niet via de Data API bereikbaar, anon en authenticated hebben geen rechten. Migratie uit MongoDB op 2026-09-26.
- **Cloudflare R2**: mediabucket (privé, ondertekende links). De scroll-frames van de hero (6,6 MB) staan nog op Vercel; verhuizen naar `media.specified.be` samen met de domeinverhuis.
- **Resend** (CMS en website sinds 2026-10-27; `FOUTMELDING_AAN` = steylvisuals96@gmail.com in beide Vercel-projecten, `RESEND_API_KEY` nog alleen in de CMS): serverfouten gaan via `instrumentation.ts` en `lib/foutmelding.ts` naar de beheerder, met een limiet op het aantal mails. Opgevangen fouten melden met `meldFout()` in het catch-blok.

### Monitoring en back-ups

Volledige handleiding: `specified-cms/docs/MONITORING.md`.

- Uptime: Better Stack of UptimeRobot op `/api/health` van beide sites. Elke check raakt de database, zodat het gratis project niet na 7 dagen pauzeert.
- Back-up: **voorlopig geen**. De eigen nachtelijke back-up (GitHub Action, `pg_dump` naar R2) is op 2026-10-28 geschrapt, met workflow, scripts en secrets. Na de eerste betaling van Specified gaat Supabase naar het betaalde plan, dat zelf dagelijks een back-up maakt (7 dagen). Code terugvinden: CMS-commit `258f609`.

### Omgevingsvariabelen

Website: `NEXT_PUBLIC_CMS_URL` (optioneel), later `NEXT_PUBLIC_SITE_URL`; voor de formulieren `RESEND_API_KEY`, `FORMULIER_AAN`, `FORMULIER_VAN` en optioneel `FORMULIER_ANTWOORD`. CMS: `DATABASE_URI`, `PAYLOAD_SECRET`, `R2_*`, `EMAIL_WEBHOOK_SECRET`, `MAKE_SECRET`, Resend-sleutel. Waarden staan nooit in git of in dit document.

---

## 6. Beveiliging, stand van zaken

- Next.js 16.3.6 en Payload 3.90.2: kritieke middleware-bypass dicht. `npm audit`: website 0, CMS 0 kritiek en hoog.
- Semgrep (OWASP, Next, React, TS, secrets): 0 bevindingen. Security review na back-end redesign: geen high of critical.
- Server actions in de CMS schrijven als de ingelogde gebruiker (`lib/serverPayload.ts`); eerder konden 11 acties zonder login schrijven, dat is dicht.
- Login-lockout 5 keer per 15 minuten, sessie 8 uur, geen interne foutmeldingen naar de client.
- Rolscenario's getest, 14 van 14.
- `teksten`-tabel: RLS aan zonder regels (Supabase-advies, niveau info). De leesregel en de rol van de back-up zijn verwijderd (2026-10-28).
- Bekend gat: het publieke e-mailendpoint heeft nog geen rate limiting.

---

## 7. Beslissingen

| Beslissing | Reden |
|---|---|
| Redesign op de bestaande CMS, richting Signatuurmerk | CMS en content bestonden al; alleen de voorkant en de back-office-stijl vernieuwen |
| Hero als technische tekening, geen video of 3D | Past bij engineering; homepage ging van 2,2 MB naar 288 KB |
| CSS `sticky` in plaats van GSAP-pin | Geen layout shift, geen lege band |
| Supabase in plaats van MongoDB | Keuze van Sam (2026-09-26), past bij het bouwplan |
| `/admin` alleen voor de creator, klant werkt in `/dashboard` | Eén omgeving voor de klant; Payload-admin blijft achterdeur |
| Na inloggen naar Overzicht, Ruwe gegevens verborgen | `/admin` stuurt door naar `/dashboard`; collecties hebben `group: false` en zijn voor de creator alleen nog per URL bereikbaar, menu-item Geavanceerd beheer weg (2026-10-28) |
| IBM Plex Sans voor tekst en UI | Technischer dan Instrument Sans, past bij de tekening; keuze Sam uit vier opties (2026-10-29, `design/lettertype-vergelijking.png`) |
| Live editor in plaats van losse formulieren | Klant ziet direct wat verandert |
| Constante hero-beweging teruggedraaid | Rustiger, past bij DESIGN.md; variant bewaard op `preview/hero-ambient` |
| Domeinverhuis pas in november, na akkoord klant | Klant heeft de nieuwe site nog niet gezien |
| Rechtstreeks naar `main` | Werkafspraak met Sam |
| Contactgegevens naar de Homepage-editor, Instellingen alleen voor de creator | Klant past alle zichtbare tekst op één plek aan (2026-10-27) |
| Geen eigen back-up; Supabase betaald plan na eerste betaling | Ingebouwde dagelijkse back-ups, geen extra beheer (2026-10-28). Tot dan geen back-up |
| Foutmeldingen via Resend in plaats van Sentry | Eén dienst, met eigen limiet (1x per uur per fout, 10 per uur per server) |
| Livegang op 2027-01-11 in plaats van domeinverhuis in november | Wens van de klant in de invullijst (nieuw jaar), 2026-11-12 |
| Geen klantlogo's of projectnamen op de site | Klant mag ze niet tonen (invullijst); cases alleen anoniem |
| Geen salaris bij vacatures, ingevulde vacatures blijven zichtbaar als ingevuld | Invullijst, 2026-11-12 |
| Sollicitaties en aanvragen per mail naar Simon, niet in een overzicht in het beheer | Invullijst: "alleen in mijn mail" |
| Licht en donker thema, bezoeker kiest; donker is de standaard | Invullijst. Donker blijft de huisstijl, de keuze wordt onthouden (gebouwd 2026-11-12) |
| Pagina per vacature meteen gebouwd, detailpaneel geschrapt | Nodig voor Google for Jobs; elke vacature een eigen adres. Lost ook animatieplan 009 op |
| Eén filter (vakgebied) op de vacaturelijst | Specified vroeg geen filters op regio en uren |
| Formulieren mailen via Resend vanaf de website, niets opslaan | Specified wil aanvragen alleen in de mail |
| Recruitmentmodules uit het klantmenu | Specified beheert alleen vacatures en blog |
| Juridische naam Specified NV (niet BV) | Invullijst, aangepast in footer, privacy en JSON-LD (2026-11-12) |

---

## 8. Open punten

**Afstemmen met Simon (tegenstrijdigheden uit de invullijst, zie `BRIEFING.md`)**
- [x] Pagina per vacature en één filter op vakgebied: gebouwd (2026-11-12), nog te bevestigen door Simon.
- [ ] NL en EN gevraagd, meerdere talen op "later". Voorstel: livegang in het Nederlands, Engels als fase 2.
- [ ] Moeten sollicitaties ook in Bullhorn (hun ATS)? Zo ja: API-toegang via Bullhorn regelen.
- [ ] Privacyverklaring bestaat "actueel" maar privacy- en cookieteksten en algemene voorwaarden "heb ik niet": bestaande teksten opvragen of laten opstellen. Wie is verantwoordelijk voor privacy?
- [ ] Bewaartermijn sollicitatiegegevens (advies: 1 jaar, 2 met toestemming).
- [ ] Betaalwijze: toelichting ontbrak in de invullijst.
- [ ] Slogans "We engineer possibilities" en "We are here to stay": voorstel doen.
- [ ] Concepten en publicatie inplannen voor vacatures en blog: voorstel doen.

**Wachten op de klant of Sam**
- [ ] Offerte opmaken, met één shootdag (foto en video, 3 à 4 mensen) en onderhoudsabonnement (reactie binnen 2 werkdagen, 1 à 2 kleine aanpassingen per maand).
- [ ] Livegang op `specified.be` (2027-01-11): domein naar Vercel, `NEXT_PUBLIC_SITE_URL`, CORS-lijst CMS, sitemap en canonical live controleren, status- en media-subdomein. Registrar, DNS-beheer, hosting en vervaldata zijn bij de klant onbekend: via de contactpersoon van Rocketship achterhalen. MX, SPF, DKIM, DMARC en autodiscover van Microsoft 365 (beheerd door Cronos) exact overnemen.
- [ ] 301-doorverwijzingen van de oude URL's op `specified.be` naar de nieuwe.
- [ ] Analytics en Search Console: nieuw aanmaken op een account van Specified (huidige eigenaar onbekend).
- [ ] Aanlevering van de klant: logo in vector, huisstijlgids, teksten, vacaturelijst, quotes en cases, cijfers en certificaten (zegt klaar te hebben). Teamfoto's en bio's ontbreken, komen uit de shootdag.
- [ ] Echte cijfers voor de statistieken: 32 consultants en 4 sectoren zijn bekend, klanten in cijfers en jaren ervaring nog niet. Bevestiging van de teksten uit `lib/inhoud.ts` (CMS bevat nog voorbeeldteksten uit de recruitment-richting).
- [ ] Concurrentie bekijken (Abylsen, TEC, TMC, ENGIE Talents, Pauwels Consulting) en het goede meenemen, op vraag van de klant.
- [ ] Korte beheerhandleiding in pdf.

**Bouwen volgens de invullijst**
- [x] Pagina's: Voor bedrijven, Voor engineers, Open sollicitatie, FAQ, Contact, Algemene voorwaarden (plaatshouder), Disclaimer, Toegankelijkheidsverklaring (2026-11-12).
- [x] Formulieren: sollicitatie met cv per vacature, open sollicitatie, contact, consultant aanvragen, met bevestigingsmail en melding (2026-11-12). Echt mailen is niet getest: zie volgende punt.
- [ ] **Formulieren activeren**: `specified.be` verifiëren in Resend (DNS), in het Vercel-project van de website `RESEND_API_KEY`, `FORMULIER_AAN` en `FORMULIER_VAN` zetten, en elk formulier één keer echt versturen. Tot dan tonen de formulieren een foutmelding.
- [x] Vacaturevelden in de CMS, pagina per vacature en JobPosting voor Google for Jobs (2026-11-12). Daarna de vacaturepagina's testen in Googles Rich Results Test zodra de site live staat.
- [ ] De 5 bestaande vacatures aanvullen met uren, opleiding en talen (velden zijn leeg), of vervangen door de lijst van Specified.
- [x] Licht thema met keuzeschakelaar (2026-11-12). Nog door Sam te beoordelen, vooral de hero-tekening en de teamfoto's in licht.
- [x] Dashboard voor de klant teruggebracht tot vacatures, blog, team, media en homepage; rollabels op de website zonder "Recruitment" (2026-11-12). De rol `consultant` bestaat nog; Specified wil 2 gebruikers met dezelfde rechten (beide beheerder maken).
- [ ] Vacature-alert per e-mail (inschrijven met bevestiging, uitschrijflink, mail bij nieuwe vacature). Vraagt opslag van adressen en een geverifieerd maildomein.
- [ ] Tweestapslogin voor het beheer (zie Techniek).
- [ ] Certificaten staan nu als tekst op Voor bedrijven en Voor engineers; verhalen van consultants nog te maken (inhoud van Specified nodig).
- [ ] Het overzicht van het dashboard toont nog recruitmentcijfers; aanpassen aan vacatures en blog.
- [ ] Engelse versie (fase 2).
- [ ] Toegankelijkheid op WCAG 2.1 AA controleren met een echte toets (axe, schermlezer); de verklaring zegt nu eerlijk dat er nog geen onafhankelijke toets was.
- [ ] SEO op "engineering consultancy" en "ingenieur jobs": titels en beschrijvingen staan, inhoud volgt met de teksten van Specified; kwartaalrapport met het aantal sollicitaties.
- [ ] `/api/formulier`: de limiet per IP geldt per server. Bij misbruik een gedeelde limiet toevoegen (Vercel Firewall of een teller in Supabase).

**Techniek**
- [ ] Supabase naar het betaalde plan zodra Specified de eerste factuur betaald heeft (dagelijkse back-ups). Tot dan is er geen back-up.
- [x] Rol `backup_lezer` verwijderd in Supabase (2026-10-28).
- [ ] Better Stack- of UptimeRobot-monitors aanmaken op beide `/api/health`.
- [ ] `RESEND_API_KEY` ook in het Vercel-project van de website zetten, en een echte proefmail sturen (`scripts/test-foutmelding.ts` in de CMS).
- [ ] Tweestapslogin voor alle gebruikers van het beheer, ook de klant: gevraagd in de invullijst (Payload heeft het niet ingebouwd).
- [ ] Rate limiting en spambeveiliging op het publieke e-mailendpoint.
- [ ] MongoDB/Atlas en `MONGODB_URI` opruimen (30 dagen na de overstap, dus nu aan de beurt).
- [ ] Audit-log (wie wijzigde wat).
- [ ] Overblijfselen uit vastgoed in `dashboard/team/create` en `team/[id]/edit`.
- [ ] LCP op home en blog onder 2,5 s krijgen, daarna Lighthouse opnieuw meten.
- [ ] `prefers-reduced-motion` in een echte browser emuleren en controleren.
- [ ] Scroll-frames naar R2 (met de domeinverhuis).
- [ ] CSP zonder `'unsafe-inline'` via nonces.
- [ ] Het in-page-editor-werk door Sam laten testen op productie.

**Animatieplannen** (`plans/`): ronde 1 (001 tot 005) is uitgevoerd; ronde 2 (006 tot 008: vacatures-easing, contactonderlijn, mobiel menu) staat open; 009 (vacaturepaneel op mobiel) vervalt, het paneel is vervangen door een pagina per vacature. 001 tot 003 gingen over de oude lijst met paneel en zijn daarmee ook achterhaald. Zie `plans/README.md`.

**Documentatie die achterloopt**
- `specified-cms/README.md` en `.env.example` noemen nog MongoDB en `MONGODB_URI`; de database is Supabase (`DATABASE_URI`). Ook de rollenlijst en de toegang tot `/admin` in de README zijn verouderd.
- `CLAUDE.md` bevat de regel "CMS direct op Supabase, zonder Payload". De huidige CMS draait nog wel op Payload (met Supabase als database). Die regel geldt dus voor nieuw werk; een stap weg van Payload is nog niet gezet en nog niet besproken.

---

## 9. Wijzigingslog

Wordt automatisch gevuld uit git (beide repo's, `main`) door `scripts/draaiboek-bijwerken.sh`. Niet met de hand wijzigen.

<!-- LOG-START -->
_Bijgewerkt: 2026-11-12 12:15_

### Nog niet op main

Niets: alles staat op main.

### Op main

**2026-11-12**

- website: Invullijst verwerkt: briefing, draaiboek bijgewerkt, Specified NV met adres en ondernemingsnummer (`3a4dbe8`)
- cms: Vacatures: uren, opleiding, talen en vast adres; volledig formulier in het dashboard (`ca4e2f6`)

**2026-10-29**

- website: Lettertype: IBM Plex Sans voor tekst en UI (`bd5b31e`)
- cms: Lettertype: IBM Plex Sans in dashboard en admin, zoals de website (`5081ff3`)

**2026-10-28**

- website: Draaiboek: rol backup_lezer verwijderd (`7f99123`)
- website: Draaiboek: contact in Homepage-editor, Instellingen alleen creator, back-up geschrapt (`17c8029`)

**2026-10-27**

- website: Contactgegevens uit de Homepage-editor (`c3c4b8b`)
- website: Draaiboek: Resend-foutmeldingen live, log ververst (`a8000ca`)
- website: Draaiboek van de website, met script voor de wijzigingslog (`e09a7e5`)
- website: Foutmeldingen per mail via Resend, met limiet (`05790bd`)
- website: Bewerkmodus: titelblok van de tekening aanklikbaar (`ceb3bbc`)
- website: Bewerkmodus: callouts van de tekening aanklikbaar (`3656ab7`)
- website: Bewerkmodus: tekst onder de muis zoeken, ook onder de scrollhero-lagen (`059abe3`)
- website: Favicon: alleen het groene beeldmerk, zonder donkere achtergrond (`e471df9`)
- website: Bewerkmodus: klikbare teksten op de homepage-voorbeeldpagina (?bewerken) (`3155b60`)

**2026-10-26**

- website: Hero-tekening past op elk scherm: blad vult ook brede schermen, eindlogo boven de kop, telefoon dwars (`e8353d3`)
- website: Live voorbeeld: gedeelde artikelweergave en stabiele hero-herbouw (`896c1d0`)
- website: Homepage-teksten uit de CMS en live voorbeelden voor homepage en team (`032a46a`)
- website: Live voorbeeld voor blogartikelen vanuit het CMS (`d7f0b5a`)

**2026-10-22**

- website: Hero: constante beweging terugdraaien op main (blijft in preview/hero-ambient) (`3fceab9`)

**2026-10-20**

- website: Audit-fixes: skip-link, --bone-600, filterknoppen 44px, kleurtokens, glow en will-change (`4eb3859`)
- website: Hero: constante beweging met scanlijn en maatlijnen (`a5210fa`)
- website: Animatieplannen 001-005 uitgevoerd: expliciete transities, begrensde stagger, snelser paneel, hover-gating, veeg ease-out (`5fbc59c`)
- website: Animatieplannen 001-005 uit de motion-audit (`f746c1d`)

**2026-09-28**

- website: Stilstaande hero (Verminder beweging / geen JS): het logo als eindbeeld (`1fe3479`)
- website: Mobiel menu: effen achtergrond; het raster blijft voorbehouden aan het tekenblad (`ccafe2d`)
- website: Mobiel geoptimaliseerd: hero-opening, cookiebanner, menu, consultancy-teksten (`39e5bac`)

**2026-09-27**

- website: Logo-hover: exponentiële easing i.p.v. overshoot-curve (`be20ff8`)
- website: Hero-polish: laadmoment, natekenen, callout-pop, logo-gloed; logo-hover, vizier-muiswijzer en vloeiend scrollen (`d2d8532`)
- website: Hero: blad vult elke schermverhouding, beeldmerk komt erbij in het eindbeeld, maatlijn weg (`8c3cd98`)
- website: Mobiel: SPECIFIED draait op het einde naar horizontaal en vult de breedte; titelblok groter en leesbaar (`2f589af`)
- website: Titelblok leesbaar: veldnamen lichter en groter, meer ruimte, minder gedimd op het einde (`b752e19`)
- website: Hero wordt SPECIFIED als technische tekening; site positioneert Specified als engineering consultancy (`40d4067`)
- website: Laadtijd: covers via next/image, hero preload, lichter icoon en lettertype (`5455ced`)
- website: Menusprongen landen net onder de navigatie; diensten-beelden liggend op desktop (`ccd0088`)
- website: Vacatures en blog: geen middenpunt of vinkje meer, kleinste tekst naar 13px (`a6416a3`)
- website: Fase 6: laadtijd en SEO (`839f834`)
- website: Hero: scrollruimte als echt element, zodat sticky werkt (geen lege band meer) (`38a0f05`)

**2026-09-26**

- website: Hero: sticky i.p.v. GSAP-pin (geen layout shift), frames pas na laden (`bb4b03b`)
- website: Beveiligingsupdates: Next.js 16.3.6 (middleware-bypass, server-actions-DoS) + npm audit fix, 0 bekende kwetsbaarheden (`d9e6dc9`)
- website: Blog: sluit XSS via javascript:-links, koptags en JSON-LD (`edc70f4`)
- website: Blog: sluit XSS via javascript:-links, koptags en JSON-LD (`c8aa10b`)
- website: Beveiligingsupdates: Next.js 16.3.6 (middleware-bypass, server-actions-DoS) + npm audit fix, 0 bekende kwetsbaarheden (`94f2589`)

**2026-07-26**

- website: Zet security headers en maak de repo overdraagbaar (`a9e806f`)
- website: Vacatures tonen waar een ingenieur echt op beslist (`6627a8f`)
- website: Fix twee P0's: werkende cookieconsent en dode navigatie-anchors (`bbfba44`)

**2026-07-21**

- website: Gebruik cover_url als fallback voor blogafbeeldingen zonder upload (`b74e833`)

**2026-07-20**

- website: Fix build: voeg 'naam' toe aan SiteSettings-type (`ea55787`)
- website: Voeg blog toe aan website + SEO-fundament (`90d9534`)
- website: Menu "Jobs" verwijst naar de volledige vacaturepagina (`d15923b`)
- website: Fix teamfoto's: juiste uitsnede en portretformaat (`9ebc821`)

**2026-07-19**

- website: Herstel desktop-layout (md:-classes werkten niet door inline stijlen) (`79f21f8`)
- website: Optimaliseer mobiele weergave (`797e12f`)

**2026-07-18**

- website: Fix menulinks: verwijs naar homepage-secties vanaf elke pagina (`c511d8e`)
- website: Vacaturepagina + legal footers uit CMS, 404-pagina, Speed Insights (`821d01b`)

<!-- LOG-END -->

---

## Bijlage: waar staat wat

| Document | Inhoud |
|---|---|
| `DESIGN.md` | Het ontwerpsysteem: palet, typografie, motion, staten |
| `PLAYBOOK-STATUS.md` | Historisch bouwlogboek per fase, tot 2026-09-28 |
| `plans/` | Animatieplannen en hun status |
| `specified-cms/docs/ADMIN-HANDLEIDING.md` | Handleiding voor Specified |
| `specified-cms/docs/MIGRATIE-SUPABASE.md` | De overstap van MongoDB naar Supabase |
| `specified-cms/docs/MONITORING.md` | Uptime-monitoring en foutmeldingen via Resend instellen |
