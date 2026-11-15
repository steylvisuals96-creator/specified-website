import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  CREATE UNIQUE INDEX "vacatures_slug_idx" ON "payload"."vacatures" USING btree ("slug");`)

  // Bestaande vacatures krijgen een adres uit hun titel, met een stukje van
  // hun id erachter zodat twee gelijke titels niet botsen.
  await db.execute(sql`
  UPDATE "payload"."vacatures"
  SET "slug" = COALESCE(NULLIF(trim(both '-' from left(regexp_replace(translate(lower("titel"), 'éèëêáàäâíïîóöôúüûç', 'eeeeaaaaiiiooouuuc'), '[^a-z0-9]+', '-', 'g'), 70)), ''), 'vacature')
    || '-' || left(replace("id"::text, '-', ''), 6)
  WHERE "slug" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."vacatures_talen" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."vacatures_talen" CASCADE;
  ALTER TABLE "payload"."vacatures" ALTER COLUMN "sector" SET DATA TYPE text;
  DROP TYPE "payload"."enum_vacatures_sector";
  CREATE TYPE "payload"."enum_vacatures_sector" AS ENUM('civiel', 'elektro', 'werktuig', 'it', 'bouw', 'energie', 'industrie', 'projectmanagement');
  ALTER TABLE "payload"."vacatures" ALTER COLUMN "sector" SET DATA TYPE "payload"."enum_vacatures_sector" USING "sector"::"payload"."enum_vacatures_sector";
  DROP INDEX "payload"."vacatures_slug_idx";
  ALTER TABLE "payload"."vacatures" DROP COLUMN "slug";
  ALTER TABLE "payload"."vacatures" DROP COLUMN "uren";
  ALTER TABLE "payload"."vacatures" DROP COLUMN "opleidingsniveau";
  DROP TYPE "payload"."enum_vacatures_talen";
  DROP TYPE "payload"."enum_vacatures_uren";
  DROP TYPE "payload"."enum_vacatures_opleidingsniveau";`)
}
