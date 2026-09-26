#!/bin/zsh
# Overstap van MongoDB naar Supabase, in één keer. Zie docs/MIGRATIE-SUPABASE.md.
# Je plakt de adressen precies zoals Atlas en Supabase ze tonen (met <db_password>
# en [YOUR-PASSWORD] er nog in) en typt de wachtwoorden apart; het script bouwt
# de volledige adressen zelf. Niets wordt getoond of in de shell-geschiedenis bewaard.
set -e
cd "$(dirname "$0")/.."

echo "Atlas → Clusters → Connect → Drivers: kopieer de regel mongodb+srv://... zoals hij is."
read -r "ATLAS_REGEL?1/5  Atlas-regel: "
read -rs "ATLAS_WW?2/5  Wachtwoord van de Atlas-gebruiker 'migratie': " && echo
echo "Supabase → Connect → Direct → Session pooler: kopieer de regel zoals hij is."
read -r "SUPA_REGEL?3/5  Supabase Session-pooler-regel (poort 5432): "
read -rs "SUPA_WW?4/5  Supabase database-wachtwoord: " && echo
read -rs "CREATOR_WW?5/5  Nieuw wachtwoord voor jouw creator-account (min. 14 tekens): " && echo

# Adressen samenstellen: wachtwoorden URL-veilig, Atlas-gebruiker 'migratie',
# database 'specified-cms'. Controleert de vorm, zodat een verkeerde plak niets kan raken.
eval "$(ATLAS_REGEL="$ATLAS_REGEL" ATLAS_WW="$ATLAS_WW" SUPA_REGEL="$SUPA_REGEL" SUPA_WW="$SUPA_WW" python3 - <<'PY'
import os, re, shlex, sys
from urllib.parse import quote
a, aw = os.environ["ATLAS_REGEL"].strip(), os.environ["ATLAS_WW"]
s, sw = os.environ["SUPA_REGEL"].strip(), os.environ["SUPA_WW"]
m = re.match(r"^mongodb\+srv://[^:@/]+(?::[^@]*)?@([^/?]+)/?(\?.*)?$", a)
if not m or "mongodb.net" not in m.group(1):
    print("echo 'De Atlas-regel ziet er niet uit als mongodb+srv://...mongodb.net. Gestopt, er is niets gewijzigd.'; exit 1"); sys.exit()
atlas = f"mongodb+srv://migratie:{quote(aw, safe='')}@{m.group(1)}/specified-cms{m.group(2) or '?retryWrites=true&w=majority'}"
if not re.search(r"pooler\.supabase\.com:5432/", s) or "[YOUR-PASSWORD]" not in s:
    print("echo 'De Supabase-regel moet de Session pooler zijn (…pooler.supabase.com:5432/…) met [YOUR-PASSWORD] erin. Gestopt, er is niets gewijzigd.'; exit 1"); sys.exit()
supa = s.replace("[YOUR-PASSWORD]", quote(sw, safe=""))
print(f"ATLAS_URI={shlex.quote(atlas)}; SUPA_URI={shlex.quote(supa)}")
PY
)"

# Alleen voor deze scripts; het echte PAYLOAD_SECRET staat in Vercel.
SEED_GEHEIM="overstap-$RANDOM$RANDOM$RANDOM"

echo "\n== Stap 1: tabellen aanmaken in Supabase"
DATABASE_URI="$SUPA_URI" PAYLOAD_SECRET="$SEED_GEHEIM" npx tsx scripts/db-migratie.ts draai

echo "\n== Stap 2: data kopiëren (MongoDB → Supabase)"
MONGODB_URI="$ATLAS_URI" DATABASE_URI="$SUPA_URI" PAYLOAD_SECRET="$SEED_GEHEIM" npx tsx scripts/migreer-naar-supabase.ts

echo "\n== Stap 3: creator-account"
DATABASE_URI="$SUPA_URI" PAYLOAD_SECRET="$SEED_GEHEIM" CREATOR_EMAIL=steylvisuals96@gmail.com CREATOR_NAAM="Sam Steylaerts" CREATOR_WACHTWOORD="$CREATOR_WW" npx tsx scripts/seed-creator.ts

unset ATLAS_REGEL ATLAS_WW SUPA_REGEL SUPA_WW ATLAS_URI SUPA_URI CREATOR_WW SEED_GEHEIM
echo "\nKlaar. Volgende stap: DATABASE_URI in Vercel zetten (zie docs/MIGRATIE-SUPABASE.md, stap 4)."
