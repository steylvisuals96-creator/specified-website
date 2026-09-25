# Playbook-status — Specified redesign

Skill: `/nieuwe-website` · Branch: `redesign/signatuurmerk` · Gestart: 2026-09-25

## Keuzes
- Aanpak: redesign front-end, bestaande Payload-CMS (`specified-cms`, MongoDB + R2) blijft.
- Richting: **Signatuurmerk** (dir_signatuurmerk), leidend.
- Admin: bestaande CMS; rollen `beheerder`/`consultant` — creator-rol nog te bespreken (fase 4).

## Fase 0 — Intake & referentie
- [x] Klant, aanpak en richting bepaald
- [x] Huidige site geanalyseerd (Behouden / Vervangen / Content)
- [ ] Visuele referentie goedgekeurd
- [x] Portretten vrijstaand gemaakt (macOS Vision, randen 2px ingekort): `public/images/team/tom-vrijstaand.png`, `simon-vrijstaand.png`. Beperking: gsm-foto's 768×1024; fotoshoot later sterker.
- [x] 5 ontwerpbeelden gegenereerd (Higgsfield, GPT Image 2.5 high/2K, 13,75 credits, akkoord Sam): `design/referentie/1-hero … 5-contact.jpg`
- [x] Referentie goedgekeurd door Sam (poort 0 ok)

