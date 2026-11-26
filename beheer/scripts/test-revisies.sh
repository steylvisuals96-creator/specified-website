#!/usr/bin/env bash
# Start een eigen tijdelijke database; gebruikt nooit DATABASE_URL of productie.
set -euo pipefail
cd "$(dirname "$0")/.."
node --experimental-strip-types --test tests/revisies.test.ts
revisie_testmap="$(mktemp -d /private/tmp/specified-revisietest.XXXXXX)"
cleanup() {
  pg_ctl -D "$revisie_testmap/data" -m immediate stop >/dev/null 2>&1 || true
  python3 - "$revisie_testmap" <<'PY'
import shutil, sys
from pathlib import Path
p = Path(sys.argv[1])
if p.parent == Path('/private/tmp') and p.name.startswith('specified-revisietest.'):
    shutil.rmtree(p)
PY
}
trap cleanup EXIT
initdb -D "$revisie_testmap/data" -A trust --no-locale --encoding=UTF8 >/dev/null
pg_ctl -D "$revisie_testmap/data" -l "$revisie_testmap/log" -o "-k $revisie_testmap -h '' -p 55439" start >/dev/null
psql -X -h "$revisie_testmap" -p 55439 -d postgres -v ON_ERROR_STOP=1 \
  -f tests/revisies-bootstrap.sql \
  -f supabase/migrations/20261115_01_beheer_schema.sql \
  -f supabase/migrations/20261115_03_rolfuncties_naar_privaat.sql \
  -f supabase/migrations/20261123_01_tweestap_in_rls.sql \
  -f supabase/migrations/20261126_02_tweestap_verplicht_in_rls.sql \
  -f supabase/migrations/20261126_03_revisies.sql \
  -f tests/revisies.sql
