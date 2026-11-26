# Draaiboek Specified-website

Dit is de ene plek waar staat wat de website van Specified is, hoe die in elkaar zit en wat er nog open staat. Het gaat over de website (hoofdmap) en haar back-end, sinds 2026-11-15 in één repository. **Sinds 2026-11-15 (overstap) leest de website uit het nieuwe beheer** op Supabase en R2 zonder Payload (map `beheer/`, `specified-beheer.vercel.app`). De oude CMS op Payload (map `cms/`) is **sinds 2026-11-22 gepauzeerd** in Vercel (geeft 503); de gegevens staan nog in het schema `payload`. Terug naar de oude CMS kan alleen nog door het project `specified-cms` eerst weer te activeren en dan `NEXT_PUBLIC_DATABRON` weg te halen in het websiteproject.

**Bijhouden:** de delen 1 tot en met 8 schrijft Claude bij zodra iets verandert (regel staat in `CLAUDE.md`). Deel 9 (wijzigingslog) wordt automatisch uit git gebouwd bij elke commit, via `scripts/draaiboek-bijwerken.sh`. Buiten de markeringen in deel 9 niets met de hand wijzigen in dat deel.

Laatst handmatig nagekeken: 2026-11-26 (offerte getekend, opkuis, animaties, Engelse versie getest).

De ingevulde invullijst van de klant (2026-11-12) staat uitgewerkt in `BRIEFING.md`: wensen per pagina en functie, tegenstrijdigheden en gevolgen voor wat er nu staat.

---

## 1. Overzicht

| | Website | Oude CMS (niet meer gelezen) | Beheer (in gebruik sinds 2026-11-15) |
|---|---|---|---|
| Repo | `steylvisuals96-creator/specified-website` | zelfde repo, map `cms/` (oude repo `specified-cms` wordt gearchiveerd) | zelfde repo, map `beheer/` |
| Map lokaal | `~/specified-website` | `~/specified-website/cms` | `~/specified-website/beheer` |
| Live | `specified-website.vercel.app` | `specified-cms.vercel.app`, gepauzeerd sinds 2026-11-22 | `specified-beheer.vercel.app` (sinds 2026-11-15; lokaal poort 3004) |
| Stack | Next.js 16.4.6 (sinds 2026-11-22), React 19, Tailwind 4, GSAP, Lenis, Framer Motion | Next.js 16.3.6, Payload 3.90.2, Tailwind 4, shadcn, Tiptap | Next.js 16.4.6, React 19, Tailwind 4, supabase-js en @supabase/ssr, Tiptap, aws4fetch |
| Data | uit Supabase (`NEXT_PUBLIC_DATABRON=supabase`, sinds 2026-11-15); meteen bij opslaan via `/api/ververs`, anders na 60 s | Supabase Postgres, schema `payload` | Supabase Postgres, schema `public` met RLS; login en tweestapslogin via Supabase Auth |
| Media | Dienstenbeelden via het beheer; terugvalbeelden in `public/` | eigen mediaopslag op de CMS-server (zie deel 5) | Cloudflare R2, bucket `specified-media` (privé, beelden via `/m/<id>` met een ondertekende link) |
| Hosting | Vercel, deploy bij push naar `main` | Vercel, deploy bij push naar `main` | Vercel, deploy bij push naar `main`, root directory `beheer`, functies in Frankfurt (`fra1`) |

Klant: **Specified NV** (BE 0727.537.711), Veldkant 31a, 2550 Kontich. Engineering consultancy met eigen consultants, opgericht januari 2025, 13 mensen op de payroll en 32 in totaal. Oprichters Tom Wijdooghe en Simon Claeys; aanspreekpunt voor het project, facturen en storingen is Simon Claeys (Managing Partner). Algemeen adres op de site: `info@specified.be`. Gebouwd en gehost door SteylVisuals (Sam). De bestaande site op `specified.be` (gebouwd door Rocketship) draait nog; de nieuwe staat op de Vercel-adressen tot de livegang, gewenst op **2027-01-11**. Teksten van de klant zijn klaar op 2026-12-21.

**Stand 2026-11-26:** de offerte is door beide partijen getekend. De draaidag is op 2026-12-10 van 17u tot 21u. De Engelse versie en de Bullhorn-koppeling horen bij de opdracht (planning eind januari 2027).

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
| `/api/health` | Gezondheidscheck: site draait en bereikt de bron van haar inhoud, sinds de overstap Supabase (503 bij fout) |
| `sitemap`, `robots`, `opengraph-image` | SEO; JSON-LD op home met `legalName`, `vatID`, volledig adres en oprichtingsdatum |

Misschien later (invullijst): Over ons, Cases zonder klantnamen, Team, Evenementen.

De homepage gebruikt de herwerkte AI-sfeerbeelden van de pompinstallatie en de consultant met tablet in **Voor bedrijven** en **Voor engineers**. `Split` haalt ze op via de beheerlinks uit `lib/inhoud.ts`. Zonder ingesteld beheer gebruikt de website de lokale terugvalbeelden. De foto bij Voor engineers is hoger uitgelijnd in de liggende uitsnede, zodat helm en tablet samen in beeld blijven.

Mogelijke extra foto's voor de volgende beeldronde:

- **Voor bedrijven, bij Sectoren:** één breed beeld van een werkende productieomgeving. Per case kan later een foto van de gefotografeerde installatie mee.
- **Voor engineers, bij Waar je werkt:** een echt duo van consultants tijdens een test of werfbespreking. Dat laat zien hoe ze samenwerken op locatie.
- **Over ons, bij de founders:** tijdens de geplande shoot een gezamenlijk portret van Tom en Simon maken, naast de individuele portretten.
- **Blog:** per artikel een eigen cover die het onderwerp toont. Technische onderwerpen kunnen een AI-sfeerbeeld krijgen, cases gebruiken beeld uit het project.

### Formulieren (2026-11-12)

Vier formulieren uit één beschrijving (`lib/formulieren.ts`): sollicitatie bij een vacature, open sollicitatie, contact en aanvraag consultant. `components/Formulier.tsx` tekent ze, `app/api/formulier/route.ts` controleert opnieuw en mailt via Resend: een melding naar Specified (cv als bijlage, antwoorden gaat naar de bezoeker) en een bevestiging naar de bezoeker. Er wordt niets opgeslagen. Beveiliging: alleen eigen origin (de Origin-header is verplicht, sinds 2026-11-24), verborgen valkuilveld, minimale invultijd, 5 per 10 minuten per IP (per server), cv alleen pdf of Word tot 4 MB en sinds 2026-11-24 ook gecontroleerd op de eerste bytes van het bestand. De bevestiging aan de bezoeker bevat sinds 2026-11-24 alleen vaste tekst ("Hallo," en de bedanktekst), niet meer de ingevulde naam of de vacature.

Nodig in Vercel (website): `RESEND_API_KEY`, `FORMULIER_AAN` (ontvanger, later `Simon.claeys@specified.be`), `FORMULIER_VAN` (afzender op een in Resend geverifieerd domein). **Zonder geverifieerd domein bezorgt Resend alleen bij de eigenaar van het account**: de melding naar Simon en de bevestiging naar bezoekers werken dus pas na verificatie van `specified.be` in Resend (DNS-records). Zonder sleutels geeft het formulier in productie een nette foutmelding met het e-mailadres.

**Stand Resend (2026-11-22):** `specified.be` toegevoegd in het Resend-account van SteylVisuals, regio Ierland (`eu-west-1`), klik- en opentracking uit. Te zetten bij Cronos (nog niet gebeurd, aangevraagd via Simon): TXT `resend._domainkey` (DKIM-sleutel uit Resend), CNAME `send` naar `send.forge.rmta.net` en CNAME `rsend` naar `rsend-euw1.forge.rmta.net`. Geen botsing met bestaande records; MX, SPF op het hoofddomein en DMARC blijven ongewijzigd (DKIM en return-path op `send.specified.be` zijn uitgelijnd met DMARC). Daarna in Resend verifiëren, `RESEND_API_KEY` (alleen verzenden, alleen dit domein) door Sam in Vercel, dan `FORMULIER_VAN` `Specified <website@specified.be>` en `FORMULIER_AAN` (eerst Sam voor de test, daarna Simon) en de vier formulieren testen.

Alle teksten op de nieuwe pagina's zijn voorlopig (bron: invullijst, `lib/inhoud.ts`). Zelf geschreven en door Specified na te kijken: de drie stappen op Voor bedrijven, de FAQ-antwoorden, de omschrijvingen bij diensten en waarden, disclaimer en toegankelijkheidsverklaring.

### De hero (technische tekening)

SPECIFIED getekend als blad met titelblok. Elke letter heeft een callout (acrostichon: Studies, Projecten, Elektromechanica, Consultants, Industrie, Focus, Integratie, Extra mile, Drive). De tekening wordt natekend, callouts poppen op (`back.out`, bewust), en de hele hero is gekoppeld aan scroll. Op mobiel draait SPECIFIED op het einde naar horizontaal. Component: `components/HeroTekening.tsx`. Teksten: `lib/inhoud.ts` (`TEKENING_CALLOUTS`, `TEKENING`). Sinds 2026-11-26 staat bij de S "Studies, en procesoptimalisatie" (was "tijdelijke ondersteuning"). De andere regels komen van de huidige specified.be; Elektromechanica als specialisatie nog laten bevestigen door Simon.

### Bouwstenen

`Nav` (met `ThemaKnop`), `Pagina` (raamwerk met `Blok`, `Lijst`, `Stappen`, `Kenmerken`), `Formulier`, `HeroTekening`, `Disciplines` (scroll-scrub), `ScrollMomenten`, `Split`, `Jobs`, `VacaturesClient`, `Team`, `CTA`, `Footer`, `Logo` (hover als keyframes, vastgelegd), `Vizier` (CAD-muiswijzer, alleen desktop), `VloeiendScrollen` (Lenis, alleen desktop), `HashScroll`, `CookieBanner` en `AnalyticsGate`.

### Inhoud: waar komt tekst vandaan

| Wat | Bron |
|---|---|
| Hero-tekening, callouts, titelblok, diensten | `lib/inhoud.ts`, en per veld te overschrijven vanuit de CMS (live editor, deel 4) |
| Vacatures | CMS via REST, één plek: `lib/vacatures.ts` (labels, lijst, één vacature op slug). Is de CMS onbereikbaar, dan blijft de laatst gebouwde pagina staan. Met `NEXT_PUBLIC_DATABRON=supabase` uit het nieuwe beheer (zelfde vorm, zie `lib/beheer.ts`) |
| Teksten van de doorklikpagina's (Voor bedrijven, Voor engineers, Vacatures, Contact, FAQ, Open sollicitatie, bloglijst) en de gedeelde lijsten (profielen, sectoren, attesten, cijfers) | Beheer > Pagina's (sinds 2026-11-15). Beschrijving en standaardteksten in `lib/paginas.ts`, opgeslagen in `pagina_inhoud` (één rij per pagina). Juridische pagina's nog in de code |
| Blog, team, instellingen | CMS via REST (`lib/settings.ts`, `lib/blog.ts`) |
| Contact-e-mail, telefoon, LinkedIn, footertekst | Homepage-editor (global `website`, groep `contact`); leeg valt terug op `Instellingen` (`getSettings()`, sinds 2026-10-27). LinkedIn alleen als `https`-link |
| Cijfers (statistieken) | CMS `statistieken`, nu leeg, daarom verborgen |

