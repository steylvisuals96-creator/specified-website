#!/usr/bin/env bash
# Zet de GitHub-secrets voor de nachtelijke back-up, stap voor stap.
# Elke stap kun je overslaan met Enter. Geheimen verschijnen niet op het scherm
# en komen niet in je shellgeschiedenis.
#
#   bash ~/specified-cms/scripts/zet-backup-geheimen.sh
#
# Proefmodus (zet niets, toont alleen wat er zou gebeuren):
#   PROEF=1 bash ~/specified-cms/scripts/zet-backup-geheimen.sh

set -uo pipefail

REPO="steylvisuals96-creator/specified-cms"
FOUTE_REPO="steylvisuals96-creator/specified-website"
PROJECT_REF="htkcrkafetzbnpznektz"
PROEF="${PROEF:-0}"

vet() { printf '\n\033[1m%s\033[0m\n' "$1"; }
ok() { printf '  \033[32m✓\033[0m %s\n' "$1"; }
fout() { printf '  \033[31m✗\033[0m %s\n' "$1"; }

zet() { # naam waarde
  if [ "$PROEF" = "1" ]; then ok "(proef) $1 zou gezet worden (${#2} tekens)"; return 0; fi
  if printf '%s' "$2" | gh secret set "$1" --repo "$REPO" > /dev/null; then ok "$1 gezet"; else fout "$1 niet gezet"; fi
}

vraag_geheim() { # prompt -> GEHEIM
  GEHEIM=""
  printf '%s' "$1"
  IFS= read -rs GEHEIM
  printf '\n'
}

echo "Back-up-geheimen voor $REPO"
[ "$PROEF" = "1" ] && echo "(proefmodus: er wordt niets gezet)"
command -v gh > /dev/null || { fout "gh ontbreekt"; exit 1; }

