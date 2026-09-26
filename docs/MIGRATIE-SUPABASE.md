# Overstap MongoDB → Supabase

Supabase-project: `specified-cms` (ref `htkcrkafetzbnpznektz`, Frankfurt, Free plan).
Tabellen staan in het schema `payload`, dat Supabase niet via zijn publieke Data API openzet;
de rollen `anon` en `authenticated` hebben er bovendien geen rechten op.

## Wat de code doet

- `payload.config.ts`: gebruikt Postgres zodra `DATABASE_URI` gezet is, anders nog MongoDB.
- `migrations/`: het schema als Payload-migratie (`push` staat uit).
- `scripts/db-migratie.ts`: migraties maken/draaien en `payload-types.ts` genereren.
- `scripts/migreer-naar-supabase.ts`: kopieert alle collecties en de instellingen;
  leest MongoDB alleen, zet ID's om, bewaart wachtwoord-hashes en datums, en controleert
  de aantallen. Weigert als Supabase al data bevat (behalve met `--opnieuw`).
- `scripts/overstap-supabase.sh`: stap 1–3 hieronder in één keer, geheimen verborgen.

Getest op een lokale kopie: aantallen, relaties over meerdere niveaus, uploads, arrays,
afbeeldingen in rich text, datums, inloggen met het oude wachtwoord en de 14 rolscenario's.

## Overstap (± 15 minuten, niemand werkt ondertussen in de CMS)

Nodig:
- **Atlas**: het `mongodb+srv://…`-adres van de huidige database (Connect → Drivers).
- **Supabase**: Project Settings → Database → *Reset database password*; daarna Connect →
  kopieer het **Session pooler**-adres (poort 5432) én het **Transaction pooler**-adres (poort 6543),
  telkens met het wachtwoord ingevuld.

1–3. In de terminal, in deze map:
   ```bash
   ./scripts/overstap-supabase.sh
   ```
   Vraagt het Atlas-adres, het Session-pooler-adres en een nieuw creator-wachtwoord.
4. Vercel → `specified-cms` → Settings → Environment Variables → `DATABASE_URI` =
   het **Transaction pooler**-adres (6543), Production + Preview, markeren als *Sensitive*.
5. Branch `fase4b/supabase` naar `main` mergen → Vercel deployt.
6. Controleren: website toont vacatures, team en blog; inloggen op `/admin` werkt.
7. `MONGODB_URI` pas na 30 dagen uit Vercel en Atlas verwijderen (back-up).

## Terug naar MongoDB (als er iets misgaat)

`DATABASE_URI` in Vercel verwijderen en opnieuw deployen: de code valt dan terug op `MONGODB_URI`.
MongoDB is tijdens de overstap nooit gewijzigd.
