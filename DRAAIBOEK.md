# Draaiboek Specified-website

Dit is de ene plek waar staat wat de website van Specified is, hoe die in elkaar zit en wat er nog open staat. Het gaat over twee repositories die samen één product vormen: de website en de CMS.

**Bijhouden:** de delen 1 tot en met 8 schrijft Claude bij zodra iets verandert (regel staat in `CLAUDE.md`). Deel 9 (wijzigingslog) wordt automatisch uit git gebouwd bij elke commit, via `scripts/draaiboek-bijwerken.sh`. Buiten de markeringen in deel 9 niets met de hand wijzigen in dat deel.

Laatst handmatig nagekeken: 2026-10-27.

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

Klant: **Specified**, engineering consultancy uit Antwerpen met eigen consultants (oprichters Tom Wijdooghe en Simon Claeys, `info@specified.be`). Gebouwd door SteylVisuals (Sam). De bestaande site op `specified.be` draait nog de oude versie; de nieuwe staat op de Vercel-adressen tot de domeinverhuis (november 2026, na akkoord van de klant).

Werkafspraak: rechtstreeks naar `main` pushen, geen feature-branches en PR's (zie `CLAUDE.md`).

---

## 2. Ontwerp

Richting **Signatuurmerk**. Alles staat in `DESIGN.md`; hier de kern.

- Palet: donker `#1E1E21` en `#323236`, limoen `#DFFD7B` als accent. Tokens in `app/globals.css`.
- Lettertypen: Bebas Neue voor koppen, Instrument Serif Italic en Instrument Sans voor tekst (via `next/font`).
- Radius 0 op de site, 2px in de back-office. Geen pill-knoppen, geen pijltjes, geen kapitalen-labels, geen middenpunten of streepjes in teksten (komma of koppelteken).
- Motion is stil en bewust. Geen constante beweging in de hero (dat is teruggedraaid, de variant leeft op de branch `preview/hero-ambient`).
- `prefers-reduced-motion` en geen-JS tonen een stilstaande hero met het logo als eindbeeld.

---

## 3. Website

### Pagina's

| Route | Inhoud |
|---|---|
| `/` | Hero als technische tekening, disciplines, diensten, vacatures, team, contact |
| `/vacatures` | Filterbare lijst met detailpaneel (Framer Motion) |
| `/blog`, `/blog/[slug]` | Artikelen uit de CMS |
| `/privacy`, `/cookies` | Juridische pagina's (`components/LegalPage.tsx`) |
| `/api/health` | Gezondheidscheck: site draait en bereikt de CMS (503 bij fout) |
| `sitemap`, `robots`, `opengraph-image` | SEO |

### De hero (technische tekening)

SPECIFIED getekend als blad met titelblok. Elke letter heeft een callout (acrostichon: Studies, Projecten, Elektromechanica, Consultants, Industrie, Focus, Integratie, Extra mile, Drive). De tekening wordt natekend, callouts poppen op (`back.out`, bewust), en de hele hero is gekoppeld aan scroll. Op mobiel draait SPECIFIED op het einde naar horizontaal. Component: `components/HeroTekening.tsx`. Teksten: `lib/inhoud.ts` (`TEKENING_CALLOUTS`, `TEKENING`).

### Bouwstenen

`Nav`, `HeroTekening`, `Disciplines` (scroll-scrub), `ScrollMomenten`, `Split`, `Jobs`, `VacaturesClient`, `Team`, `CTA`, `Footer`, `Logo` (hover als keyframes, vastgelegd), `Vizier` (CAD-muiswijzer, alleen desktop), `VloeiendScrollen` (Lenis, alleen desktop), `HashScroll`, `CookieBanner` en `AnalyticsGate`.

### Inhoud: waar komt tekst vandaan

