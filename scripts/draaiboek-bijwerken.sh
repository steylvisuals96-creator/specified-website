#!/usr/bin/env bash
# Bouwt deel 9 (wijzigingslog) van DRAAIBOEK.md uit de git-geschiedenis van
# website en CMS. Alles tussen LOG-START en LOG-END wordt vervangen.
#
# Gebruik:  scripts/draaiboek-bijwerken.sh
# Automatisch: draait via scripts/hooks/pre-commit bij elke commit in de website.
set -euo pipefail

WEBSITE="$(cd "$(dirname "$0")/.." && pwd)"
CMS="${CMS_DIR:-$WEBSITE/../specified-cms}"
DOC="$WEBSITE/DRAAIBOEK.md"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# Commits op main, nieuwste eerst, zonder merge-commits en zonder
# "Playbook-status"-regels (die zijn alleen bijhouden van het oude bestand).
log_van() { # $1 = map, $2 = label
  [ -e "$1/.git" ] || return 0
  git -C "$1" log main --no-merges --date=short \
    --pretty=format:'%ad|%h|%s' 2>/dev/null |
    grep -v -i '|Playbook-status' |
    awk -F'|' -v label="$2" '{ printf "%s|%s|%s|", $1, label, $2; for (i=3;i<=NF;i++) printf "%s%s", $i, (i<NF?"|":""); print "" }'
}

{
  log_van "$WEBSITE" website
  log_van "$CMS" cms
} | sort -t'|' -k1,1r -s | awk -F'|' '
  { datum=$1; label=$2; hash=$3; tekst=$4; for (i=5;i<=NF;i++) tekst=tekst "|" $i
    if (datum != vorige) { printf "\n**%s**\n\n", datum; vorige=datum }
    printf "- %s: %s (`%s`)\n", label, tekst, hash }
' >"$TMP.log"

# Werk dat nog niet op main staat.
{
  echo
  echo "### Nog niet op main"
  echo
  found=0
  for repo in "website:$WEBSITE" "cms:$CMS"; do
    label="${repo%%:*}"; dir="${repo#*:}"
    [ -e "$dir/.git" ] || continue
    while IFS= read -r br; do
      [ -z "$br" ] && continue
      n=$(git -C "$dir" rev-list --count "main..$br" 2>/dev/null || echo 0)
      [ "$n" -gt 0 ] || continue
      echo "- $label, branch \`$br\`: $n commit(s) voor op main"
      found=1
    done < <(git -C "$dir" for-each-ref --format='%(refname:short)' refs/heads | grep -v '^main$')
  done
  [ "$found" -eq 1 ] || echo "Niets: alles staat op main."
} >"$TMP.open"

{
  sed '/<!-- LOG-START -->/q' "$DOC"
  echo "_Bijgewerkt: $(date '+%Y-%m-%d %H:%M')_"
  cat "$TMP.open"
  echo
  echo "### Op main"
  cat "$TMP.log"
  echo
  sed -n '/<!-- LOG-END -->/,$p' "$DOC"
} >"$TMP"

rm -f "$TMP.log" "$TMP.open"
cat "$TMP" >"$DOC"