### Beveiliging van de site

Security-headers in `next.config.ts`: CSP, HSTS, nosniff, frame-deny, referrer-policy, permissions-policy. De CSP heeft `'unsafe-inline'` voor scripts nodig (Next.js en Vercel Analytics), pas weg met nonces. Blog is dichtgezet tegen XSS (javascript:-links, koptags, JSON-LD). Cookiebanner is server-gerenderd, keuzes zijn gelijkwaardig, analytics pas na toestemming. Geen `x-powered-by`-header (2026-11-24). Elk `*.vercel.app`-adres krijgt `X-Robots-Tag: noindex, nofollow` (2026-11-24), zodat Google de site niet onder het tijdelijke adres opneemt; `specified.be` krijgt die header niet.

### Prestaties (meting 2026-09-27, lokale productiebuild)

Lighthouse mobiel: home 95 tot 97, vacatures 99, blog 93. Toegankelijkheid, best practices en SEO 100. LCP net boven 2,5 s op home en blog (full-screen poster deelt 4G-simulatie met de bundels).

Meting 2026-11-23 op productie (`specified-website.vercel.app`, PageSpeed Insights, mobiel): home 100, LCP 0,9 s. Blog 94, LCP 2,8 s: het LCP-element is de foto van het eerste artikel (23 KB AVIF, van de server in 0,1 s), maar in de 4G-simulatie deelde die de lijn met GSAP en ScrollTrigger (45 KB). Die kwamen op elke pagina en elk toestel mee via `VloeiendScrollen` in de layout, ook waar Lenis niet draait. Aanpassing: Lenis en GSAP worden pas geladen bij muis of trackpad zonder "beweging beperken". Na de build staat GSAP niet meer in de HTML van de blog; Next haalt het alleen nog na het laden op als prefetch van de homepage. Ook de `sizes` van de blogfoto's klopten niet (100vw op mobiel, 33vw bij twee kolommen) en zijn nu afgestemd op het raster. Lokaal getest: Lenis en de hero-tekening werken op desktop, op mobiel draait Lenis niet. Na de deploy: blog mobiel 100, LCP 1,2 s.

---

## 4. CMS en dashboard

### Nieuw beheer op Supabase en R2 (2026-11-15)

Gebouwd naast de oude CMS, in `beheer/` (uitleg en overstapstappen in `beheer/README.md`). Alleen wat Specified gebruikt: vacatures, blog, team, media, homepage-teksten, gebruikers, plus een logboek en account met tweestapslogin. Het recruitment-CRM gaat niet mee (zie beslissingen).

- **Look**: opbouw van de SteylVisuals-studio (matglas, trage gloed, glans onder de muis, glijdend blokje in de zijbalk, scherpstellen bij paginawissel, tabbalk op de telefoon) in de Specified-huisstijl: grafiet, limoen, Bebas Neue, Instrument Serif Italic als accent, IBM Plex Sans, radius 2px, tekenraster en maatlijnen onder de titels. Geen kapitalen-labels.
- **Live voorbeeld dat meescrollt** (wens Sam): bij Homepage staan de velden links en de echte website rechts (verkleind, met Desktop, Tablet en Mobiel); onder 1024 px plakt het voorbeeld bovenaan en schuiven de velden eronder door, op een telefoon start het in Mobiel. Klik je in een veld, dan scrollt het voorbeeld naar dat stuk en komt er een limoen kader met hoekmarkeringen en de veldnaam omheen; wat je typt verschijnt meteen. Voor de hero rekent de website de plek uit op de tijdlijn van de tekening (`heroScrollY` in `components/HeroTekening.tsx`), zodat callouts en titelblok echt in beeld staan. Werkt via `data-bewerk` op de elementen (aangevuld voor contact, footer en profielen) en `components/VoorbeeldFocus.tsx`. Blog en team hebben een live voorbeeld zonder meescrollen. Getest in de browser, eerst met een testframe (hero-callout, titelblok, blok voor engineers, contact) en daarna ingelogd in het echte scherm. Het beheer vraagt de website zelf of ze klaar is, omdat het frame anders zijn eerste melding kan missen.
- **Rich text**: Tiptap-document als JSON, op de server opnieuw opgebouwd uit een vaste lijst knopen; de website rendert met dezelfde lijst (`lib/richtekst.ts`). De inhoud uit Payload (Lexical) is in SQL omgezet.
- **Gebruikers**: accounts aanmaken met een uitnodigingslink die de beheerder zelf bezorgt (geen mailserver nodig); nieuwe inloglink bij een vergeten wachtwoord. Eerste account via `npm run gebruiker:maken` in `beheer/`.
- **Logboek**: database-trigger schrijft elke wijziging weg (wie, wat, wanneer); te zien bij Logboek en op het overzicht.
- **Meteen live**: na opslaan roept het beheer `/api/ververs` op de website aan (gedeeld geheim); anders binnen 60 s.
- **Getest op 2026-11-15**, ingelogd als Sam (creator, lokaal): overzicht, vacatures (lijst en formulier met de omgezette omschrijving), homepage-editor (meescrollen naar een callout, tekst meteen in het voorbeeld, niet opgeslagen), blog (testconcept aangemaakt, onzichtbaar voor de website, logboek met naam, en weer verwijderd), team, media, gebruikers, logboek, account, en de telefoonweergave. Daarvoor al: build en typecheck van beide apps, de deuren zonder login, RLS per rol in SQL, de website die uit Supabase leest en `/api/ververs`.
- **Uploaden getest** (2026-11-15): testbeeld via `/api/upload` naar R2, `/m/<id>` geeft een ondertekende link, beeld gekozen als teamfoto en zichtbaar op de website (lokaal, uit Supabase), daarna teamlid en beeld via het beheer verwijderd (ook uit R2). Een nepbestand (SVG-code als png) werd geweigerd. De bucket zelf weigert alles zonder handtekening.
- **Getest op Vercel (2026-11-15)**: testbeeld geüpload, geladen via het ondertekende R2-adres en weer uit de mediabibliotheek verwijderd. Op de homepage-editor de bestaande teksten opgeslagen zonder velden te wijzigen. Beide tests staan in het logboek, met de juiste Belgische tijd. De homepage-editor bevestigt dat de inhoud is opgeslagen zodra Supabase de bijgewerkte rij teruggeeft. De website leest voorlopig uit Payload.
- **Startinhoud media (2026-11-15)**: de vier bestaande websitebeelden uit `public/images/team/` en `public/images/beeld/` staan in `specified-media` en de Supabase-mediabibliotheek. De portretten heten in het beheer `tom-wijdooghe.jpg` en `simon-claeys.jpg`. De twee oorspronkelijke sfeerbeelden behouden hun bestandsnaam. Alle vier hebben een omschrijving voor schermlezers en zijn via de live beheerlinks gecontroleerd op identieke bestandsinhoud.
- **Dienstenbeelden homepage**: `specified-voor-bedrijven-v2.webp` en `specified-voor-engineers-v2.webp` staan in dezelfde bibliotheek, met een beschrijving en hun originele afmetingen. Beide live beheerlinks leveren exact de geüploade bestanden.
- **Founderportretten (2026-11-16)**: de goedgekeurde herwerkingen `tom-wijdooghe-portret-v4.webp` en `simon-claeys-portret-v4.webp` staan in R2 en zijn gekoppeld via **Website > Team**. Bij deze versie dienden de originele gezichten opnieuw als referentie voor de bewerking. De Team-profielen zijn gestart met de namen, rollen, bio's, volgorde en links uit de homepage. De vorige versies en de originele portretten blijven beschikbaar in de mediabibliotheek. De originele bestanden staan ook lokaal als terugval.
- **Simon zittend (2026-11-26)**: Sam wilde Simon ook zittend zoals Tom en bevestigde daarna de oorspronkelijke foto van `specified.be/wp-content/uploads/2025/03/Simon.jpeg` als bron voor zijn exacte gezicht. Zijn teamfoto is `simon-claeys-portret-v7-origineel-gezicht.webp`, aan dezelfde werktafel met technische tekening. Het hoofd is rechtstreeks uit de bronfoto overgenomen, met een zachte overgang langs de buitenrand. De centrale gezichtspixels zijn op gelijkheid gecontroleerd in het PNG-masterbestand. Het WebP staat in R2 en de mediabibliotheek, gekoppeld via **Website > Team**.
- **Teamfoto's (2026-11-26)**: de homepage toont ze via `next/image`, dus geschaald en in AVIF of WebP. Lokaal testen met echte beelden vraagt `NEXT_PUBLIC_BEHEER_URL=https://specified-beheer.vercel.app` bij zowel de build als de start.
- Tweestapslogin aanzetten getest (2026-11-22, account Sam). Nog niet getest: iemand uitnodigen.
- **Live getest** (2026-11-15, `specified-beheer.vercel.app`): inloggen, homepage-editor met het meescrollende voorbeeld van de live website, en een upload naar R2 (beeld zichtbaar via `/m/`, daarna verwijderd).
- **Verbeterd na de livegang** (2026-11-15): blogvoorbeeld al vanaf 1280 px en blog en team tonen meteen de huidige inhoud in het voorbeeld; tijden in Belgische tijd (Vercel draait in UTC); de proxy controleert alleen nog het token (3 ms in plaats van tot 200 ms) en de tweede stap en rol gebeuren in `lib/sessie.ts` met de geverifieerde gebruiker, zonder de Supabase-waarschuwing bij elke pagina; een account zonder profiel wordt uitgelogd met een melding in plaats van heen en weer te springen; het inlogscherm toont "link verlopen" en "geen toegang".
- Het script `gebruiker-maken` toonde het wachtwoord bij het typen (fout, hersteld op 2026-11-15: invoer nu echt onzichtbaar). Het eerste wachtwoord van Sam is daardoor op het scherm verschenen en moet gewijzigd worden.

### SEO-bot

In het beheer staat SEO-bot voor beheerders. Hij gebruikt Belgische zoekdata uit Google Search Console en vakonderzoek via Apify om SEO-titels en beschrijvingen voor zeven vaste pagina's te verbeteren. OpenAI schrijft na onderzoek maximaal één Vlaams blogconcept per week over industriële engineering. Het concept krijgt aanklikbare bronnen en optioneel een AI-cover in de R2-mediabibliotheek. Publicatie loopt via de blogeditor. Het beheerscherm bewaart de rapporten en toont de vorige en nieuwe metadata. Een beheerder kan voorstellen toepassen of verwerpen. Automatisch toepassen staat standaard uit.

Op 2026-11-16 is de goedgekeurde SEO-migratie uitgevoerd op het Supabase-productieproject. RLS staat op alle drie SEO-tabellen. De publieke Data API kan toegepaste metadata lezen en weigert toegang tot rapporten en voorstellen. Bij de controle waren er nul uitgevoerde rondes.

### Doorklikpagina's bewerkbaar (2026-11-15)