| Wat | Bron |
|---|---|
| Hero-tekening, callouts, titelblok, diensten | `lib/inhoud.ts`, en per veld te overschrijven vanuit de CMS (live editor, deel 4) |
| Vacatures, blog, team, instellingen | CMS via REST (`lib/settings.ts`, `lib/blog.ts`) |
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

### Rollen

`creator` (Sam, onzichtbaar voor de klant) boven `beheerder` boven `consultant`. Instellingen wijzigen mag alleen beheerder en creator. Rol zit in de JWT. Alle toegangscontrole loopt via `lib/access.ts`; niets is publiek tenzij de website het nodig heeft (vacatures actief en zichtbaar, blog gepubliceerd, team actief, media).

### Collecties en globals

`Vacatures`, `Kandidaten`, `Bedrijven`, `Sollicitaties`, `Activiteiten`, `Documenten`, `Blog`, `Team`, `Media`, `Gebruikers`; globals `Instellingen` en `Website` (homepage-teksten).

### Dashboardonderdelen

Overzicht, kandidaten (filters, voortgangslijn, status wijzigen, snelle notitie), bedrijven, vacatures, sollicitaties, pipeline (kanban), agenda, activiteiten, blog, team, media, gebruikers, instellingen en **homepage**.

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
- **Cloudflare R2**: mediabucket (privé, ondertekende links) en aparte bucket `specified-backups`. De scroll-frames van de hero (6,6 MB) staan nog op Vercel; verhuizen naar `media.specified.be` samen met de domeinverhuis.
- **GitHub Actions** (CMS): nachtelijke back-up, `.github/workflows/backup.yml`.
- **Resend** (live in de CMS sinds 2026-10-27): serverfouten gaan via `instrumentation.ts` en `lib/foutmelding.ts` naar de beheerder, met een limiet op het aantal mails. Opgevangen fouten melden met `meldFout()` in het catch-blok.

### Monitoring en back-ups

Volledige handleiding: `specified-cms/docs/MONITORING-EN-BACKUPS.md`.

- Uptime: Better Stack of UptimeRobot op `/api/health` van beide sites. Elke check raakt de database, zodat het gratis project niet na 7 dagen pauzeert.
- Back-up: elke nacht 02:17 UTC, dump met read-only rol `backup_lezer`, versleuteld met `gpg` (AES-256), in R2 onder `dagelijks/` (30 dagen) en `maandelijks/` (365 dagen). Breekt af bij te weinig tabellen of een RLS-tabel zonder leesregel.
- Status: scripts en workflow staan in `main`. De Action zelf en de R2-upload zijn pas getest nadat de secrets zijn gezet (zie open punten).

### Omgevingsvariabelen

Website: `NEXT_PUBLIC_CMS_URL` (optioneel), later `NEXT_PUBLIC_SITE_URL`. CMS: `DATABASE_URI`, `PAYLOAD_SECRET`, `R2_*`, `EMAIL_WEBHOOK_SECRET`, `MAKE_SECRET`, Resend-sleutel. Waarden staan nooit in git of in dit document.

---

## 6. Beveiliging, stand van zaken

- Next.js 16.3.6 en Payload 3.90.2: kritieke middleware-bypass dicht. `npm audit`: website 0, CMS 0 kritiek en hoog.
- Semgrep (OWASP, Next, React, TS, secrets): 0 bevindingen. Security review na back-end redesign: geen high of critical.
- Server actions in de CMS schrijven als de ingelogde gebruiker (`lib/serverPayload.ts`); eerder konden 11 acties zonder login schrijven, dat is dicht.
- Login-lockout 5 keer per 15 minuten, sessie 8 uur, geen interne foutmeldingen naar de client.
- Rolscenario's getest, 14 van 14.
- Bekend gat: `teksten`-tabel had een RLS-instelling die de back-uprol blokkeerde; opgelost met een leesregel.
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
| Live editor in plaats van losse formulieren | Klant ziet direct wat verandert |
| Constante hero-beweging teruggedraaid | Rustiger, past bij DESIGN.md; variant bewaard op `preview/hero-ambient` |
| Domeinverhuis pas in november, na akkoord klant | Klant heeft de nieuwe site nog niet gezien |
| Rechtstreeks naar `main` | Werkafspraak met Sam |

