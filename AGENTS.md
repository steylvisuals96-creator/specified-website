<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Projectregels

Deze regels gelden voor elke agent (Claude Code, Codex, ...). Ze staan ook in `CLAUDE.md`.

- **CMS:** nieuw werk aan het beheer bouw je rechtstreeks op Supabase, zonder Payload. Foto's en video's staan in Cloudflare R2. (De huidige CMS in `../specified-cms` draait nog op Payload met Supabase als database; zie `DRAAIBOEK.md`.)
- **Git:** commit en push rechtstreeks naar `main`, in deze repo en in `../specified-cms`. Geen featurebranches of pull requests.
- **Draaiboek:** `DRAAIBOEK.md` is het draaiboek van website en CMS. Werk bij elke wijziging de handmatige delen 1 tot en met 8 bij (stand van zaken, beslissingen, open punten), draai daarna `scripts/draaiboek-bijwerken.sh` (bouwt deel 9, de wijzigingslog, uit git) en neem het bijgewerkte `DRAAIBOEK.md` mee in dezelfde commit. Dit geldt ook voor wijzigingen in `../specified-cms`.
- **Taal:** teksten op de site, commitberichten en documentatie in het Nederlands. Geen gedachtestreepjes (—) in teksten; gebruik een komma of koppelteken.

## Waar te beginnen

- `DRAAIBOEK.md`: wat de site is, hoe hij in elkaar zit, beslissingen en open punten (deel 8).
- `DESIGN.md`: design-systeem (kleuren, typografie, beweging). Vastgelegde keuzes daar niet heropenen.
- `BRIEFING.md`: wensen van de klant uit de invullijst.
- `plans/README.md`: openstaande animatieplannen met volgorde.
