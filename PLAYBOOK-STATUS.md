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
- [ ] Door Sam gezien (poort 1)
- Afwijkingen t.o.v. referentie: vacature-nummers 01–04 worden 'dagen online'; geen middle-dot-reeksen; geen mono-font; CursorGlow verdwijnt

## Fase 2–6
Nog niet gestart.
