-- Eenmalig in Supabase > SQL Editor (project specified-cms), VÓÓR de CMS-commit
-- "Contactgegevens in de Homepage-editor" live gaat.
-- Zelfde inhoud als migrations/20261027_214106_website_contact.ts, plus de
-- registratie in payload_migrations zodat Payload hem later niet opnieuw draait.
-- Alleen toevoegen: er wordt niets verwijderd of overschreven buiten de nieuwe kolommen.

BEGIN;

ALTER TABLE "payload"."website" ADD COLUMN "contact_email" varchar;
ALTER TABLE "payload"."website" ADD COLUMN "contact_telefoon" varchar;
ALTER TABLE "payload"."website" ADD COLUMN "contact_linkedin" varchar;
ALTER TABLE "payload"."website" ADD COLUMN "contact_footer_tekst" varchar;

-- Huidige waarden uit Instellingen overnemen.
UPDATE "payload"."website" w SET
  "contact_email" = NULLIF(TRIM(i."contact_email"), ''),
  "contact_telefoon" = NULLIF(TRIM(i."telefoon"), ''),
  "contact_linkedin" = NULLIF(TRIM(i."linkedin"), ''),
  "contact_footer_tekst" = NULLIF(TRIM(i."footer_tekst"), '')
FROM (SELECT * FROM "payload"."instellingen" LIMIT 1) i;

INSERT INTO "payload"."payload_migrations" ("name", "batch") VALUES ('20261027_214106_website_contact', 5);

COMMIT;

-- Controle: moet één rij tonen met het e-mailadres, LinkedIn en de footer.
SELECT contact_email, contact_telefoon, contact_linkedin, contact_footer_tekst FROM "payload"."website";