Let op bij bouwen: gezichten in de referentie zijn AI-hertekend (op de site de echte foto's); cijfers 240+/94%/3 wk en 'Sinds 2024' zijn placeholders, echte waarden komen uit de CMS of van de klant.

### Behouden
Logo/wordmark SPECIFIED · kleuren #1E1E21 / #323236 + limoen #DFFD7B · Bebas Neue koppen, Avenir tekst ·
belofte "We engineer possibilities" · alle content via CMS · cookieconsent, security-headers, revalidate 60.

### Vervangen
Pill-knoppen (radius 100px) · ↗-pijltjes · standaard sectie-opbouw · stats die "0+" tonen vóór animatie ·
geen signature scroll-moment.

### Content (uit CMS)
Hero, 8 disciplines, 4 stats, kandidaten/bedrijven, 5 recentste vacatures, founders Tom Wijdooghe & Simon Claeys, info@specified.be, Kontich.

## Fase 1 — Design-systeem
- [x] `DESIGN.md` geschreven (frontend-design): palet, typografie (Bebas Neue + Instrument Serif Italic + Instrument Sans i.p.v. niet-geladen Avenir), layout, componenten, motion, staten
- [x] Getoetst aan impeccable craft-floor: contrast ok (14,9 / 7,4 / 16,3:1); toegevoegd: browser-oppervlakken, lege/fout-staten, zichtbaar-zonder-JS, maatvoering 66ch
- [x] Door Sam gezien (poort 1 ok)
- Afwijkingen t.o.v. referentie: vacature-nummers 01–04 worden 'dagen online'; geen middle-dot-reeksen; geen mono-font; CursorGlow verdwijnt

## Fase 2 — Project & assets
- [x] Bestaand project hergebruikt (redesign), branch `redesign/signatuurmerk`, Vercel via GitHub-push
- [x] Motion-pakket (15 skills) in `.claude/skills/`, in `.gitignore` (niet meeleveren)
- [x] `gsap` + `@gsap/react` geïnstalleerd; fonts Instrument Sans + Instrument Serif Italic via next/font
- [x] `npm run build` slaagt
- [x] Assets: vrijstaande portretten aanwezig; geen video of 3D nodig voor dit ontwerp (geen extra Higgsfield-kost)
- [ ] Handtekeningen Tom & Simon (op papier) — placeholder tot aangeleverd
- [ ] Echte cijfers van Specified: CMS `statistieken` is leeg; live site toont hardcoded fallback (200+, 98%, 3 wk, 50+) uit `components/Stats.tsx`. Tot bevestiging tonen we geen cijfers.

Beslissing: geen smooth-scroll-laag (Lenis) — DESIGN.md vraagt stille motion; native scroll + één ScrollTrigger-scrub.

## Fase 3 — Front-end & scroll (klaar)
- [x] Tokens + basis (globals.css), oude variabelen gealiast zodat vacatures/blog/juridisch meekleuren
- [x] Nav, typografische hero (CSS-laadsequentie + handtekening), disciplines-scroll (GSAP ScrollTrigger scrub), diensten, vacatures (versheid ≤ 30 dagen), founders, contact, footer-band
- [x] Cut-outs geschrapt op vraag van Sam; hero zonder gezichten
- [x] 5 AI-sfeerbeelden gegenereerd (13,75 credits, akkoord Sam), 3 gebruikt: turbine (hero), engineer op de rug (kandidaten, olijf-gegraded), schakelkasten (bedrijven)
- [x] Gecontroleerd op 1440×900 en 375×812: geen horizontale scroll, hero past in het scherm
- [x] `turbopack.root` gezet: package.json in home-map verstoorde de dev-watcher
- [ ] Vacatures in CMS zijn ~90 dagen oud (versheid-cijfer daarom verborgen) — navragen bij Specified
- [ ] Bio Tom is Engels, Simon Nederlands — navragen bij Specified
- [x] Reduced motion: hero-sequentie, footer-band en disciplines-scrub staan achter `prefers-reduced-motion`; vacaturepagina (framer-motion) in `MotionConfig reducedMotion="user"`
- [x] Subpagina's (vacatures, blog, blogartikel, juridisch, 404, cookiebanner) in de huisstijl: geen ↗/←, radius 0, geen kapitalen-labels of eyebrows, ", " i.p.v. " · ", blogfoto's gegraded
- [x] Gecontroleerd op 375, 768 en 1440 px, geen horizontale scroll; productiebuild lokaal nagekeken (Vercel-preview zit achter login)
- Poort 3: gehaald

Totaal Higgsfield: 27,5 credits.

## Tussenstap — hero-video (klaar)
- Rotator + hertekenende handtekening + scroll-moment per sectie: klaar (commit f94a6d7)
- Turbine als naadloze videolus: 2 Kling 3.0 Pro-varianten (10 s, geen geluid, start = eind = `hero-turbine`), 30 credits, akkoord Sam
  - traag: Higgsfield job `0395f015-8b97-43e2-ab1d-d17c8727fd93`
  - sneller: Higgsfield job `757a6ba6-e614-4cf6-b870-24f22abcb926`
- Gekozen: variant 'sneller'; naad weggewerkt met 0,6 s crossfade (laatste↔eerste frame 98,6% gelijk)
- `public/videos/hero-turbine-1080.webm` (0,9 MB), `-1080.mp4` (1,2 MB), `-720.mp4` (0,5 MB, mobiel); poster = eerste frame
- Video laadt na eerste weergave, pauzeert buiten beeld, niet bij reduced motion/databesparing
- Scroll-rotatie vervangen door zoom (liet randen zien, melding Sam); beeld bedekt de hero altijd
- Later: video naar Cloudflare R2 verhuizen (playbook), nu in `public/`
- Totaal Higgsfield: 57,5 credits

## Fase 4 — Back-end & admin (code klaar, wacht op livegang)
Bestaande Payload-CMS (`specified-cms`, MongoDB + R2), branch `fase4/rollen-en-beveiliging`.
- [x] **Lek gedicht:** 11 server actions schreven zonder login-check via de Local API (overrideAccess). Nu: `lib/serverPayload.ts` controleert login en schrijft als de gebruiker.
- [x] Rollen: `creator` (Sam) > `beheerder` > `consultant`; creator onzichtbaar/onaantastbaar voor de klant; consultant kan eigen rol niet wijzigen
- [x] Instellingen alleen door beheerder/creator te wijzigen; rol in JWT (`/admin` werkte voorheen voor niemand)
- [x] `seed-users.ts` met hardgecodeerde wachtwoorden verwijderd; `seed-creator.ts` leest alles uit env
- [x] Getest op lokale testdatabase: 14/14 rolscenario's + dashboard/admin-redirects
- [ ] **Sam:** branch nakijken en naar `main` mergen (= productie)
- [ ] **Sam:** creator-account in productie seeden (eigen wachtwoord, via env) — Claude typt geen wachtwoorden
- [ ] **Specified:** Tom & Simon wachtwoord wijzigen (stond in git-geschiedenis van de privé-repo)
- [ ] MFA voor creator: Payload heeft geen ingebouwde MFA — plugin of SSO nodig
- [ ] Audit-log (wie wijzigde wat): nog niet aanwezig
- [ ] Overblijfselen vastgoed in `dashboard/team/create` en `team/[id]/edit` (velden bestaan niet in Team-collectie)
- Homepage-inhoud: disciplines (`sectoren`) en cijfers (`statistieken`) zijn in het instellingen-dashboard in te vullen; beide nu leeg

## Fase 5–6
Nog niet gestart.
