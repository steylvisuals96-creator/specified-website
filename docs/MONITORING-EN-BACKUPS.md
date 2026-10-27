# Monitoring en back-ups

Twee dingen houden de site in het oog:

1. **Uptime-monitoring**: een externe dienst roept om de paar minuten twee health-endpoints op en verwittigt je als er een faalt.
2. **Nachtelijke back-up**: een GitHub Action maakt elke nacht een versleutelde dump van de database en zet die in een aparte R2-bucket.

Het gratis Supabase-plan heeft geen back-ups die je zelf kunt downloaden, en een project zonder verkeer wordt na 7 dagen gepauzeerd. De back-up vangt het eerste op, de uptime-checks het tweede: elke check raakt de database.

---

## 1. Uptime-monitoring

### Endpoints

| URL | Wat het controleert | Fout |
| --- | --- | --- |
| `https://specified-website.vercel.app/api/health` | De website draait en krijgt vacatures en instellingen uit de CMS | 503 |
| `https://specified-cms.vercel.app/api/health` | De CMS draait en de database antwoordt binnen 5 s | 503 |

Geen van beide geeft inhoud terug, alleen ok of fout en een tijdstempel.

### Instellen in Better Stack (gratis)

1. Maak een account op betterstack.com (Uptime) en zet de app op je gsm voor pushmeldingen.
2. Voeg per URL hierboven een monitor toe:
   - Type: *Status code*, verwacht 2xx
   - Interval: 3 minuten
   - Bevestigingsperiode: 1 minuut, zodat één haperende check geen alarm geeft
   - Regio's: Europa
   - Melden via e-mail en push
3. Optioneel: een statuspagina met beide monitors. Na de domeinverhuis kan die op `status.specified.be` komen te staan.

UptimeRobot werkt ook (gratis, elke 5 minuten). De instellingen zijn dezelfde.

**Na de domeinverhuis (november):** zet de URL's om naar `https://specified.be/api/health` en het CMS-domein.

---

## 2. Nachtelijke back-up

### Hoe het werkt

- `.github/workflows/backup.yml` draait elke nacht om 02:17 UTC en kan ook met de hand gestart worden.
- `scripts/backup.sh`:
  - leest de database met de rol `backup_lezer`, die alleen mag lezen;
  - controleert of de dump leesbaar is en minstens 20 tabellen bevat;
  - breekt af als een tabel RLS aan heeft maar geen leesregel voor de back-uprol, want die tabel zou anders stil leeg in de back-up komen;
  - versleutelt het bestand met AES-256 (`gpg`) en zet het in R2 onder `dagelijks/`, op de eerste van de maand ook onder `maandelijks/`.
- Mislukt de back-up, dan mailt GitHub je. Met een heartbeat in Better Stack hoor je het ook als de Action helemaal niet draait.

### Eenmalig instellen

**a. R2-bucket** (Cloudflare → R2)
1. Maak een bucket `specified-backups`, privé, locatie Europa. Gebruik niet de mediabucket.
2. Settings → Object lifecycle rules:
   - prefix `dagelijks/`: verwijderen na 30 dagen
   - prefix `maandelijks/`: verwijderen na 365 dagen
3. R2 → Manage API tokens → *Create API token*: rechten *Object Read & Write*, alleen voor bucket `specified-backups`. Noteer de Access Key ID en de Secret Access Key.

**b. Databaserol** (Supabase → SQL Editor, project specified-cms)
1. Maak een wachtwoord aan: `openssl rand -base64 32 | tr -d '/+='`
2. Open `scripts/backup-rol.sql`, vervang `VUL_HIER_EEN_WACHTWOORD_IN` door dat wachtwoord en voer het uit in de SQL Editor. Bewaar het wachtwoord niet in het bestand.

**c. Verbindingsadres**
Supabase → Connect → *Session pooler* (poort 5432; de directe verbinding werkt alleen via IPv6, en dat heeft GitHub niet). Neem dat adres en vervang de gebruiker `postgres.htkcrkafetzbnpznektz` door `backup_lezer.htkcrkafetzbnpznektz` en het wachtwoord door dat van stap b:

```
postgresql://backup_lezer.htkcrkafetzbnpznektz:WACHTWOORD@aws-…pooler.supabase.com:5432/postgres
```

**d. Wachtwoordzin voor de versleuteling**
`openssl rand -base64 32`. Zet die **in je wachtwoordbeheerder**: zonder deze zin is geen enkele back-up nog te openen.

**e. GitHub-secrets**
Elke opdracht vraagt de waarde, zodat die niet in je shellgeschiedenis belandt:

```bash
cd ~/specified-cms
gh secret set BACKUP_DATABASE_URI
gh secret set BACKUP_PASSPHRASE
gh secret set R2_ACCOUNT_ID
gh secret set R2_BACKUP_BUCKET
gh secret set R2_BACKUP_ACCESS_KEY_ID
gh secret set R2_BACKUP_SECRET_ACCESS_KEY
```

`R2_ACCOUNT_ID` is dezelfde als in Vercel. Voor `R2_BACKUP_BUCKET` vul je `specified-backups` in.

**f. Heartbeat (aanbevolen)**
Better Stack → Heartbeats → nieuw, verwacht elke 1 dag, speling 2 uur. Zet de URL in `gh secret set BACKUP_HEARTBEAT_URL`. Komt er een nacht geen back-up, dan krijg je een melding.

**g. Testen**

```bash
gh workflow run backup.yml
```

Bekijk het resultaat met `gh run list --workflow backup.yml` en controleer of het bestand in R2 onder `dagelijks/` staat.

### Terugzetten

1. Download het bestand uit R2, bv. `specified-cms-2026-10-28T0217Z.dump.gpg`.
2. Ontsleutelen:
   ```bash
   gpg -d specified-cms-….dump.gpg > herstel.dump
   ```
3. Eerst **testen in een lege database**, bv. lokaal:
   ```bash
   createdb herstel && pg_restore --no-owner -d herstel herstel.dump
   ```
4. Alles terugzetten op productie (overschrijft het schema `payload`). Doe dit alleen bewust, met de directe `postgres`-verbinding:
   ```bash
   pg_restore --clean --if-exists --no-owner -d "$DATABASE_URI_POSTGRES" herstel.dump
   ```
5. Na het terugzetten hebben `backup_lezer` en de leesregel op `teksten` hun rechten verloren. Voer `scripts/backup-rol.sql` opnieuw uit, zonder de regel `create role`.

Media (foto's, cv's) staan niet in deze dump. Die staan in de R2-mediabucket. Wil je ook daar een kopie van, zet dan *Object versioning* of een tweede bucket met replicatie aan in Cloudflare.

### Getest

Lokaal op Postgres 17 (2026-10-27): de dump bevat alle rijen, ook van een RLS-tabel en van een tabel die na de rol is toegevoegd. Het bestand is versleuteld, terugzetten levert dezelfde aantallen op en `backup_lezer` kan niet schrijven. Het script breekt af bij te weinig tabellen en bij een RLS-tabel zonder leesregel. De Action zelf en de R2-upload zijn pas getest na stap g.