Wens Sam: alle pagina's waar je naartoe klikt moeten bewerkbaar zijn. Eén systeem voor allemaal:
- `lib/paginas.ts` op de website beschrijft per pagina de velden (tekst, tekstvak, lijst, rijen met meerdere velden) met de huidige tekst als standaard. `/api/pagina-schema` geeft die beschrijving; het beheer bouwt er zijn formulier uit (`beheer/components/PaginaEditor.tsx`, `ItemsVeld.tsx`), zodat website en beheer nooit uit elkaar lopen. Een nieuwe pagina bewerkbaar maken = een beschrijving toevoegen, een weergave in `components/paginas/Weergaven.tsx` en een rij in `pagina_inhoud` (migratie 04 als voorbeeld).
- De pagina's zijn weergaven die hun teksten als invoer krijgen; de echte pagina vult ze uit Supabase, het voorbeeld (`/voorbeeld/pagina/<pagina>?bewerk=<sleutel>`) uit het formulier. Elk element draagt `data-bewerk`, dus het voorbeeld scrollt mee zoals bij de homepage.
- Profielen, sectoren, attesten en cijfers staan op meerdere pagina's en zijn één keer aan te passen onder "Gedeelde lijsten". Kleine tekstwijziging daardoor: Voor engineers zegt nu ook "Onze consultants werken met deze attesten: ...".
- **Klik in het voorbeeld**: een link naar een pagina van de site opent de editor van die pagina (via `/naar?pad=`), met een waarschuwing bij niet opgeslagen wijzigingen; een vacature of artikel opent dat item. Links naar buiten en formulieren doen in het voorbeeld niets (anders kwam er een lege pagina of een echte mail).
- Nog niet bewerkbaar: privacy, cookies, disclaimer, toegankelijkheid en algemene voorwaarden (lange teksten, vragen een tekstverwerker). Een klik erop in het voorbeeld zegt dat.
- **Vacatures met live voorbeeld** (2026-11-16): de vacaturepagina is een weergave (`components/paginas/VacatureWeergave.tsx`) die ook in `/voorbeeld/vacature` draait. Vanaf 1280 px staat de pagina naast het vacatureformulier en scrollt ze mee naar het veld (ook de tekstverwerker, titel, lijsten en kenmerken). Het salaris komt nooit in het voorbeeld. Live getest op 1440 px: klik in "Wat we bieden" scrolt het voorbeeld naar dat blok.
- **Live getest** (2026-11-15, ingelogd als Sam): overzicht Pagina's, editor Voor bedrijven (typen in "Sectoren": voorbeeld scrolt mee en toont de tekst, niet opgeslagen), en een klik op "Neem contact op" in het voorbeeld opent de editor van Contact. Het voorbeeld schaalt niet meer als het op ware grootte past (scherper).

### Seizoensthema voor de website

Via **Website > Seizoensthema** in het beheer kiezen beheerders Standaard, Kerst, Winter, Lente, Zomer of Herfst. De technische tekening op de homepage krijgt per seizoen eigen ornamenten in de gewone huisstijlkleuren. Kerst heeft een lichtsnoer, doorlopende sneeuw en een sneeuwvlok boven het beeldmerk. Winter krijgt rijp in de hoeken, Lente ontluikende scheuten, Zomer een lage zon en Herfst dwarrelende bladeren. Bezoekers kunnen de kerstsneeuw verbergen. Bij verminderde beweging staan de ornamenten stil en valt er geen sneeuw. In het beheer kunnen ze het voorbeeld in licht of donker bekijken en de animatie opnieuw afspelen vóór het opslaan. Ze kunnen meteen wisselen of een begin- en/of einddatum opgeven in Belgische tijd. De einddatum is inbegrepen. Buiten de gekozen periode toont de website de standaardstijl. Dit is één instelling: een nieuw opgeslagen thema vervangt de vorige keuze.

De website leest de instelling publiek uit `public.seizoensthema`; alleen beheerders en creators kunnen wijzigen. Opslaan ververst de site met het bestaande cachemechanisme en schrijft een regel in het logboek. Migratie `20261115_05_seizoensthema.sql` is toegepast op Supabase met **Standaard** als startwaarde. De licht/donkerkeuze blijft bij de bezoeker.

### Oude CMS op Payload (gepauzeerd sinds 2026-11-22)

In de week na de overstap kwam er geen enkel verzoek meer binnen (Vercel-logboek, 7 dagen), ook niet op de koppelingen voor inkomende mail en Make. De website roept de oude CMS alleen aan zonder `NEXT_PUBLIC_DATABRON=supabase`. Daarom is het project gepauzeerd: het ging om afhankelijkheden die niet meer bijgewerkt worden. Opnieuw activeren kan in Vercel (Settings > General). De beschrijving hieronder blijft als naslag.

Eén codebase met twee ingangen:

| Pad | Wat | Wie |
|---|---|---|
| `/dashboard` | Eigen interface in de huisstijl | Elke ingelogde gebruiker |
| `/admin` | Standaard Payload-admin ("Geavanceerd beheer"), ingeklapt onder "Ruwe gegevens" | Alleen de creator |

### Vacatures beheren (2026-11-12)

Eén formulier voor nieuw en bewerken (`components/VacatureVelden.tsx`, `lib/vacatureVorm.ts`): kenmerken, jobomschrijving, profiel, nice to have, aanbod, status, plaatsingsdatum en zichtbaarheid. Daarvoor kon de klant de jobtekst alleen in `/admin` invullen, waar hij niet bij kan. Nieuwe velden: `uren`, `opleidingsniveau`, `talen`, en `slug` (vast adres op de website, automatisch uit de titel). Vakgebied kreeg de optie Automatisering. Salaris blijft een intern veld. De API geeft anoniem nu ook ingevulde vacatures terug (de website toont ze als ingevuld). Migratie `20261112_120830_vacature_velden`, op Supabase toegepast op 2026-11-12 (`scripts/sql/20261112_vacature_velden.sql`).

