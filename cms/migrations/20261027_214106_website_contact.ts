import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."website" ADD COLUMN "contact_email" varchar;
  ALTER TABLE "payload"."website" ADD COLUMN "contact_telefoon" varchar;
  ALTER TABLE "payload"."website" ADD COLUMN "contact_linkedin" varchar;
  ALTER TABLE "payload"."website" ADD COLUMN "contact_footer_tekst" varchar;

  -- Huidige waarden uit Instellingen overnemen, zodat de Homepage-editor ze meteen toont.
  UPDATE "payload"."website" w SET
    "contact_email" = NULLIF(TRIM(i."contact_email"), ''),
    "contact_telefoon" = NULLIF(TRIM(i."telefoon"), ''),
    "contact_linkedin" = NULLIF(TRIM(i."linkedin"), ''),
    "contact_footer_tekst" = NULLIF(TRIM(i."footer_tekst"), '')
  FROM (SELECT * FROM "payload"."instellingen" LIMIT 1) i;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."website" DROP COLUMN "contact_email";
  ALTER TABLE "payload"."website" DROP COLUMN "contact_telefoon";
  ALTER TABLE "payload"."website" DROP COLUMN "contact_linkedin";
  ALTER TABLE "payload"."website" DROP COLUMN "contact_footer_tekst";`)
}