---

## 8. Open punten

**Wachten op de klant of Sam**
- [ ] Domeinverhuis naar `specified.be` (november): domein naar Vercel, `NEXT_PUBLIC_SITE_URL`, CORS-lijst CMS, sitemap en canonical live controleren, status- en media-subdomein.
- [ ] Echte cijfers voor de statistieken, en bevestiging van de teksten uit `lib/inhoud.ts` (CMS bevat nog voorbeeldteksten uit de recruitment-richting).
- [ ] Vacatures in de CMS zijn ongeveer 90 dagen oud; bio Tom is Engels en Simon Nederlands.
- [ ] Handtekeningen van Tom en Simon (op papier).
- [ ] Tom en Simon: wachtwoord wijzigen (stond in git-geschiedenis).
- [ ] Admin-handleiding en retainer-afspraken bij de klant bezorgen.

**Techniek**
- [ ] Monitoring en back-up in gebruik nemen: Better Stack-monitors, R2-bucket `specified-backups`, rol `backup_lezer`, GitHub-secrets, testrun (`gh workflow run backup.yml`). Zie het CMS-document.
- [ ] Tweestapslogin voor de creator (Payload heeft het niet ingebouwd).
- [ ] Rate limiting en spambeveiliging op het publieke e-mailendpoint.
- [ ] MongoDB/Atlas en `MONGODB_URI` opruimen (30 dagen na de overstap, dus nu aan de beurt).
- [ ] Audit-log (wie wijzigde wat).
- [ ] Overblijfselen uit vastgoed in `dashboard/team/create` en `team/[id]/edit`.
- [ ] LCP op home en blog onder 2,5 s krijgen, daarna Lighthouse opnieuw meten.
- [ ] `prefers-reduced-motion` in een echte browser emuleren en controleren.
- [ ] Scroll-frames naar R2 (met de domeinverhuis).
- [ ] CSP zonder `'unsafe-inline'` via nonces.
- [ ] Het in-page-editor-werk door Sam laten testen op productie.

**Animatieplannen** (`plans/`): ronde 1 (001 tot 005) is uitgevoerd; ronde 2 (006 tot 009: vacatures-easing, contactonderlijn, mobiel menu, vacaturepaneel in beeld op mobiel) staat open. Zie `plans/README.md`.

**Documentatie die achterloopt**
- `specified-cms/README.md` en `.env.example` noemen nog MongoDB en `MONGODB_URI`; de database is Supabase (`DATABASE_URI`). Ook de rollenlijst en de toegang tot `/admin` in de README zijn verouderd.
- `CLAUDE.md` bevat de regel "CMS direct op Supabase, zonder Payload". De huidige CMS draait nog wel op Payload (met Supabase als database). Die regel geldt dus voor nieuw werk; een stap weg van Payload is nog niet gezet en nog niet besproken.

---

## 9. Wijzigingslog

