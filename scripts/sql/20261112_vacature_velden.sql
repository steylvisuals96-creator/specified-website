-- Toegepast op Supabase (project specified-cms) op 2026-11-12, vóór de CMS-commit
-- "Vacatures: uren, opleiding, talen en vast adres" live ging.
-- Zelfde inhoud als migrations/20261112_120830_vacature_velden.ts, plus de
-- registratie in payload_migrations zodat Payload hem later niet opnieuw draait.
-- Alleen toevoegen: er wordt niets verwijderd of overschreven buiten de nieuwe kolommen.

BEGIN;

CREATE TYPE "payload"."enum_vacatures_talen" AS ENUM('nl', 'en', 'fr', 'de');
CREATE TYPE "payload"."enum_vacatures_uren" AS ENUM('voltijds', 'deeltijds', 'beide');
CREATE TYPE "payload"."enum_vacatures_opleidingsniveau" AS ENUM('secundair', 'graduaat', 'bachelor', 'master', 'geen');
ALTER TYPE "payload"."enum_vacatures_sector" ADD VALUE 'automatisering' BEFORE 'werktuig';

CREATE TABLE "payload"."vacatures_talen" (
  "order" integer NOT NULL,
  "parent_id" uuid NOT NULL,
  "value" "payload"."enum_vacatures_talen",
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);

ALTER TABLE "payload"."vacatures" ADD COLUMN "slug" varchar;
ALTER TABLE "payload"."vacatures" ADD COLUMN "uren" "payload"."enum_vacatures_uren";
ALTER TABLE "payload"."vacatures" ADD COLUMN "opleidingsniveau" "payload"."enum_vacatures_opleidingsniveau";
ALTER TABLE "payload"."vacatures_talen" ADD CONSTRAINT "vacatures_talen_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."vacatures"("id") ON DELETE cascade ON UPDATE no action;
CREATE INDEX "vacatures_talen_order_idx" ON "payload"."vacatures_talen" USING btree ("order");
CREATE INDEX "vacatures_talen_parent_idx" ON "payload"."vacatures_talen" USING btree ("parent_id");
CREATE UNIQUE INDEX "vacatures_slug_idx" ON "payload"."vacatures" USING btree ("slug");

-- Bestaande vacatures krijgen een adres uit hun titel, met een stukje van hun id.
UPDATE "payload"."vacatures"
SET "slug" = COALESCE(NULLIF(trim(both '-' from left(regexp_replace(translate(lower("titel"), 'éèëêáàäâíïîóöôúüûç', 'eeeeaaaaiiiooouuuc'), '[^a-z0-9]+', '-', 'g'), 70)), ''), 'vacature')
  || '-' || left(replace("id"::text, '-', ''), 6)
WHERE "slug" IS NULL;

INSERT INTO "payload"."payload_migrations" ("name", "batch") VALUES ('20261112_120830_vacature_velden', 6);

COMMIT;

-- Controle: elke vacature heeft een adres.
SELECT titel, slug, status FROM "payload"."vacatures";
