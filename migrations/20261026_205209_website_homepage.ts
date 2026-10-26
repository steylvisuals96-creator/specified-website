import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "payload"."website_callouts" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"tekst" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."website_consultants_profielen" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"naam" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."website" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"hero_prefix" varchar DEFAULT 'We',
  	"hero_woord" varchar DEFAULT 'engineer',
  	"hero_suffix" varchar DEFAULT 'possibilities.',
  	"hero_cta_bedrijven" varchar DEFAULT 'Zet onze consultants in',
  	"hero_cta_engineers" varchar DEFAULT 'Word consultant',
  	"tekening_intro" varchar DEFAULT 'Engineering consultancy uit Antwerpen: onze eigen consultants versterken jouw projecten.',
  	"tekening_scroll_hint" varchar DEFAULT 'Scroll om de specificatie te openen.',
  	"tekening_project" varchar DEFAULT 'We are here to stay',
  	"tekening_locatie" varchar DEFAULT 'Kontich, Antwerpen',
  	"tekening_waarden" varchar DEFAULT 'Drive en verantwoordelijkheid',
  	"tekening_akkoord" varchar DEFAULT 'Goedgekeurd door Specified',
  	"consultants_titel" varchar DEFAULT 'Onze',
  	"consultants_accent" varchar DEFAULT 'consultants.',
  	"consultants_tekst" varchar DEFAULT 'Eigen engineers, in dienst van Specified, tijdelijk ingezet bij jouw projecten, onderhoud en studies.',
  	"diensten_bedrijven_kop" varchar DEFAULT 'Voor bedrijven',
  	"diensten_bedrijven_titel" varchar DEFAULT 'We design & support projects',
  	"diensten_bedrijven_tekst" varchar DEFAULT 'Tijdelijke versterking nodig voor een project, onderhoud of een studie? Wij zetten een eigen consultant in: de juiste persoon op de juiste plek, op het juiste moment. Van projectontwikkeling en systeemintegratie tot het optimaliseren van bestaande processen.',
  	"diensten_bedrijven_cta" varchar DEFAULT 'Zet onze consultants in',
  	"diensten_engineers_kop" varchar DEFAULT 'Voor engineers',
  	"diensten_engineers_titel" varchar DEFAULT 'We engineer possibilities',
  	"diensten_engineers_tekst" varchar DEFAULT 'Als consultant bij Specified ontdek je verschillende projecten en sectoren zonder je hele carrière op één pad vast te leggen. We begeleiden je keuzes, blijven in gesprek over wat je wil en laten je groeien tot expert of veelzijdige generalist.',
  	"diensten_engineers_cta" varchar DEFAULT 'Word consultant',
  	"jobs_titel" varchar DEFAULT 'Word consultant.',
  	"jobs_link_tekst" varchar DEFAULT 'Alle vacatures',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload"."website_callouts" ADD CONSTRAINT "website_callouts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."website"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."website_consultants_profielen" ADD CONSTRAINT "website_consultants_profielen_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."website"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "website_callouts_order_idx" ON "payload"."website_callouts" USING btree ("_order");
  CREATE INDEX "website_callouts_parent_id_idx" ON "payload"."website_callouts" USING btree ("_parent_id");
  CREATE INDEX "website_consultants_profielen_order_idx" ON "payload"."website_consultants_profielen" USING btree ("_order");
  CREATE INDEX "website_consultants_profielen_parent_id_idx" ON "payload"."website_consultants_profielen" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."website_callouts" CASCADE;
  DROP TABLE "payload"."website_consultants_profielen" CASCADE;
  DROP TABLE "payload"."website" CASCADE;`)
}
