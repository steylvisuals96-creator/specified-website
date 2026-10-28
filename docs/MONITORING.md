# Monitoring

Drie dingen houden de site in het oog:

1. **Uptime-monitoring**: een externe dienst roept om de paar minuten twee health-endpoints op en verwittigt je als er een faalt.
2. **Back-ups**: voorlopig geen; komt met het betaalde Supabase-plan.
3. **Foutmeldingen per mail**: serverfouten in de CMS en de website komen via Resend in je inbox, met een limiet (zie onderaan).

Een gratis Supabase-project zonder verkeer wordt na 7 dagen gepauzeerd; de uptime-checks voorkomen dat, want elke check raakt de database.

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

## 2. Back-ups

Geen eigen back-up meer (beslist 2026-10-28). Zodra Specified de eerste factuur betaald heeft, gaat het Supabase-project naar het betaalde plan: dat maakt elke dag zelf een back-up (7 dagen bewaard) en je kunt die in het dashboard terugzetten.

Tot dan is er **geen back-up** van de database. Een eerdere GitHub Action (pg_dump naar R2) is verwijderd; zie git-geschiedenis (commit 258f609) als je ze ooit terug wilt.

---

## 3. Foutmeldingen per mail (Resend)

### Hoe het werkt

- `instrumentation.ts` (in de CMS en in de website) vangt via Next's `onRequestError` elke serverfout op die niet zelf afgehandeld wordt: server actions, route handlers en server-rendering.
- Fouten die de code zelf opvangt, worden met `meldFout()` gemeld. Dat gebeurt nu bij de media-upload, de inkomende e-mail en het opslaan van de homepage.
- `lib/foutmelding.ts` stuurt een mail met project, route, pad (zonder querystring), foutmelding en de eerste 15 regels van de stack. Cookies en headers gaan niet mee.

### De limiet

- **Dezelfde fout hooguit één keer per uur.** Getallen en ID's worden eerst uit de foutmelding gehaald, zodat 'kandidaat 12 niet gevonden' en 'kandidaat 13 niet gevonden' als één fout tellen. De rem loopt via Resends `Idempotency-Key` en geldt dus over alle Vercel-servers heen.
- **Maximaal 10 mails per uur per server**, ook bij veel verschillende fouten tegelijk.
- In de volgende mail staat hoe vaak de fout intussen nog voorkwam.
- Niet gemaild: fouten door invoer van de gebruiker (status onder 500), redirects en 'niet gevonden'.
- Is Resend onbereikbaar, dan gaat er niets mis voor de bezoeker: de melder slikt zijn eigen fouten in.
- Alleen in productie. Lokaal komt er geen mail.

### Eenmalig instellen

1. Maak een account op resend.com, het liefst met het adres waarop je de meldingen wilt krijgen. Zolang er geen eigen domein geverifieerd is, kan Resend vanaf `onboarding@resend.dev` alleen naar dat adres mailen.
2. Resend → API Keys → *Create*, met recht *Sending access*.
3. Zet in Vercel, voor **beide** projecten (specified-cms en specified-website) en alleen voor Production:
   - `RESEND_API_KEY`: de sleutel
   - `FOUTMELDING_AAN`: je e-mailadres (meerdere adressen scheid je met een komma)
   - optioneel `FOUTMELDING_VAN`, bv. `Specified monitoring <monitoring@specified.be>`, zodra het domein bij Resend geverifieerd is (na de domeinverhuis)
4. Deploy beide projecten opnieuw.
5. Proefmail (plak bij `read -s` je sleutel en druk Enter; hij verschijnt niet op het scherm en niet in je geschiedenis):
   ```bash
   cd ~/specified-cms
   read -s RESEND_API_KEY && export RESEND_API_KEY
   FOUTMELDING_AAN=steylvisuals96@gmail.com npx tsx scripts/test-foutmelding.ts
   ```

Het gratis plan van Resend staat 100 mails per dag toe. Met de limiet hierboven blijf je daar ruim onder.

### Getest

Lokaal met een nagebootste Resend (2026-10-27): vijf keer dezelfde fout met een andere ID gaf één mail, en na een uur volgde een nieuwe mail met de teller. Bij 15 verschillende fouten stopte het na 10 mails. Fouten met status 400 en redirects werden overgeslagen. Een onbereikbare Resend liet niets mislukken, en zonder sleutel gebeurde er niets. Een echte mail via Resend is pas getest na stap 5.