Wordt automatisch gevuld uit git (beide repo's, `main`) door `scripts/draaiboek-bijwerken.sh`. Niet met de hand wijzigen.

<!-- LOG-START -->
_Bijgewerkt: 2026-10-27 22:44_

### Nog niet op main

- website, branch `preview/audit-fixes-2`: 3 commit(s) voor op main
- website, branch `preview/hero-beweging`: 1 commit(s) voor op main
- website, branch `preview/streepjes-nav`: 1 commit(s) voor op main

### Op main

**2026-10-27**

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
- website: Handtekening tekent met de scroll in plaats van per woord te herhalen (`7e52c60`)
- website: Kandidatenbeeld lichter gegrade: middentonen omhoog, olijftoon behouden (`ca2a696`)
- website: Scherpere turbine-frames: volle bronresolutie, lichtere compressie, minder zoom (`3c4d06b`)
- website: Turbine speelt af met de scroll: gepinde hero met framereeks op canvas (`2253e9b`)
- website: Turbine als naadloze videolus in de hero, scroll-rotatie vervangen door zoom (`d913f93`)

**2026-09-25**

- website: Hero-rotator met hertekenende handtekening en een scroll-moment per sectie (`f94a6d7`)
- website: Trek subpagina's in de huisstijl: geen pijltjes, hoeken of kapitalen-labels, blogfoto's gegrade, reduced motion op vacatures (`c95d5c5`)
- website: Voeg AI-sfeerbeelden toe, fix mobiele vacaturerijen en founder-grade (`0fe537b`)
- website: Bouw Signatuurmerk-homepage: typografische hero, disciplines-scroll, vacatures, founders, contact (`347ca87`)
- website: Zet project klaar voor redesign: GSAP, fonts, motion-skills lokaal (`379f790`)
- website: Voeg DESIGN.md toe voor Signatuurmerk-redesign (`ba2772b`)
- website: Voeg Signatuurmerk-ontwerpreferenties per sectie toe (`f4192b9`)
- website: Voeg vrijstaande founder-portretten toe voor Signatuurmerk (`a8dd605`)
- website: Start redesign Signatuurmerk: playbook-status fase 0 (`630e639`)

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

**2026-07-15**

- website: Website: alle homepage-content uit het CMS (`2dc8a29`)

**2026-07-11**

- website: Voeg Vercel Analytics toe (`a85cc01`)

**2026-07-05**

- website: 3D mouse-parallax op homepage vormen (`82a1191`)
- website: Custom cursor op alle pagina's + groeit boven klikbare elementen (`e284df0`)
- website: Fix: verberg systeemcursor enkel op homepage, niet site-breed (`f489959`)
- website: Voeg /api/health endpoint toe voor uptime-monitoring (`6a017a2`)
- website: Koppel homepage aan CMS Instellingen-global (`75c43ce`)
- website: Voeg privacybeleid, cookiebeleid en cookie-consent banner toe (`f5f6371`)
- website: Homepage wow-effect: woord-wissel, marquee, count-up, cursor, grain (`1640231`)

**2026-06-28**

- website: Swap Jobs and Over ons in nav order (`ac28506`)

**2026-06-27**

- website: Fix #diensten anchor: add id to Split section so nav link scrolls correctly (`b0732e1`)
- website: Update hero subtitle text from old site (`b940fca`)
- website: Fix duplicate borderBottom property in VacaturesClient style object (`71240f7`)
- website: Connect website vacatures to CMS — live data from specified-cms.vercel.app (`01413d6`)
- website: Fix Simon Claeys LinkedIn URL (`027ebc0`)
- website: Verwijder Claude-patronen: labels, pijltjes, pill-knoppen (`a5696a0`)
- website: Fix TypeScript error: remove as const from shapes array (`e0b3605`)
- website: Simplify page shapes: 5 clean outlines, slow parallax, engineering aesthetic (`e385112`)
- website: Global 3D page shapes: 15 logo marks floating fixed across entire page on scroll (`1d4aedc`)
- website: Team section: fix Simon duplicate, add 7-shape 3D scroll animation with logo marks (`6be1317`)
- website: Redesign team section: full-width cards with real photos, lime panels, 3D scroll shapes (`89b3873`)
- website: Add real logo, team photos and footer from specified.be (`61d20d9`)

**2026-06-26**

- website: Initial build: Specified website with homepage, vacatures page, fonts, team photos (`8f705b8`)
- website: Initial commit from Create Next App (`6f15521`)

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
| `specified-cms/docs/MONITORING-EN-BACKUPS.md` | Uptime en nachtelijke back-ups instellen en terugzetten |
