#!/bin/zsh
# Overstap van MongoDB naar Supabase, in één keer. Zie docs/MIGRATIE-SUPABASE.md.
# Vraagt alle geheimen verborgen op; niets komt in de shell-geschiedenis.
set -e
cd "$(dirname "$0")/.."

read -rs "ATLAS_URI?1/3  MongoDB-adres uit Atlas (bron, wordt alleen gelezen): " && echo
read -rs "SUPA_URI?2/3  Supabase 'Session pooler'-adres (poort 5432, met wachtwoord): " && echo
read -rs "CREATOR_WW?3/3  Nieuw wachtwoord voor jouw creator-account (min. 14 tekens): " && echo

case "$SUPA_URI" in
  postgres*supabase*) ;;
  *) echo "Dat lijkt geen Supabase-adres. Gestopt, er is niets gewijzigd."; exit 1 ;;
esac
case "$ATLAS_URI" in
  mongodb*) ;;
  *) echo "Dat lijkt geen MongoDB-adres. Gestopt, er is niets gewijzigd."; exit 1 ;;
esac

# Alleen voor deze scripts; het echte PAYLOAD_SECRET staat in Vercel.
SEED_GEHEIM="overstap-$RANDOM$RANDOM$RANDOM"

echo "\n== Stap 1: tabellen aanmaken in Supabase"
DATABASE_URI="$SUPA_URI" PAYLOAD_SECRET="$SEED_GEHEIM" npx tsx scripts/db-migratie.ts draai

echo "\n== Stap 2: data kopiëren (MongoDB → Supabase)"
MONGODB_URI="$ATLAS_URI" DATABASE_URI="$SUPA_URI" PAYLOAD_SECRET="$SEED_GEHEIM" npx tsx scripts/migreer-naar-supabase.ts

echo "\n== Stap 3: creator-account"
DATABASE_URI="$SUPA_URI" PAYLOAD_SECRET="$SEED_GEHEIM" CREATOR_EMAIL=steylvisuals96@gmail.com CREATOR_NAAM="Sam Steylaerts" CREATOR_WACHTWOORD="$CREATOR_WW" npx tsx scripts/seed-creator.ts

unset ATLAS_URI SUPA_URI CREATOR_WW SEED_GEHEIM
echo "\nKlaar. Volgende stap: DATABASE_URI in Vercel zetten (zie docs/MIGRATIE-SUPABASE.md, stap 4)."