Het overzicht (`/dashboard`) toont de klant zijn vacatures en blogartikels; alleen de creator ziet nog pipeline en kandidaten. Menu voor de klant: Overzicht, Vacatures, Homepage, Blog, Team, Media, Gebruikers. Pipeline, Kandidaten, Sollicitaties, Bedrijven, Agenda en Activiteiten ziet alleen de creator nog (de pagina's zelf bestaan nog en zijn per URL bereikbaar voor wie ingelogd is).

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

- **Vercel**: drie projecten op dezelfde repo, deploy bij push naar `main`. `specified-website` bouwt de hoofdmap (zonder `cms/` en `beheer/`), `specified-cms` bouwt met root directory `cms` (gepauzeerd sinds 2026-11-22), `specified-beheer` met root directory `beheer` (aangemaakt 2026-11-15, functies in Frankfurt naast Supabase). Elk project slaat de build over als zijn deel niet veranderde (Ignored Build Step). Geheime variabelen van het beheer staan als "Sensitive" (achteraf niet leesbaar). `VERVERS_GEHEIM` (website) en `WEBSITE_VERVERS_GEHEIM` (beheer) zijn dezelfde willekeurige waarde, alleen in productie.
- **Supabase**: project `specified-cms` (ref `htkcrkafetzbnpznektz`, Frankfurt, gratis plan). Schema `payload` (oude CMS), niet via de Data API bereikbaar, anon en authenticated hebben geen rechten (nagekeken 2026-11-15: de Supabase-melding "RLS uit" op die tabellen is daardoor geen lek). Migratie uit MongoDB op 2026-09-26. Sinds 2026-11-15 ook schema `public` voor het nieuwe beheer (tabellen `profielen`, `vacatures`, `vacatures_intern`, `blog`, `team`, `media`, `pagina_inhoud`, `seizoensthema`, `wijzigingen`, alle met RLS) en schema `privaat` voor de rolfuncties. Migraties in `beheer/supabase/migrations/`.
- **Cloudflare R2**: bucket `specified-media` (aangemaakt 2026-11-15, West-Europa, privé, geen r2.dev-adres), in het Cloudflare-account van SteylVisuals. API-token `specified-media` met alleen Object Read & Write op die bucket. Gebruikt door het nieuwe beheer; beelden naar buiten via `/m/<id>` met een ondertekende link. **De oude CMS heeft R2 nooit gebruikt**: in geen enkele Vercel-omgeving van `specified-cms` staan R2-variabelen, dus uploads daar zouden op de tijdelijke schijf van Vercel belanden (de mediatabel was leeg, er is niets verloren). De scroll-frames van de hero (6,6 MB) staan nog op Vercel; verhuizen naar `media.specified.be` samen met de domeinverhuis.
- **Resend** (CMS en website sinds 2026-10-27; `FOUTMELDING_AAN` = steylvisuals96@gmail.com in beide Vercel-projecten, `RESEND_API_KEY` nog alleen in de CMS): serverfouten gaan via `instrumentation.ts` en `lib/foutmelding.ts` naar de beheerder, met een limiet op het aantal mails. Opgevangen fouten melden met `meldFout()` in het catch-blok.

### Monitoring en back-ups

Volledige handleiding: `cms/docs/MONITORING.md`.

- Uptime: Better Stack of UptimeRobot op `/api/health` van beide sites. Elke check raakt de database, zodat het gratis project niet na 7 dagen pauzeert.
- Back-up: **voorlopig geen**. De eigen nachtelijke back-up (GitHub Action, `pg_dump` naar R2) is op 2026-10-28 geschrapt, met workflow, scripts en secrets. Na de eerste betaling van Specified gaat Supabase naar het betaalde plan, dat zelf dagelijks een back-up maakt (7 dagen). Code terugvinden: CMS-commit `258f609`.

### Omgevingsvariabelen

Website: `NEXT_PUBLIC_CMS_URL` (optioneel), later `NEXT_PUBLIC_SITE_URL`; voor de formulieren `RESEND_API_KEY`, `FORMULIER_AAN`, `FORMULIER_VAN` en optioneel `FORMULIER_ANTWOORD`. Voor het nieuwe beheer: `NEXT_PUBLIC_DATABRON=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_BEHEER_URL` (zonder deze vertrouwt de site geen beheer als frame of beeldhost) en `VERVERS_GEHEIM`. CMS: `DATABASE_URI`, `PAYLOAD_SECRET`, `R2_*`, `EMAIL_WEBHOOK_SECRET`, `MAKE_SECRET`, Resend-sleutel. Beheer: zie `beheer/.env.example` (`SUPABASE_SECRET_KEY`, dezelfde `R2_*`, `WEBSITE_VERVERS_GEHEIM`, `MFA_VERPLICHT`). Waarden staan nooit in git of in dit document.

- **SEO-bot**: Vercel Cron op `specified-beheer` (maandag om 07.00 UTC), een geheime Bearer-token en een unieke week in Supabase. Verbruik inschakelen en controleren zoals beschreven in `beheer/README.md`. Nieuwe tabellen en toegangsregels staan in migratie `20261115_06_seo_bot.sql`.

---

## 6. Beveiliging, stand van zaken

- Website op Next.js 16.4.6 en sharp 0.35.5 (2026-11-22), net als het beheer: `npm audit` website en beheer 0. De oude CMS (Next.js 16.3.6, Payload 3.90.2) wordt niet meer bijgewerkt en gaat offline.
- Semgrep (OWASP, Next, React, TS, secrets): 0 bevindingen. Security review na back-end redesign: geen high of critical.
- Server actions in de CMS schrijven als de ingelogde gebruiker (`lib/serverPayload.ts`); eerder konden 11 acties zonder login schrijven, dat is dicht.
- Login-lockout 5 keer per 15 minuten, sessie 8 uur, geen interne foutmeldingen naar de client.
- Rolscenario's getest, 14 van 14.
- `teksten`-tabel: RLS aan zonder regels (Supabase-advies, niveau info). De leesregel en de rol van de back-up zijn verwijderd (2026-10-28).
- Bekend gat: het publieke e-mailendpoint heeft nog geen rate limiting.
- **Nieuw beheer** (2026-11-15): drie lagen (proxy, controle per pagina en actie, RLS in de database). Redactie-acties lopen als de ingelogde gebruiker. Gebruikersbeheer en de SEO-bot gebruiken de geheime Supabase-sleutel na controle van de rol of het cron-geheim. Salaris in een aparte tabel zonder publieke regel. Uploads alleen van het eigen domein, ingelogd, 4 MB, type uit de eerste bytes, geen SVG. Rich text opnieuw opgebouwd uit een vaste lijst. Tweestapslogin (TOTP) ingebouwd, verplicht te maken met `MFA_VERPLICHT=1`, en sinds 2026-11-23 ook in RLS afgedwongen voor wie een factor heeft (aal2 nodig). Loginrem 5 pogingen per kwartier per IP (per server) bovenop die van Supabase. Sinds 2026-11-24 vraagt wachtwoord wijzigen eerst de code uit de app aan wie tweestapslogin heeft, ook na een herstellink (eerst `/login/code`, daarna terug naar het wachtwoordscherm). RLS getest in SQL voor anoniem, zonder profiel, redacteur, beheerder en creator. Supabase-adviseur: geen waarschuwingen meer op de nieuwe tabellen.

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
| Nieuwe back-end rechtstreeks op Supabase en R2, zonder Payload | Projectregel en wens Sam (2026-11-15): minder lagen, login en tweestapslogin uit Supabase, RLS als laatste slot. Gebouwd naast de oude CMS in `beheer/`, overstap met één variabele op de website |
| Alleen wat Specified gebruikt in het nieuwe beheer; recruitment-CRM niet mee | Specified beheert volgens de invullijst alleen vacatures en blog, sollicitaties gaan per mail. Oude tabellen blijven als archief in `payload`. Later uitbreiden kan, op vraag van Specified (2026-11-15) |
| Look van de SteylVisuals-studio in de Specified-huisstijl | Sam vindt de studio mooi ogen; matglas en beweging overgenomen, kleuren, letters en radius van Specified (2026-11-15) |
| Live voorbeeld scrollt mee naar het veld, geen klik-op-de-pagina | Wens Sam (2026-11-15): de klant ziet waar de tekst staat zonder te zoeken. Klikken in het voorbeeld kan later nog |
| Uitnodigen met een link die de beheerder zelf bezorgt | Supabase verstuurt zonder eigen mailserver alleen mails naar het eigen team; zo werkt het meteen |
| Juridische naam Specified NV (niet BV) | Invullijst, aangepast in footer, privacy en JSON-LD (2026-11-12). De voettekst stond ook in de CMS (Homepage en Instellingen) en is daar rechtstreeks in Supabase gecorrigeerd |
| Repo blijft publiek; audits en beveiligingspunten buiten git | Keuze Sam (2026-11-22). Het draaiboek bevat alleen niet-gevoelige stand van zaken, beveiligingsactiepunten staan in de Studio |
| Paginatitels met een verticale streep ("Contact | Specified") in plaats van een lang streepje | Huisregel: geen lange streepjes in teksten (2026-11-24) |
| `noindex` op elk vercel.app-adres, ook na de livegang | Vóór de livegang geen indexering onder het verkeerde domein, daarna geen dubbele inhoud naast specified.be (2026-11-24) |
| De Engelse versie is Amerikaans Engels: spelling, "resume", "job openings", "general application" en datums als November 26, 2026. Adressen onder `/en` blijven gelijk | Wens Sam (2026-11-26); de huidige specified.be schrijft ook Amerikaans |
| Wekelijks SEO-onderzoek; AI-artikels eerst als concept | Teksten en bronnen blijven controleerbaar in het beheer; automatische metadata en betaalde covers zijn aparte opties |

---

## 8. Open punten

**Audit voor de livegang (2026-11-22)**

Specified is akkoord met de invoering. Sam heeft een audit van website, beheer en oude CMS; omdat deze repo publiek is, staan het rapport en de beveiligingspunten niet in git maar lokaal bij Sam en als taken 31 tot 48 in de Steylvisuals Studio (klant Specified NV). Niet-gevoelige vaststellingen:
- In het Vercel-project van de website ontbreken `RESEND_API_KEY`, `FORMULIER_AAN` en `FORMULIER_VAN` (nagekeken 2026-11-22): de formulieren werken live nog niet.
- DNS van `specified.be` staat bij **Cronos** (`ns1` tot `ns4.cronos.be`), registrar Key-Systems. MX naar Microsoft 365, SPF met `relays.cronos.be` en Bullhorn (`-all`), DMARC `p=quarantine`. Zonder DKIM-record van Resend gaan formuliermails naar spam. Dat beantwoordt de vraag naar registrar en DNS-beheer bij de livegang.
- De huidige site op `specified.be` is Engelstalig, met 18 URL's in de sitemap: `/about-us/`, `/services/`, `/services/career-partner/`, `/services/engineering-partner/`, `/jobs/`, `/jobs/spontaneous-application/`, vijf `/job/...`, `/contact/`, `/privacy-policy/`, `/cookie-policy/`, twee bedankpagina's en `/test-slider-home/`. Basis voor de 301's. Er bestaat dus al een privacy- en cookietekst.
- Simon heeft sinds 2026-11-22 een account in het nieuwe beheer (beheerder, nog zonder wachtwoord: hij kiest het zelf via een inloglink). Naam en e-mail van zijn collega zijn nog niet bekend.
- Alle 5 vacatures missen uren, opleiding en talen.

**Tweede audit (2026-11-23)**

Rapport lokaal bij Sam, niet in git. De snelle codepunten zijn op 2026-11-24 doorgevoerd (formulier, wachtwoord wijzigen, noindex op vercel.app, titels, `x-powered-by`). Niet-gevoelige open punten:
- [ ] De 404-pagina komt zonder inhoud en zonder `lang`-attribuut van de server; de browser bouwt ze pas zelf op. Waarschijnlijk komt dat doordat de root-layout onder `app/[taal]/` staat. Een catch-all met `dynamicParams` en `global-not-found` losten het niet op (getest 2026-11-24). De status blijft wel 404 met `noindex`. Waarschijnlijke verklaring (2026-11-26, niet apart bewezen): React toont bij de serveropbouw geen foutgrenzen, dus `notFound()` in de eerste opbouw levert een lege foutpagina. Nog niet geprobeerd: onbekende adressen in `proxy.ts` zelf met status 404 naar een gewone pagina sturen (vraagt daar een lijst van de routes).
- [ ] Bij de livegang `vercel.app` met een 308 naar `specified.be` laten doorverwijzen (Vercel, domeininstellingen).

**Overstap naar het nieuwe beheer (`beheer/`, gebouwd 2026-11-15)**
- [x] `SUPABASE_SECRET_KEY` lokaal gezet, account Sam (creator) aangemaakt, ingelogd en alle schermen nagelopen (2026-11-15).
- [x] Sam: wachtwoord gewijzigd bij Account en tweestapslogin (TOTP) aangezet (2026-11-22, nagekeken in Supabase).
- [x] Tweestapslogin ook afgedwongen in de Supabase RLS-regels (2026-11-23, migratie `20261123_01_tweestap_in_rls.sql`). Wie een geverifieerde factor heeft, krijgt de rechten van zijn rol pas met een token na de code (aal2); met alleen het wachtwoord ziet hij in de Data API enkel wat publiek is. Zonder factor verandert er niets. De controle zit in `privaat.tweede_stap_ok()`, aangeroepen door `mijn_rol`, `is_redactie` en `is_beheerder`, en dus door alle regels; "eigen naam wijzigen" kreeg ze er expliciet bij. Eerst in een teruggedraaide transactie en daarna live getest als Sam met aal1 en aal2, en als Simon zonder factor. `MFA_VERPLICHT=1` blijft een regel van de app: wie geen factor heeft, houdt in de database zijn rechten tot hij er een instelt.
- [x] R2 ingesteld: bucket `specified-media` en API-token aangemaakt, waarden lokaal in `beheer/.env.local`, upload lokaal getest tot op de website (2026-11-15). Dezelfde vier `R2_*`-waarden staan in Vercel. De live upload en het laden van het testbeeld zijn ook getest.
- [x] In Supabase nieuwe registraties uitgezet (Authentication > Sign In / Providers, 2026-11-22; publiek nagekeken: `disable_signup` true). Uitnodigen via Gebruikers en `npm run gebruiker:maken` werken nog, ze gebruiken de beheerderssleutel. Tegelijk de minimale wachtwoordlengte in Supabase op 12 gezet, gelijk aan wat het beheer eist. Accounts komen alleen via het beheer of het script; een account zonder profiel kan niets, maar dicht is beter.
- [x] Vercel-project `specified-beheer` aangemaakt met alle variabelen (2026-11-15). De website kreeg `NEXT_PUBLIC_BEHEER_URL` en `VERVERS_GEHEIM` (voorbeeld en meteen verversen); `NEXT_PUBLIC_DATABRON` nog niet, dus de live site leest nog uit de oude CMS. Later `beheer.specified.be`.
- [x] **Overstap gedaan (2026-11-15)**: vooraf vergeleken, de oude CMS was sinds 2026-10-27 niet meer gewijzigd en de inhoud in het beheer was identiek (vacatures, blog, homepage), dus het overstapscript had niets te doen. Daarna `NEXT_PUBLIC_DATABRON=supabase`, `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in het websiteproject gezet (beheer-adres en ververs-geheim stonden er al) en de website opnieuw gebouwd. Terug: `NEXT_PUBLIC_DATABRON` weghalen en opnieuw bouwen.
- [ ] Juridische pagina's bewerkbaar maken (privacy, cookies, disclaimer, toegankelijkheid, algemene voorwaarden), met de tekstverwerker van de blog. Sam: later.
- [ ] In Supabase "Prevent use of leaked passwords" aanzetten (Authentication > Sign In / Providers > Email). Kan alleen op het Pro-plan (nagekeken 2026-11-22), dus samen met de overstap naar het betaalde plan.
- [x] Leesregels op blog, team en vacatures samengevoegd tot één per rol (Supabase-advies 0006, migratie 05, 2026-11-16); wie wat ziet bleef gelijk (getest per rol).
- [x] Lus tussen inlogscherm en overzicht bij een sessie die de proxy nog goedkeurt maar Supabase niet meer: nu netjes uitgelogd met cookies gewist (`/auth/uitloggen`), 2026-11-15.
- [x] Account voor Simon aangemaakt (2026-11-22, beheerder). Hij krijgt nog een inloglink: Sam maakt die bij **Gebruikers > Nieuwe inloglink** (24 uur geldig) en stuurt ze samen met de handleiding. Daarin staat ook dat de oude CMS niet meer gebruikt wordt.
- [ ] Account voor de collega van Simon (beheerder) zodra naam en e-mail bekend zijn.
- [x] Voorbeeld in het beheer werd in een browser met een oude kopie van `/voorbeeld/home` geweigerd ("verbinding geweigerd"): de voorbeeldpagina's krijgen nu `Cache-Control: no-store`, het beheer laadt het frame na het laden van de pagina met een unieke parameter en toont na 12 s een melding met "Voorbeeld opnieuw laden" in plaats van eindeloos te laden (2026-11-15). Ook: de hero bouwt niet meer in een frame zonder maat (gaf NaN-fouten).
- [ ] `MFA_VERPLICHT=1` zodra Simon en zijn collega tweestapslogin hebben (accounts: zie hierboven).
- [ ] Wijzigingen in de oude CMS tussen 2026-11-15 en de overstap staan niet in Supabase: vlak voor de overstap `beheer/supabase/overstap-opnieuw-kopieren.sql` draaien in de SQL Editor. Nieuwe rijen komen erbij, bestaande alleen als de oude CMS nieuwer is, niets wordt verwijderd (het laatste resultaat toont wat alleen in het beheer staat). Proef gedraaid en teruggedraaid op 2026-11-15: 0 nieuw, 0 bijgewerkt, zoals verwacht.
- [ ] Een paar weken na de overstap: `cms/`, het Vercel-project `specified-cms` en het schema `payload` opruimen. Pas dan vervallen de punten over Payload hieronder. Stand 2026-11-22: project gepauzeerd, oude repo gearchiveerd. Het schema `payload` (met de oude kandidaatgegevens) pas wissen na akkoord van Specified, met vooraf een export als archief buiten de repo. Daarna de map `cms/` en de terugvalcode naar de oude CMS op de website weghalen (`CMS_URL` in `lib/` en `next.config.ts`).

**Afstemmen met Simon (tegenstrijdigheden uit de invullijst, zie `BRIEFING.md`)**
- [x] Pagina per vacature en één filter op vakgebied: gebouwd (2026-11-12), nog te bevestigen door Simon.
- [x] NL en EN gevraagd. Engelse versie gebouwd (2026-11-23): Nederlands op de huidige adressen, Engels onder `/en` met Engelse adressen. Nog door Simon na te lezen: Engelse standaardteksten en vertaalde juridische pagina's.
- [ ] Bullhorn-koppeling die sollicitaties doorstuurt: staat in de getekende offerte, nog niet gebouwd. Wacht op API-toegang via Bullhorn.
- [ ] Privacyverklaring bestaat "actueel" maar privacy- en cookieteksten en algemene voorwaarden "heb ik niet": bestaande teksten opvragen of laten opstellen. Wie is verantwoordelijk voor privacy?
- [ ] Bewaartermijn sollicitatiegegevens (advies: 1 jaar, 2 met toestemming).
- [ ] Betaalwijze: toelichting ontbrak in de invullijst.
- [ ] Slogans "We engineer possibilities" en "We are here to stay": voorstel doen.
- [ ] Concepten en publicatie inplannen voor vacatures en blog: voorstel doen.

**Wachten op de klant of Sam**
- [x] Offerte opgemaakt en door beide partijen getekend (2026-11-26), met één shootdag (foto en video, 3 à 4 mensen) en onderhoudsabonnement (reactie binnen 2 werkdagen, 1 à 2 kleine aanpassingen per maand).
- [ ] Livegang op `specified.be` (2027-01-11): domein naar Vercel, `NEXT_PUBLIC_SITE_URL`, CORS-lijst CMS, sitemap en canonical live controleren, status- en media-subdomein. Registrar, DNS-beheer, hosting en vervaldata zijn bij de klant onbekend: via de contactpersoon van Rocketship achterhalen. MX, SPF, DKIM, DMARC en autodiscover van Microsoft 365 (beheerd door Cronos) exact overnemen.
- [x] Permanente doorverwijzingen (308, door Google behandeld als 301) van de 18 oude URL's op `specified.be` naar de nieuwe, in `next.config.ts` (2026-11-22): about-us naar `/#over-ons`, services en engineering-partner naar Voor bedrijven, career-partner naar Voor engineers, jobs naar Vacatures, spontaneous-application naar Open sollicitatie, alle `/job/...` naar het vacatureoverzicht (oude vacatures hebben andere adressen), privacy- en cookiepolicy naar de nieuwe pagina's, bedankpagina's naar Contact en Vacatures, test-slider-home naar de homepage. Lokaal alle 18 getest: elk eindigt op een 200. Met slash achteraan zijn het twee sprongen (Next haalt eerst de slash weg). Werkt pas echt na de domeinverhuis; daarna in Search Console de oude adressen nakijken.
- [ ] Analytics en Search Console op een account van Specified zetten (huidige eigenaar onbekend).
- [x] SEO-bot: productiemigratie `20261115_06_seo_bot.sql` uitgevoerd en publieke toegangsrechten gecontroleerd (2026-11-16).
- [ ] SEO-bot: productievariabelen en Search Console-toegang toevoegen, verbruik bevestigen en na livegang de eerste ronde op `specified.be` uitvoeren.
- [ ] Later wil Sam Vercel AI Gateway koppelen voor tekst en optioneel beeld. [Parallel Search via AI Gateway](https://vercel.com/changelog/parallel-web-search-is-now-on-ai-gateway) is een mogelijke vervanger voor het Apify-vakonderzoek. Eerst de bruikbaarheid van Vlaamse vakbronnen en bronlinks vergelijken; Search Console blijft de bron voor Google-prestaties van Specified.
- [ ] Aanlevering van de klant: logo in vector, huisstijlgids, teksten, vacaturelijst, quotes en cases, cijfers en certificaten (zegt klaar te hebben). Teamfoto's en bio's ontbreken, komen uit de shootdag.
- [ ] Echte cijfers voor de statistieken: 32 consultants en 4 sectoren zijn bekend, klanten in cijfers en jaren ervaring nog niet. Bevestiging van de teksten uit `lib/inhoud.ts` (CMS bevat nog voorbeeldteksten uit de recruitment-richting).
- [ ] Concurrentie bekijken (Abylsen, TEC, TMC, ENGIE Talents, Pauwels Consulting) en het goede meenemen, op vraag van de klant.
- [x] Korte beheerhandleiding in pdf (2026-11-22): `beheer/docs/Beheerhandleiding-Specified.pdf`, bron `beheer/docs/handleiding.html` (opnieuw maken met Chrome headless, print-to-pdf).

**Bouwen volgens de invullijst**
- [x] Pagina's: Voor bedrijven, Voor engineers, Open sollicitatie, FAQ, Contact, Algemene voorwaarden (plaatshouder), Disclaimer, Toegankelijkheidsverklaring (2026-11-12).
- [x] Formulieren: sollicitatie met cv per vacature, open sollicitatie, contact, consultant aanvragen, met bevestigingsmail en melding (2026-11-12). Echt mailen is niet getest: zie volgende punt.
- [ ] **Formulieren activeren**: `specified.be` verifiëren in Resend (DNS), in het Vercel-project van de website `RESEND_API_KEY`, `FORMULIER_AAN` en `FORMULIER_VAN` zetten, en elk formulier één keer echt versturen. Tot dan tonen de formulieren een foutmelding.
- [x] Vacaturevelden in de CMS, pagina per vacature en JobPosting voor Google for Jobs (2026-11-12). Daarna de vacaturepagina's testen in Googles Rich Results Test zodra de site live staat.
- [ ] De 5 bestaande vacatures aanvullen met uren, opleiding en talen (velden zijn leeg), of vervangen door de lijst van Specified.
- [x] Licht thema met keuzeschakelaar (2026-11-12). De hero-tekening volgt het thema, ook het eindlogo (`--tek-mix`). Nog door Sam te beoordelen, vooral de hero-tekening en de teamfoto's in licht.
- [x] Dashboard voor de klant teruggebracht tot vacatures, blog, team, media en homepage; rollabels op de website zonder "Recruitment" (2026-11-12). De rol `consultant` bestaat nog; Specified wil 2 gebruikers met dezelfde rechten (beide beheerder maken).
- [ ] Vacature-alert per e-mail (inschrijven met bevestiging, uitschrijflink, mail bij nieuwe vacature). Vraagt opslag van adressen en een geverifieerd maildomein. Staat in de getekende offerte.
- [ ] Tweestapslogin voor het beheer (zie Techniek).
- [ ] Certificaten staan nu als tekst op Voor bedrijven en Voor engineers; verhalen van consultants nog te maken (inhoud van Specified nodig).
- [x] Overzicht van het dashboard voor de klant: vacatures (met link naar de website en wat nog ontbreekt) en blog (`components/KlantOverzicht.tsx`, 2026-11-12). De creator houdt het recruitmentoverzicht.
- [x] Engelse versie (2026-11-23): pagina's onder `app/[taal]/`, `proxy.ts` zet adressen om, taal via `lib/taal-server.ts` (root-params) en `components/TaalContext.tsx`. Teksten: `lib/teksten.ts`, `lib/inhoud-en.ts`, `STANDAARD_EN` in `lib/paginas.ts`. Beheer: schakelaar Nederlands/English bij Homepage en Pagina's, rijen `en:<sleutel>` in `pagina_inhoud` (migratie `20261123_01_engelse_teksten.sql`, op productie uitgevoerd). E-mail, telefoon en LinkedIn gedeeld. Vacatures en blog in hun eigen taal met Engelse labels; Engelse detailpagina canonical naar de Nederlandse, JobPosting alleen op NL. Oude Engelstalige specified.be-adressen sturen naar `/en`. Formulieren: Engelse meldingen en bevestiging, melding aan Specified Nederlands met "Taal: Engels".
- [ ] Engelse versie nalopen op mobiel (menu, taalknop) en met echte mail zodra Resend actief is. Menu en taalknop op 375 px nagekeken op 2026-11-26 (geen horizontaal scrollen); alleen de echte mail rest.
- [ ] Toegankelijkheid op WCAG 2.1 AA controleren met een echte toets (axe, schermlezer); de verklaring zegt nu eerlijk dat er nog geen onafhankelijke toets was. Toetsenbord en klikdoelen nagekeken op 2026-11-22. axe-core 4.10.3 (WCAG 2.0/2.1/2.2 A en AA plus best practices) op 2026-11-22 lokaal over 14 pagina's (home, vacatures, een vacature, voor bedrijven, voor engineers, open sollicitatie, blog, een artikel, FAQ, contact, disclaimer, toegankelijkheid, privacy, cookies, 404): 0 fouten. Wat axe niet zelf kon meten (contrast onder de korrellaag `body::after`) handmatig nagerekend: alle teksttinten halen AA in beide thema's (laagste bone-400 op ink-800 in het lichte thema, 5,86:1). Opnieuw draaien: `node_modules/axe-core/axe.min.js` tijdelijk naar `public/` kopiëren, in de console laden met een script-tag en `axe.run()` draaien, daarna weer weghalen. Nog te doen: VoiceOver (mens). Engelse versie op 2026-11-26 lokaal met axe getest (home, vacatures, een vacature, voor bedrijven, voor engineers, open sollicitatie, blog, een artikel, FAQ, contact, toegankelijkheid, privacy, cookies, disclaimer, voorwaarden): 0 fouten.
- [ ] SEO op "engineering consultancy" en "ingenieur jobs": titels en beschrijvingen staan, inhoud volgt met de teksten van Specified; kwartaalrapport met het aantal sollicitaties.
- [ ] `/api/formulier`: de limiet per IP geldt per server. Bij misbruik een gedeelde limiet toevoegen (Vercel Firewall of een teller in Supabase).

**Techniek**
- [ ] Supabase naar het betaalde plan zodra Specified de eerste factuur betaald heeft (dagelijkse back-ups). Tot dan is er geen back-up.
- [x] Rol `backup_lezer` verwijderd in Supabase (2026-10-28).
- [ ] Better Stack- of UptimeRobot-monitors aanmaken op beide `/api/health`.
- [ ] `RESEND_API_KEY` ook in het Vercel-project van de website zetten, en een echte proefmail sturen (`scripts/test-foutmelding.ts` in de CMS).
- [ ] Tweestapslogin voor alle gebruikers van het beheer, ook de klant: gevraagd in de invullijst. Ingebouwd in het nieuwe beheer (Account > Tweestapslogin, verplicht met `MFA_VERPLICHT=1`); actief na de overstap.
- [ ] Rate limiting en spambeveiliging op het publieke e-mailendpoint.
- [ ] MongoDB/Atlas en `MONGODB_URI` opruimen (30 dagen na de overstap, dus nu aan de beurt).
- [x] Audit-log (wie wijzigde wat): in het nieuwe beheer, via een trigger in de database (2026-11-15).
- [ ] Overblijfselen uit vastgoed in `dashboard/team/create` en `team/[id]/edit`.
- [x] LCP op home en blog onder 2,5 s (2026-11-23, PageSpeed Insights mobiel op productie): home 100 met LCP 0,9 s, blog van 94 met 2,8 s naar 100 met 1,2 s na het weghalen van GSAP uit het kritieke pad (zie Prestaties). Desktop beide 100.
- [x] Opkuis (2026-11-26): geen lintfouten meer in `lib/`, teamfoto's via `next/image`, indexen op `seizoensthema.gewijzigd_door` en `seo_voorstellen.besloten_door` (migratie `20261126_01_fk_indexen.sql`, op productie toegepast).
- [ ] Nog 5 lintfouten buiten `lib/` (`Nav`, `ThemaKnop`, `HeroTekening`, `HomeVoorbeeld`): React-regels over state, refs en globals. De site werkt; aanpassen vraagt apart testen van thema, taalknop en hero.
- [ ] `prefers-reduced-motion` in een echte browser emuleren en controleren.
- [ ] Scroll-frames naar R2 (met de domeinverhuis).
- [ ] CSP zonder `'unsafe-inline'` via nonces.
- [ ] Het in-page-editor-werk door Sam laten testen op productie.

**Animatieplannen** (`plans/`): ronde 1 (001 tot 005) is uitgevoerd. Van ronde 2 zijn 007 (contactonderlijn via transform) en 008 (mobiel menu zakt open) op 2026-11-26 uitgevoerd; 006 en 009 vervallen omdat die code niet meer bestaat. Zie `plans/README.md`.

**Niet samengevoegd werk**
- [x] Toegankelijkheidsfixes van `preview/audit-fixes-2` per onderdeel opnieuw toegepast op main (2026-11-22): Tab naar de knoppen in de hero springt naar het eindbeeld van de tekening (nu via Lenis, dat er sinds oktober bij kwam), cookiebanner meteen na de skip-link in de tabvolgorde en houdt onderaan ruimte vrij zodat focus er niet achter verdwijnt, klikdoelen van minstens 44px (logo's, footerlinks, LinkedIn-links), vizier uit bij forced-colors en prefers-contrast. Lokaal getest met echte Tab-toetsen. Niet overgenomen: inline styles naar klassen in vacatures en blog (die pagina's zijn sindsdien herschreven), streepjes en nav-achtergrond (aparte keuze). De branch kan daarna weg.

**CMS-doorlichting (2026-11-15)**

Wat goed zit: toegangsregels op één plek (`cms/lib/access.ts`), server actions draaien als de ingelogde gebruiker (`payloadAlsGebruiker`), R2 is privé met ondertekende links voor cv's, `PAYLOAD_SECRET` is verplicht, schema `payload` buiten de Data API, migraties zonder auto-push, loginblokkering na 5 pogingen, sessie 8 uur.

Wat beter kan, belangrijkste eerst:
- [ ] **Recruitment-CRM opruimen of bewust houden.** Het nieuwe beheer neemt het niet over (2026-11-15); het verdwijnt dus met de oude CMS, tenzij Specified het alsnog wil. Kandidaten, Bedrijven, Sollicitaties, Activiteiten, pipeline, agenda, inkomende mail (Postmark) en de Make-callback worden door de klant niet meer gebruikt (dashboard is teruggebracht tot vacatures, blog, team, media, homepage), maar bestaan nog als tabellen en endpoints. Dat zijn persoonsgegevens zonder bewaartermijn en extra aanvalsoppervlak. Voorstel: schrappen met een migratie, tenzij Specified er alsnog mee wil werken.
- [ ] **MongoDB weg**: `payload.config.ts` valt zonder `DATABASE_URI` stil terug op MongoDB met een lege URL in plaats van te stoppen. Fallback en `@payloadcms/db-mongodb` verwijderen.
- [x] **Wijzigingen meteen live**: opgelost in het nieuwe beheer via `/api/ververs` op de website (gedeeld geheim, 2026-11-15). De oude CMS blijft op 60 s.
- [ ] **Next 16**: `cms/middleware.ts` heet nu `proxy.ts` (de build waarschuwt).
- [ ] **Types delen**: de CMS heeft 164 keer `as any`, de website had 23 lintfouten op `any` in `lib/` (weg sinds 2026-11-26, vormen in `lib/cms-vormen.ts`). Nu beide in één repo staan, kan de website de types uit `cms/payload-types.ts` gebruiken.
- [ ] **Afhankelijkheden**: `@dnd-kit/*` wordt niet gebruikt (alleen `@hello-pangea/dnd`), `shadcn` is een CLI en hoort niet bij de runtime-afhankelijkheden, Tiptap in het dashboard naast Lexical van Payload vraagt een conversie (`cms/lib/lexical.ts`); op termijn één editor.
- [ ] **Kleine verstevigingen**: geheimen in `inbound-email` en `make-callback` vergelijken met `timingSafeEqual`; de Make-callback valideert de binnenkomende velden niet.
- [ ] **Overblijfselen uit vastgoed**: `cms/components/SomLogo.tsx` en verwijzingen in `dashboard/gebruikers/create`.
- [x] Oude repo `specified-cms` gearchiveerd op GitHub (2026-11-22, privé, alleen nog lezen). De branch `blog-automatisering` (wekelijks AI-blogconcept) hoefde niet mee: de SEO-bot in het nieuwe beheer doet dat. Eerder stond hier: eerst bekijken of dat werk mee moet.

**Documentatie die achterloopt**
- `cms/README.md` en `.env.example` noemen nog MongoDB en `MONGODB_URI`; de database is Supabase (`DATABASE_URI`). Ook de rollenlijst en de toegang tot `/admin` in de README zijn verouderd.
- De standaardwaarden in `cms/globals/Instellingen.ts` noemen nog "Specified BV" en "Engineering recruitment" (metatitel in de database ook). Niet aangepast: een andere standaardwaarde vraagt een migratie, en de website gebruikt de metatitel uit `lib/inhoud.ts`.
- Projectregels staan sinds 2026-11-15 ook uitgeschreven in `AGENTS.md`, zodat andere agents (Codex) ze lezen.
- Website en CMS staan sinds 2026-11-15 in één repo (`cms/`, met volledige geschiedenis via `git subtree`).
- `CLAUDE.md` bevat de regel "CMS direct op Supabase, zonder Payload". Die stap is op 2026-11-15 gezet met het nieuwe beheer in `beheer/`; de oude CMS op Payload draait nog tot de overstap.

---

## 9. Wijzigingslog

Wordt automatisch gevuld uit git (beide repo's, `main`) door `scripts/draaiboek-bijwerken.sh`. Niet met de hand wijzigen.

<!-- LOG-START -->
_Bijgewerkt: 2026-11-26 21:52_

### Nog niet op main

- branch `preview/audit-fixes-2`: 4 commit(s) voor op main
- branch `preview/hero-beweging`: 1 commit(s) voor op main
- branch `preview/streepjes-nav`: 1 commit(s) voor op main

### Op main

**2026-11-26**

- website: Engelse versie in Amerikaans Engels (`ef28b2f`)
- website: Werk Simons portret bij met ingetogener glimlach (`6550720`)
- website: Hero: bij de S Studies en procesoptimalisatie (`c9fa7a0`)
- website: Gebruik zittend portret van Simon naast Tom (`038d1e2`)
- website: Draaiboek: 404-punt scherper en wijzigingslog (`7fffe17`)
- website: Opkuis, animaties 007 en 008, Engelse versie getest (`a0e3ea0`)

**2026-11-24**

- website: Snelle verbeteringen uit de tweede audit (`fe6956c`)

**2026-11-23**

- website: Draaiboek: LCP blog na deploy 1,2 s (mobiel 100) (`04df84c`)
- website: Engelse versie van de website onder /en, met NL/EN-schakelaar in het beheer (`2616b2c`)
- website: Blog sneller op mobiel: GSAP alleen laden waar vloeiend scrollen draait (`af430d5`)
- website: Tweestapslogin ook in RLS afdwingen (`2c6ef0a`)

**2026-11-22**

- website: Doorverwijzingen van de 18 oude specified.be-adressen naar de nieuwe pagina's (`1236b70`)
- website: axe-core als ontwikkelpakket; axe-toets 14 pagina's zonder fouten (`1a04854`)
- website: Toegankelijkheid: hero-focus, cookiebanner in tabvolgorde, klikdoelen 44px, vizier uit bij hoog contrast (`51c3f82`)
- website: Draaiboek: specified.be toegevoegd in Resend, DNS-records voor Cronos (`5106c05`)
- website: Beheer: account Simon en korte beheerhandleiding (pdf) (`24a94c1`)
- website: Draaiboek: tweestapslogin voor Sam actief (`a85b3af`)
- website: Draaiboek: registraties dicht in Supabase, minimale wachtwoordlengte 12 (`20138ac`)
- website: Draaiboek: oude CMS gepauzeerd, oude repo gearchiveerd (`69a19b7`)
- website: Website naar Next.js 16.4.6, afhankelijkheden bijgewerkt (`7b9728e`)
- website: Draaiboek: audit voor de livegang, DNS bij Cronos, oude URL's en ontbrekende formuliervariabelen (`be3bc5d`)

**2026-11-16**

- website: Documenteer de bijgewerkte founderportretten (`cf06fd7`)
- website: Leg de portretcontrole op de preview vast (`125e457`)
- website: Documenteer de nieuwe founderportretten in Team (`cd4714e`)
- website: Maak de vijf seizoensthema’s duidelijker zichtbaar (`6146bb2`)
- website: Documenteer SEO-productiemigratie en latere Gateway-koppeling (`1debe43`)
- website: Draaiboek: vacaturevoorbeeld live getest (`c38367b`)
- website: Vacatures met live voorbeeld, leesregels samengevoegd, logboek per pagina (`da8f25c`)
- website: Voeg wekelijkse SEO-bot toe aan het Specified-beheer (`09dd4c1`)
- website: Gebruik herwerkte dienstenbeelden op de homepage (`2e5bd24`)
- website: Gebruik seizoensanimaties in de vaste huisstijl (`38959eb`)

**2026-11-15**

- website: Laat beheerders seizoensthema's voor de website plannen (`6ea7b36`)
- website: Draaiboek: doorklikpagina's live getest (`a9c5f96`)
- website: Beheer: voorbeeld zonder schaling als het op ware grootte past (`304adca`)
- website: Alle doorklikpagina's bewerkbaar in het beheer, klik in het voorbeeld opent de editor (`d3c6e59`)
- website: Website: gezondheidscheck controleert Supabase na de overstap (de code, vorige commit had alleen het draaiboek) (`2e40813`)
- website: Website: gezondheidscheck controleert Supabase na de overstap (`3d73bd6`)
- website: Overstap: website leest uit het nieuwe beheer; voorbeeld nooit meer uit de browsercache (`f5134c2`)
- website: Draaiboek: bestaande websitebeelden in het beheer (`04033fc`)
- website: Beheer: snellere sessiecontrole, voorbeeld bij blog op laptops, overstapscript (`b99ed09`)
- website: Beheer: bevestig homepage-opslag na controle in Supabase (`74bf0ba`)
- website: Beheer: tijden in Belgische tijd (server draait in UTC) (`c72ae73`)
- website: Beheer op Vercel: project specified-beheer, draaiboek bijgewerkt (`e0b8a2c`)
- website: R2 voor het beheer: eigen bucket, upload getest tot op de website (`9c125ab`)
- website: Beheer na test met echte login: voorbeeld ook op tablet en telefoon, wachtwoord onzichtbaar (`b2b5de3`)
- website: Nieuw beheer op Supabase en R2 zonder Payload, in de look van de studio (`9172301`)
- website: Website en CMS in één repo: tooling, draaiboekscript en documentatie aangepast, CMS doorgelicht (`b33f44e`)
- website: Projectregels in AGENTS.md voor andere agents, animatieplannen ronde 2 op main, draaiboek bijgewerkt (`9a99bfc`)

**2026-11-12**

- website: Hero volgt het thema tot in het eindlogo; kleine verbeteringen na nazicht (`7b488fd`)
- website: Invullijst toegepast: nieuwe pagina's, formulieren, vacaturepagina's en licht thema (`74fb806`)
- website: Invullijst verwerkt: briefing, draaiboek bijgewerkt, Specified NV met adres en ondernemingsnummer (`3a4dbe8`)
- cms: Dashboard: overzicht voor de klant met vacatures en blog; recruitment-termen weg (`8bb82f7`)
- cms: Vacatures: uren, opleiding, talen en vast adres; volledig formulier in het dashboard (`ca4e2f6`)

**2026-10-29**

- website: Lettertype: IBM Plex Sans voor tekst en UI (`bd5b31e`)
- cms: Lettertype: IBM Plex Sans in dashboard en admin, zoals de website (`5081ff3`)

**2026-10-28**

- website: Draaiboek: rol backup_lezer verwijderd (`7f99123`)
- website: Draaiboek: contact in Homepage-editor, Instellingen alleen creator, back-up geschrapt (`17c8029`)
- cms: Na inloggen naar Overzicht, Ruwe gegevens verborgen (`2e7a825`)
- cms: Eigen nachtelijke back-up geschrapt (`acfda27`)

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
- cms: Back-upscript: stap 1 overslaan als al ingesteld, wachtwoordzin onzichtbaar (`ef651ec`)
- cms: Back-upscript: poolerhost vast, geen adres meer nodig (`5d27057`)
- cms: backup-rol.sql: geen superuser-attributen in alter role (Supabase weigert dat) (`c62e4cd`)
- cms: Back-upscript maakt zelf het wachtwoord en zet de SQL in het klembord (`94babc5`)
- cms: backup-rol.sql werkt ook als de rol al bestaat (`0ac6524`)
- cms: Back-upscript: adres onzichtbaar inlezen (`003bb3d`)
- cms: Script dat de back-up-secrets stap voor stap zet (`e784bf6`)
- cms: Testscript foutmelding toont het echte antwoord van Resend (`b66ae32`)
- cms: Contactgegevens in de Homepage-editor (`e3e67c8`)
- cms: Menu: Instellingen alleen nog zichtbaar voor de creator (`a25d72a`)
- cms: Foutmeldingen per mail via Resend, met limiet (`aa5dbcc`)
- cms: Monitoring en nachtelijke back-ups (`258f609`)
- cms: Pop-up: titelblok van de tekening bewerkbaar (`20662b5`)
- cms: Pop-up: callouts van de tekening bewerkbaar (`a071c6e`)
- cms: Favicon: alleen het groene beeldmerk, zonder donkere achtergrond (`2d7517f`)
- cms: Op de pagina bewerken: klik een tekst, pas aan in een pop-up, opslaan (`17a2677`)
- cms: Favicon: Specified-beeldmerk in plaats van het standaard Next-icoon (`0a09302`)

**2026-10-26**

- website: Hero-tekening past op elk scherm: blad vult ook brede schermen, eindlogo boven de kop, telefoon dwars (`e8353d3`)
- website: Live voorbeeld: gedeelde artikelweergave en stabiele hero-herbouw (`896c1d0`)
- website: Homepage-teksten uit de CMS en live voorbeelden voor homepage en team (`032a46a`)
- website: Live voorbeeld voor blogartikelen vanuit het CMS (`d7f0b5a`)
- cms: Live editor in het dashboard: Homepage, Blog en Team met de website ernaast (`b979d21`)
- cms: Live editor: homepage-teksten in de CMS, voorbeeld voor homepage en team (`3f0e725`)
- cms: Live voorbeeld voor de blog in Payload; Geavanceerd beheer alleen voor de creator (`5b6a7c3`)

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
- cms: Beveiliging na review back-end redesign: strengere links en statuscontrole (`506be38`)
- cms: Admin-handleiding voor Specified (`adb7d27`)

**2026-09-26**

- website: Hero: sticky i.p.v. GSAP-pin (geen layout shift), frames pas na laden (`bb4b03b`)
- website: Blog: sluit XSS via javascript:-links, koptags en JSON-LD (`c8aa10b`)
- website: Beveiligingsupdates: Next.js 16.3.6 (middleware-bypass, server-actions-DoS) + npm audit fix, 0 bekende kwetsbaarheden (`94f2589`)
- website: Handtekening tekent met de scroll in plaats van per woord te herhalen (`7e52c60`)
- website: Kandidatenbeeld lichter gegrade: middentonen omhoog, olijftoon behouden (`ca2a696`)
- website: Scherpere turbine-frames: volle bronresolutie, lichtere compressie, minder zoom (`3c4d06b`)
- website: Turbine speelt af met de scroll: gepinde hero met framereeks op canvas (`2253e9b`)
- website: Turbine als naadloze videolus in de hero, scroll-rotatie vervangen door zoom (`d913f93`)
- cms: Back-office redesign: één huisstijl en één menu voor /dashboard en /admin (`af468b3`)
- cms: Ontwerpreferentie back-end: dashboard, kandidatenlijst, kandidaat-detail (`21bfa53`)
- cms: Beveiliging: headers, uploadbeperking, login-lockout, geen interne foutmeldingen (`8164aa1`)
- cms: Beveiligingsupdates: Payload 3.90.2 en Next.js 16.3.6 (`4f2c1b9`)
- cms: Overstap-script bouwt de adressen zelf uit de gekopieerde Atlas- en Supabase-regels (`7b2bdee`)
- cms: Supabase (Postgres) als database, met migratiescript vanuit MongoDB (`8002fb7`)

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
- cms: Beveilig server actions en voeg creator-rol toe (`09cca63`)

**2026-07-26**

- website: Zet security headers en maak de repo overdraagbaar (`a9e806f`)
- website: Vacatures tonen waar een ingenieur echt op beslist (`6627a8f`)
- website: Fix twee P0's: werkende cookieconsent en dode navigatie-anchors (`bbfba44`)
- cms: Laad de huisstijl-fonts in het dashboard (`cf64589`)
- cms: Beperk make-callback tot een allowlist en documenteer de overdracht (`8ccecc4`)
- cms: Dicht twee API-lekken en verwijder overgenomen vastgoedcode (`4318167`)
- cms: Beveilig CMS: sluit publieke API-toegang tot interne data af (`66843d6`)

**2026-07-21**

- website: Gebruik cover_url als fallback voor blogafbeeldingen zonder upload (`b74e833`)
- cms: Verwijder tijdelijke seed-covers route (`06ee263`)
- cms: Voeg cover_url veld toe aan Blog + fix seed-covers voor Vercel filesystem (`c796f1e`)
- cms: Tijdelijk: seed-covers route voor voorbeeldblogafbeeldingen (`f229f87`)

**2026-07-20**

- website: Fix build: voeg 'naam' toe aan SiteSettings-type (`ea55787`)
- website: Voeg blog toe aan website + SEO-fundament (`90d9534`)
- website: Menu "Jobs" verwijst naar de volledige vacaturepagina (`d15923b`)
- website: Fix teamfoto's: juiste uitsnede en portretformaat (`9ebc821`)
- cms: Verwijder tijdelijke seed-route (voorbeeldblogs zijn aangemaakt) (`988c786`)
- cms: Tijdelijke seed-route voor voorbeeldblogs (wordt hierna verwijderd) (`13c3072`)
- cms: Voeg Blog toe aan CMS (`477d807`)

**2026-07-19**

- website: Herstel desktop-layout (md:-classes werkten niet door inline stijlen) (`79f21f8`)
- website: Optimaliseer mobiele weergave (`797e12f`)

**2026-07-18**

- website: Fix menulinks: verwijs naar homepage-secties vanaf elke pagina (`c511d8e`)
- website: Vacaturepagina + legal footers uit CMS, 404-pagina, Speed Insights (`821d01b`)
- cms: Opruiming: verwijder SOM Vastgoed-restanten uit Specified CMS (`aa62555`)
- cms: Voeg vacatures_titel veld toe aan Instellingen (`913452e`)

**2026-07-17**

- cms: Fix SOM-gouden kleur → Specified lime in logo-upload & media-pagina (`142a3be`)

**2026-07-16**

- cms: Fix sticky formulier-header: maak main-gebied echte scroll-container (`c8a3b62`)

**2026-07-15**

- website: Website: alle homepage-content uit het CMS (`2dc8a29`)
- cms: Maak formulier-header (Opslaan/Annuleren) sticky bij scrollen (`852c7f3`)
- cms: Herbouw instellingen-dashboard voor Specified-website (`a84031c`)
- cms: CMS: alle homepage-content aanpasbaar maken (`b2d340e`)

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
- cms: Voeg Systeemstatus-widget toe aan dashboard (`f2f1afe`)
- cms: Maak Instellingen-global publiek leesbaar voor website-koppeling (`505a9c9`)
- cms: Fix build errors: unused import, where types, scripts uit tsconfig (`96e1388`)

**2026-07-04**

- cms: Fix ZoekFilter: verwijder useSearchParams, gebruik defaultValue prop (`0ad6dbd`)
- cms: Zoekbalken, CSV export, dashboard links fix, mobile CSS, Tom & Simon seed (`cfd501a`)
- cms: Voeg bewerk-drawer toe aan gebruikers pagina met rol-veld (`8924629`)
- cms: Verwijder admin.access uit payload.config (bestaat niet in v3) (`32ff3ab`)
- cms: Fix admin.access signature voor Payload v3 (`1c4372a`)
- cms: Blokkeer Payload admin voor niet-beheerders (`13cf53f`)
- cms: Inline create drawers voor team, gebruikers en activiteiten (`536767a`)
- cms: Vervang Payload admin link voor nieuwe vacature door inline drawer (`7570099`)
- cms: Vervang Payload admin links door inline create drawers (`75ee448`)
- cms: Fix SVG logo clipping in Payload admin by expanding viewBox (`63cc5c8`)
- cms: Close all edit drawers automatically after save (`ace46f5`)
- cms: Consistent '✏️ Bewerken' button on all list pages: kandidaten, bedrijven, sollicitaties, team (`85113a2`)
- cms: Remove Payload admin links: bedrijven detail, team drawer, gebruikers cleanup (`9b78395`)
- cms: Add VacatureEditDrawer — inline edit drawer in vacatures list (`6ce3635`)
- cms: Fix autoOpen destructuring in KandidaatEditDrawer (`028b9eb`)
- cms: Add edit pencil icon to kandidaten and vacatures list, auto-open drawer via ?edit=1 (`5cc5c14`)

**2026-06-28**

- website: Swap Jobs and Over ons in nav order (`ac28506`)
- cms: Revalidate dashboard and sollicitaties cache after pipeline drag-drop (`cd2919b`)
- cms: Fix tel_gescreend status showing as raw slug in sollicitaties overzicht (`b333f60`)

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
- cms: Add Agenda page with meeting calendar export (Google, Outlook, .ics) (`025444c`)
- cms: Fix build errors: remove invalid afterLogin route, move server action (`72639ff`)
- cms: Restyle FormShell to Specified branding (lime, dark, Avenir) (`3c68d47`)
- cms: Add inline activity drawer on kandidaat and bedrijf detail pages (`093c576`)
- cms: Redirect to /dashboard after login instead of Payload admin (`a2c1566`)
- cms: Add inline edit drawers for bedrijven, vacatures, sollicitaties (`374525c`)
- cms: Add inline edit drawer on kandidaat detail page (`3cbf0dd`)
- cms: Restyle Payload admin with Specified branding (`67a269b`)
- cms: Auto-BCC logging address on reply button via Instellingen (`28226ef`)
- cms: Make activity feed items expandable with full-text view and reply button (`5f24de6`)
- cms: Add Activiteiten collection with full email activity logging system (`386da42`)
- cms: Redirect /admin to /dashboard (`6cc997d`)
- cms: Show counts on pie chart slices + total in center (`4b330cc`)
- cms: Fix dashboard TS errors: avoid where spread, use as any for collections (`bc2f051`)
- cms: Fix: remove useSearchParams (no Suspense boundary) (`ffae87b`)
- cms: Add time range filter (vandaag/week/maand/kwartaal/alles) + trend badges on KPIs (`926499d`)
- cms: Add customizable dashboard — toggle widgets via slide-in panel (`db38ebd`)
- cms: Add recharts dashboard: sector bar chart, pipeline pie chart, improved KPIs (`145b844`)
- cms: Add Kanban pipeline board with drag-and-drop (`8488494`)
- cms: Rework admin CSS to use Payload v3 CSS variables correctly (`284dbdf`)
- cms: Use Specified website fonts in CMS: Bebas Neue + Avenir, larger & bolder (`70785e0`)
- cms: Rebuild custom dashboard with Specified branding and recruitment pages (`41ad79e`)
- cms: Add Specified admin theme — lime #dffd7b on dark #1e1e21 (`5123c4b`)
- cms: Init Specified CMS — HR recruitment voor engineering profielen (`6b19a62`)
- cms: Fix: notificaties alleen bij echte website-leads (contactformulier/website) (`6b942e0`)
- cms: Automatische duplicaatdetectie op e-mail, telefoonnummer en naam (`0e19c0b`)
- cms: Salesforce-achtige leads tabel: checkboxes, bulk acties, merge, verwijderen (`7c26baa`)
- cms: Fix build: verwijder ui-type veld zonder component in Instellingen (`0191271`)

**2026-06-26**

- website: Initial build: Specified website with homepage, vacatures page, fonts, team photos (`8f705b8`)
- website: Initial commit from Create Next App (`6f15521`)
- cms: Voeg 5 features toe: KPI dashboard, kalender, WhatsApp webhook, Google Calendar, Immoweb import (`3cc59cd`)
- cms: Fix kanban drag: voeg useDroppable toe aan kolommen voor lege kolommen als drop target (`2d9bd45`)
- cms: Lead pipeline uitbreiding: pipeline waarde, verlopen badge, makelaar filter, CSV export, tijdlijn, budget veld (`1b997d2`)
- cms: Kanban pipeline voor leads: drag-and-drop per status kolom, optimistic updates (`3f0efd4`)
- cms: Voeg Nieuwbouw collectie toe: naam, promotor, locatie, status, fotos, beschrijving (`e406d05`)
- cms: Breid Instellingen global uit: hero, over ons, contact, statistieken, socials (`ce79265`)
- cms: Herstel SOM branding in CMS admin: logo + icon via path strings in importMap (`bc16661`)
- cms: Revert "Fix admin importMap: page was importing from empty importMap instead of the correct one" (`0f2e80d`)
- cms: Fix importMap.ts: voeg S3ClientUploadHandler toe (TS bestand had prioriteit over .js) (`a38f63b`)

**2026-06-25**

- cms: Fix admin importMap: page was importing from empty importMap instead of the correct one (`3869f0c`)

**2026-06-24**

- cms: Fix importMap: voeg S3ClientUploadHandler toe van storage-s3 plugin (`6c75abe`)
- cms: Fix CMS admin: verwijder custom components tijdelijk om admin werkend te krijgen (`09f47d3`)
- cms: Fix CMS admin zwart scherm: registreer custom components in importMap (`459de5c`)
- cms: Fix CMS admin zwart scherm: genereer importMap voor elk build (`802e458`)
- cms: Verwijder tijdelijke seed-nieuws route na import (`520a304`)
- cms: Seed nieuws: verwijder tijdelijke auth check voor eenmalige import (`ed7d347`)
- cms: Voeg tijdelijke seed route toe voor 3 nieuwsberichten (`dcf4b1a`)
- cms: Fix R2 opslag: vervang storage-r2 door storage-s3 voor Node.js/Vercel compatibiliteit (`6a75614`)
- cms: Maak Nieuws en Testimonials collections publiek leesbaar via REST API (`076474a`)
- cms: Trigger redeploy: activate Cloudflare R2 media storage (`182a8b8`)
- cms: Fix server crash on edit page by adding use client to FormShell (`ec2abba`)

**2026-06-23**

- cms: Voeg Cloudflare R2 storage adapter toe voor media uploads (`aee8de2`)
- cms: Verwijder tijdelijke seed route (`d2056cf`)
- cms: Tijdelijke seed route voor demo panden (`99d8ac6`)
- cms: Maak panden en media publiek leesbaar + voeg CORS toe voor website (`963f7f5`)
- cms: Fix admin theme: gold accent via --color-base-*, dashboard component + card CSS (`b1114c0`)
- cms: Fix: beforeListTable lowercase (TypeScript fout) (`3a4c32e`)
- cms: Voeg verwijderknop met bevestiging en duplicate merge toe aan leads (`8d44ca0`)
- cms: Wijs nieuwe taken automatisch toe aan beschikbare makelaar (`12915a4`)
- cms: Voeg automatische bevestigingsmail toe aan leads (`4f11b0a`)
- cms: Add contactformulier bron option and fix API to use it (`2effe99`)
- cms: Fix bron value case: 'Website' -> 'website' to match collection enum (`9d1cd47`)
- cms: Remove invalid admin.css config option, CSS already loaded via layout (`065c9b1`)
- cms: Move admin CSS to styles/admin.css to avoid path issues (`66d9a5a`)
- cms: Add CORS headers to /api/contact endpoint (`b75d487`)
- cms: Add dark theme CSS to Payload admin panel (`364fb9f`)
- cms: Add public /api/contact endpoint for website contact form (`60a6281`)

**2026-06-22**

- cms: Add Claude AI integration: lead analysis, pand description generator, Make.com callback (`2795883`)
- cms: Add automations: auto-task on lead, appointment confirmation email, daily follow-up cron, weekly report cron, Zapier webhook (`a392119`)
- cms: Fix instellingen: custom edit form, correct field names, fix redirect loop (`bda6ec0`)
- cms: Redirect all /admin/collections/.../create and /:id routes to custom dashboard (`82637c7`)
- cms: Build custom create/edit forms for all collections with TipTap rich text and file upload (`56170f3`)
- cms: Improve Payload admin form styling: doc header, tabs, field layout, date picker (`9aa5afb`)
- cms: Add custom dashboard pages for Media and Instellingen, redirect all admin URLs (`96a06b0`)
- cms: Redirect Payload admin collection URLs to custom dashboard pages (`1ec35ca`)
- cms: Vervang alle redirect pagina's door echte dashboard views (Pagina's, Nieuws, Team, FAQ, Getuigenissen, Gebruikers) (`2e8104f`)
- cms: Fix: nuclear reset nav text-transform uppercase in Payload admin (`8715348`)
- cms: Voeg redirect pagina's toe voor Pagina's, Nieuws, Team, FAQ, Media, Gebruikers, Instellingen (`64342e5`)
- cms: Voeg detail pagina's toe voor Leads, Panden, Afspraken, Taken met statuswijziging (`9adf548`)
- cms: Bouw custom dashboard pagina's: Leads, Panden, Afspraken, Taken (`5bd37bf`)
- cms: Fix: nav items niet meer uppercase (`37f70bf`)
- cms: Premium CMS theme: Cinzel + DM Sans, gold accents, verfijnde spacing (`39ecce7`)

**2026-06-21**

- cms: Fix schrijffout: binnengekomens → binnengekomen (`2f7da8c`)
- cms: Trigger redeploy: fix webhook secret env var (`2f26fd3`)
- cms: Fix: gebruik onboarding@resend.dev als afzender voor lead notificatie emails (`5de9f8d`)

**2026-06-20**

- cms: Voeg Taken collectie, toegewezen_aan op Leads en email notificaties toe (`c189399`)
- cms: Restyle Payload admin to match dashboard look (dark + gold theme) (`383cee6`)
- cms: Webhook endpoint voor automatische lead import vanuit website (`c35b367`)
- cms: Volledig CMS uitgebouwd: Paginas, Nieuws, Team, Testimonials, FAQ, Afspraken + nieuw dashboard (`92ec313`)
- cms: Dashboard: SOM logo, goud thema, consistente styling (`4e717ad`)
- cms: Som Vastgoed brand theme: donker + goud, SOM logo in admin (`ecc6d52`)

**2026-06-19**

- cms: Force-dynamic op dashboard om MongoDB bij build te vermijden (`9878d57`)
- cms: Fix Payload type mismatch voor serverFunction prop (`14dd869`)
- cms: Init Som Vastgoed CMS met Payload — Panden, Leads, Media, Gebruikers (`9c47e35`)
- cms: Initial commit from Create Next App (`18f92fa`)

<!-- LOG-END -->

---

## Bijlage: waar staat wat

| Document | Inhoud |
|---|---|
| `DESIGN.md` | Het ontwerpsysteem: palet, typografie, motion, staten |
| `PLAYBOOK-STATUS.md` | Historisch bouwlogboek per fase, tot 2026-09-28 |
| `plans/` | Animatieplannen en hun status |
| `cms/docs/ADMIN-HANDLEIDING.md` | Handleiding voor Specified |
| `cms/docs/MIGRATIE-SUPABASE.md` | De overstap van MongoDB naar Supabase |
| `cms/docs/MONITORING.md` | Uptime-monitoring en foutmeldingen via Resend instellen |
