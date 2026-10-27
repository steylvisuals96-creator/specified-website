#!/usr/bin/env bash
# Back-up van de CMS-database (schema "payload") naar Cloudflare R2.
# Draait elke nacht via .github/workflows/backup.yml; lokaal testen kan ook.
#
# Nodig:
#   BACKUP_DATABASE_URI   verbinding als backup_lezer via de Supabase session pooler (poort 5432)
#   BACKUP_PASSPHRASE     wachtwoordzin; het bestand wordt ermee versleuteld (AES-256)
# Voor de upload (zonder deze drie blijft het bestand lokaal in ./backups):
#   R2_ACCOUNT_ID, R2_BACKUP_BUCKET, AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY
# Optioneel:
#   BACKUP_HEARTBEAT_URL  wordt na een geslaagde back-up opgeroepen (Better Stack / UptimeRobot)
#   MIN_TABELLEN          ondergrens voor het aantal tabellen in de dump (standaard 20)
#
# Terugzetten: zie docs/MONITORING-EN-BACKUPS.md

set -euo pipefail

: "${BACKUP_DATABASE_URI:?BACKUP_DATABASE_URI ontbreekt}"
: "${BACKUP_PASSPHRASE:?BACKUP_PASSPHRASE ontbreekt}"
MIN_TABELLEN="${MIN_TABELLEN:-20}"

STAMP="$(date -u +%Y-%m-%dT%H%MZ)"
NAAM="specified-cms-${STAMP}.dump.gpg"
WERK="$(mktemp -d)"
trap 'rm -rf "$WERK"' EXIT

# Tabellen met RLS maar zonder leesregel voor deze rol zouden hieronder stil
# leeg in de dump belanden. Liever afbreken (zie scripts/backup-rol.sql).
ZONDER_REGEL="$(psql "$BACKUP_DATABASE_URI" -XAtq -c "
  select string_agg(c.relname, ', ')
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'payload' and c.relkind = 'r' and c.relrowsecurity
    and not exists (
      select 1 from pg_policy p
      where p.polrelid = c.oid and p.polcmd in ('r', '*')
        and (0 = any(p.polroles) or (select oid from pg_roles where rolname = current_user) = any(p.polroles))
    )")"
if [ -n "$ZONDER_REGEL" ]; then
  echo "RLS zonder leesregel voor de back-uprol op: $ZONDER_REGEL" >&2
  echo "Voeg per tabel toe: create policy backup_lezen on payload.<tabel> for select to backup_lezer using (true);" >&2
  exit 1
fi

echo "Dump maken..."
# --enable-row-security: nodig omdat sommige tabellen RLS aan hebben; de
# leesregels voor backup_lezer geven alle rijen vrij.
pg_dump --format=custom --compress=9 --schema=payload --no-owner --no-privileges \
  --enable-row-security --file="$WERK/db.dump" "$BACKUP_DATABASE_URI"

# Controle: het archief is leesbaar en bevat (ongeveer) alle tabellen.
TABELLEN="$(pg_restore --list "$WERK/db.dump" | grep -c "TABLE DATA payload " || true)"
echo "Tabellen in de dump: $TABELLEN"
if [ "$TABELLEN" -lt "$MIN_TABELLEN" ]; then
  echo "Te weinig tabellen (minstens $MIN_TABELLEN verwacht). Back-up afgebroken." >&2
  exit 1
fi

echo "Versleutelen..."
gpg --batch --yes --quiet --pinentry-mode loopback --symmetric --cipher-algo AES256 \
  --passphrase-fd 3 --output "$WERK/$NAAM" "$WERK/db.dump" 3<<<"$BACKUP_PASSPHRASE"
rm -f "$WERK/db.dump"
echo "Grootte: $(du -h "$WERK/$NAAM" | cut -f1)"

if [ -n "${R2_BACKUP_BUCKET:-}" ] && [ -n "${R2_ACCOUNT_ID:-}" ]; then
  ENDPOINT="https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
  export AWS_DEFAULT_REGION=auto
  # R2 aanvaardt de nieuwste standaard-checksums van de AWS CLI niet altijd.
  export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
  export AWS_RESPONSE_CHECKSUM_VALIDATION=when_required

  echo "Uploaden naar R2 (dagelijks/)..."
  aws s3 cp "$WERK/$NAAM" "s3://${R2_BACKUP_BUCKET}/dagelijks/${NAAM}" \
    --endpoint-url "$ENDPOINT" --only-show-errors

  # Op de eerste van de maand ook een exemplaar dat langer bewaard blijft.
  if [ "$(date -u +%d)" = "01" ]; then
    echo "Ook naar maandelijks/..."
    aws s3 cp "$WERK/$NAAM" "s3://${R2_BACKUP_BUCKET}/maandelijks/${NAAM}" \
      --endpoint-url "$ENDPOINT" --only-show-errors
  fi
else
  mkdir -p backups
  mv "$WERK/$NAAM" "backups/$NAAM"
  echo "Geen R2 ingesteld: bewaard als backups/$NAAM"
fi

if [ -n "${BACKUP_HEARTBEAT_URL:-}" ]; then
  curl -fsS -m 10 --retry 3 "$BACKUP_HEARTBEAT_URL" > /dev/null || echo "Heartbeat mislukt (back-up zelf is wel gelukt)." >&2
fi

echo "Back-up klaar: $NAAM"
