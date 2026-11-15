#!/usr/bin/env bash
# Bouwt deel 9 (wijzigingslog) van DRAAIBOEK.md uit de git-geschiedenis van
# website en CMS (map cms/). Alles tussen LOG-START en LOG-END wordt vervangen.
#
# Gebruik:  scripts/draaiboek-bijwerken.sh
# Automatisch: draait via scripts/hooks/pre-commit bij elke commit in de website.
set -euo pipefail

WEBSITE="$(cd "$(dirname "$0")/.." && pwd)"
DOC="$WEBSITE/DRAAIBOEK.md"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# Website en CMS staan sinds 2026-11-15 in één repo; de CMS zit in cms/ en is
# met `git subtree` binnengehaald, inclusief zijn eigen geschiedenis. Die oude
# CMS-commits herkennen we als tweede ouder van een merge op main waarvan de
# boom `payload.config.ts` in de hoofdmap heeft (de stand van de oude CMS-repo).
CMS_TIPS=""
for m in $(git rev-list --first-parent --merges main); do
  p2=$(git rev-parse "$m^2")
  if git cat-file -e "$p2:payload.config.ts" 2>/dev/null; then CMS_TIPS="$CMS_TIPS $p2"; fi
done
UITSLUIT=""; for t in $CMS_TIPS; do UITSLUIT="$UITSLUIT ^$t"; done

# Commits op main, nieuwste eerst, zonder merge-commits en zonder
# "Playbook-status"-regels (die zijn alleen bijhouden van het oude bestand).
opmaak() { # $1 = label
  { grep -v -i '|Playbook-status' || true; } |
    awk -F'|' -v label="$1" '{ printf "%s|%s|%s|", $1, label, $2; for (i=3;i<=NF;i++) printf "%s%s", $i, (i<NF?"|":""); print "" }'
}
FMT='--pretty=format:%ad|%h|%s'

{
  # shellcheck disable=SC2086
  git log main --no-merges --date=short "$FMT" $UITSLUIT -- . ':(exclude)cms' | opmaak website; echo
  # shellcheck disable=SC2086
  [ -n "$CMS_TIPS" ] && { git log --no-merges --date=short "$FMT" $CMS_TIPS | opmaak cms; echo; }
  # shellcheck disable=SC2086
  git log main --no-merges --date=short "$FMT" $UITSLUIT -- cms | opmaak cms; echo
} | grep -v '^$' | sort -t'|' -k1,1r -s | awk -F'|' '
  { datum=$1; label=$2; hash=$3; tekst=$4; for (i=5;i<=NF;i++) tekst=tekst "|" $i
    if (datum != vorige) { printf "\n**%s**\n\n", datum; vorige=datum }
    printf "- %s: %s (`%s`)\n", label, tekst, hash }
' >"$TMP.log"

# Werk dat nog niet op main staat (lokale branches).
{
  echo
  echo "### Nog niet op main"
  echo
  found=0
  while IFS= read -r br; do
    [ -z "$br" ] && continue
    n=$(git rev-list --count "main..$br" 2>/dev/null || echo 0)
    [ "$n" -gt 0 ] || continue
    echo "- branch \`$br\`: $n commit(s) voor op main"
    found=1
  done < <(git for-each-ref --format='%(refname:short)' refs/heads | grep -v '^main$')
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