# 1. Databaseverbinding -------------------------------------------------------
vet "1/4  Databaseverbinding (rol backup_lezer)"
echo "  Supabase > project specified-cms > Connect > Session pooler: kopieer het adres."
echo "  Het mag [YOUR-PASSWORD] nog bevatten; dat is geen geheim."
# Onzichtbaar ingelezen: plakt iemand per ongeluk een wachtwoord, dan staat het niet in beeld.
printf '  Adres, begint met postgresql:// (onzichtbaar, Enter = overslaan): '
IFS= read -rs ADRES
printf '\n'
if [ -n "$ADRES" ]; then
  HOST="$(printf '%s' "$ADRES" | sed -nE 's#^postgres(ql)?://[^@]+@([^:/]+):([0-9]+)/.*$#\2:\3#p')"
  if [ -z "$HOST" ] || [[ "$HOST" != *pooler.supabase.com:5432 ]]; then
    fout "Dat lijkt geen session-pooleradres (begint met postgresql://, eindigt op pooler.supabase.com:5432/postgres). Stap overgeslagen."
  else
    ok "Adres herkend: $HOST"
    vraag_geheim "  Wachtwoord van backup_lezer (onzichtbaar): "
    if [ ${#GEHEIM} -lt 16 ]; then
      fout "Wachtwoord te kort of leeg. Stap overgeslagen."
    elif [[ "$GEHEIM" =~ [/+=@:%?#\ ] ]]; then
      fout "Het wachtwoord bevat / + = @ : % ? # of een spatie; die breken het adres. Maak er een met: openssl rand -base64 32 | tr -d '/+='"
    else
      URI="postgresql://backup_lezer.${PROJECT_REF}:${GEHEIM}@${HOST}/postgres"
      if command -v psql > /dev/null && [ "$PROEF" != "1" ]; then
        if psql "$URI" -XAtq -c "select 1 from payload.vacatures limit 1" > /dev/null 2>&1; then
          ok "Verbinding getest: backup_lezer kan lezen"
        else
          fout "Inloggen of lezen lukt (nog) niet. Is scripts/backup-rol.sql uitgevoerd met dit wachtwoord?"
          printf '  Toch opslaan? (j/N) '; read -r JN
          [ "$JN" = "j" ] || { URI=""; echo "  Overgeslagen."; }
        fi
      fi
      [ -n "$URI" ] && zet BACKUP_DATABASE_URI "$URI"
    fi
  fi
else
  echo "  Overgeslagen."
fi

# 2. Wachtwoordzin -------------------------------------------------------------
vet "2/4  Wachtwoordzin voor de versleuteling"
echo "  [g] nieuwe maken (komt in je klembord, bewaar hem in je wachtwoordbeheerder)"
echo "  [p] een bestaande plakken"
printf '  Keuze (Enter = overslaan): '
read -r KEUZE
case "$KEUZE" in
  g)
    ZIN="$(openssl rand -base64 32)"
    printf '%s' "$ZIN" | pbcopy
    echo "  De wachtwoordzin staat in je klembord. Zet hem NU in je wachtwoordbeheerder;"
    echo "  zonder deze zin is geen enkele back-up nog te openen."
    printf '  Bewaard? (j/N) '; read -r JN
    if [ "$JN" = "j" ]; then zet BACKUP_PASSPHRASE "$ZIN"; else echo "  Niet gezet."; fi
    ;;
  p)
    vraag_geheim "  Wachtwoordzin (onzichtbaar): "
    if [ ${#GEHEIM} -ge 20 ]; then zet BACKUP_PASSPHRASE "$GEHEIM"; else fout "Te kort (minstens 20 tekens). Overgeslagen."; fi
    ;;
  *) echo "  Overgeslagen." ;;
esac

# 3. Cloudflare R2 ---------------------------------------------------------------
vet "3/4  Cloudflare R2"
echo "  Account ID: Cloudflare > R2 > rechts op de overzichtspagina (32 tekens)."
printf '  Account ID (Enter = overslaan): '
IFS= read -r ACCOUNT
if [ -n "$ACCOUNT" ]; then
  if [[ "$ACCOUNT" =~ ^[0-9a-f]{32}$ ]]; then zet R2_ACCOUNT_ID "$ACCOUNT"; else fout "Verwacht 32 tekens 0-9/a-f. Overgeslagen."; fi
fi
echo
echo "  API-token: R2 > Manage API tokens > Create API token,"
echo "  rechten 'Object Read & Write', alleen bucket specified-backups."
printf '  Access Key ID (Enter = overslaan): '
IFS= read -r SLEUTEL_ID
if [ -n "$SLEUTEL_ID" ]; then
  if [[ "$SLEUTEL_ID" =~ ^[0-9a-f]{32}$ ]]; then
    zet R2_BACKUP_ACCESS_KEY_ID "$SLEUTEL_ID"
    vraag_geheim "  Secret Access Key (onzichtbaar): "
    if [[ "$GEHEIM" =~ ^[0-9a-f]{64}$ ]]; then zet R2_BACKUP_SECRET_ACCESS_KEY "$GEHEIM"; else fout "Verwacht 64 tekens 0-9/a-f. Overgeslagen."; fi
  else
    fout "Verwacht 32 tekens 0-9/a-f. Overgeslagen."
  fi
fi

# 4. Opruimen en overzicht -------------------------------------------------------------
vet "4/4  Opruimen en overzicht"
if gh secret list --repo "$FOUTE_REPO" 2> /dev/null | grep -q '^BACKUP_PASSPHRASE'; then
  printf '  In %s staat per ongeluk BACKUP_PASSPHRASE. Verwijderen? (j/N) ' "$FOUTE_REPO"
  read -r JN
  if [ "$JN" = "j" ] && [ "$PROEF" != "1" ]; then
    gh secret delete BACKUP_PASSPHRASE --repo "$FOUTE_REPO" && ok "Verwijderd uit $FOUTE_REPO"
  fi
fi

NODIG="BACKUP_DATABASE_URI BACKUP_PASSPHRASE R2_ACCOUNT_ID R2_BACKUP_BUCKET R2_BACKUP_ACCESS_KEY_ID R2_BACKUP_SECRET_ACCESS_KEY"
LIJST="$(gh secret list --repo "$REPO" 2> /dev/null | cut -f1)"
ONTBREEKT=""
for n in $NODIG; do
  if printf '%s\n' "$LIJST" | grep -qx "$n"; then ok "$n"; else fout "$n ontbreekt"; ONTBREEKT="ja"; fi
done

if [ -z "$ONTBREEKT" ]; then
  printf '\n  Alles staat erin. Nu een back-up starten? (j/N) '
  read -r JN
  if [ "$JN" = "j" ] && [ "$PROEF" != "1" ]; then
    gh workflow run backup.yml --repo "$REPO" && echo "  Gestart. Volgen: gh run watch --repo $REPO"
  fi
else
  echo
  echo "  Start het script opnieuw voor wat ontbreekt; wat er al staat, sla je over met Enter."
fi
