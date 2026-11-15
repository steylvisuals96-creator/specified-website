import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE SCHEMA IF NOT EXISTS "payload";
   -- Supabase: de publieke API-rollen krijgen nooit toegang tot de CMS-tabellen,
   -- ook niet als iemand dit schema later per ongeluk openzet. Payload zelf
   -- verbindt als de database-eigenaar en heeft deze rechten niet nodig.
   DO $$ BEGIN
     IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
       REVOKE ALL ON SCHEMA "payload" FROM anon, authenticated;
       ALTER DEFAULT PRIVILEGES IN SCHEMA "payload" REVOKE ALL ON TABLES FROM anon, authenticated;
       ALTER DEFAULT PRIVILEGES IN SCHEMA "payload" REVOKE ALL ON SEQUENCES FROM anon, authenticated;
       ALTER DEFAULT PRIVILEGES IN SCHEMA "payload" REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
     END IF;
   END $$;
   CREATE TYPE "payload"."enum_vacatures_sector" AS ENUM('civiel', 'elektro', 'werktuig', 'it', 'bouw', 'energie', 'industrie', 'projectmanagement');
  CREATE TYPE "payload"."enum_vacatures_type" AS ENUM('vast', 'freelance', 'interim', 'student');
  CREATE TYPE "payload"."enum_vacatures_status" AS ENUM('actief', 'on_hold', 'ingevuld', 'geannuleerd');
  CREATE TYPE "payload"."enum_vacatures_ervaringsniveau" AS ENUM('junior', 'medior', 'senior', 'lead');
  CREATE TYPE "payload"."enum_kandidaten_sector" AS ENUM('civiel', 'elektro', 'werktuig', 'it', 'bouw', 'energie', 'industrie', 'projectmanagement');
  CREATE TYPE "payload"."enum_kandidaten_ervaringsniveau" AS ENUM('junior', 'medior', 'senior', 'lead');
  CREATE TYPE "payload"."enum_kandidaten_beschikbaarheid" AS ENUM('onmiddellijk', '1_maand', '3_maanden', 'passief');
  CREATE TYPE "payload"."enum_kandidaten_status" AS ENUM('nieuw', 'gescreend', 'in_gesprek', 'voorgesteld', 'interview_klant', 'geplaatst', 'afgewezen', 'on_hold');
  CREATE TYPE "payload"."enum_kandidaten_bron" AS ENUM('linkedin', 'website', 'aanbeveling', 'netwerk', 'jobboard', 'spontaan');
  CREATE TYPE "payload"."enum_bedrijven_sector" AS ENUM('civiel', 'elektro', 'werktuig', 'it', 'bouw', 'energie', 'industrie');
  CREATE TYPE "payload"."enum_bedrijven_grootte" AS ENUM('startup', 'kmo', 'middelgroot', 'groot');
  CREATE TYPE "payload"."enum_bedrijven_relatiestatus" AS ENUM('prospect', 'actief', 'slapend', 'voormalig');
  CREATE TYPE "payload"."enum_sollicitaties_status" AS ENUM('nieuw', 'screening', 'tel_gescreend', 'voorgesteld', 'interview_gepland', 'interview_afgerond', 'aanbod', 'geplaatst', 'afgewezen', 'teruggetrokken');
  CREATE TYPE "payload"."enum_activiteiten_type" AS ENUM('email', 'telefoon', 'meeting', 'notitie');
  CREATE TYPE "payload"."enum_activiteiten_richting" AS ENUM('uitgaand', 'inkomend');
  CREATE TYPE "payload"."enum_team_rol" AS ENUM('managing_partner', 'senior_consultant', 'consultant', 'talent', 'office');
  CREATE TYPE "payload"."enum_blog_status" AS ENUM('concept', 'gepubliceerd');
  CREATE TYPE "payload"."enum_gebruikers_rol" AS ENUM('creator', 'beheerder', 'consultant');
  CREATE TABLE "payload"."vacatures_vereisten" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"punt" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."vacatures_nice_to_have" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"punt" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."vacatures_aanbod" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"punt" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."vacatures" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"titel" varchar NOT NULL,
  	"sector" "payload"."enum_vacatures_sector" NOT NULL,
  	"type" "payload"."enum_vacatures_type" NOT NULL,
  	"status" "payload"."enum_vacatures_status" DEFAULT 'actief',
  	"locatie" varchar DEFAULT 'België',
  	"ervaringsniveau" "payload"."enum_vacatures_ervaringsniveau",
  	"salaris" varchar,
  	"opdrachtgever_id" uuid,
  	"beschrijving" jsonb,
  	"gepubliceerd_op" timestamp(3) with time zone,
  	"zichtbaar_op_website" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."kandidaten_skills" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"skill" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."kandidaten" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"voornaam" varchar NOT NULL,
  	"achternaam" varchar NOT NULL,
  	"naam" varchar,
  	"email" varchar NOT NULL,
  	"telefoon" varchar,
  	"sector" "payload"."enum_kandidaten_sector",
  	"ervaringsniveau" "payload"."enum_kandidaten_ervaringsniveau",
  	"beschikbaarheid" "payload"."enum_kandidaten_beschikbaarheid",
  	"functietitel" varchar,
  	"huidige_werkgever" varchar,
  	"jaren_ervaring" numeric,
  	"linkedin" varchar,
  	"cv_id" uuid,
  	"status" "payload"."enum_kandidaten_status" DEFAULT 'nieuw',
  	"gewenst_salaris" varchar,
  	"notities" varchar,
  	"foto_id" uuid,
  	"bron" "payload"."enum_kandidaten_bron",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."bedrijven" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"naam" varchar NOT NULL,
  	"sector" "payload"."enum_bedrijven_sector",
  	"grootte" "payload"."enum_bedrijven_grootte",
  	"contactpersoon" varchar,
  	"email" varchar,
  	"telefoon" varchar,
  	"website" varchar,
  	"locatie" varchar,
  	"logo_id" uuid,
  	"notities" varchar,
  	"relatiestatus" "payload"."enum_bedrijven_relatiestatus" DEFAULT 'prospect',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."sollicitaties" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"titel" varchar,
  	"kandidaat_id" uuid NOT NULL,
  	"vacature_id" uuid NOT NULL,
  	"status" "payload"."enum_sollicitaties_status" DEFAULT 'nieuw',
  	"datum_sollicitatie" timestamp(3) with time zone,
  	"datum_interview" timestamp(3) with time zone,
  	"consultant_id" uuid,
  	"notities" varchar,
  	"startdatum" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."activiteiten" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"type" "payload"."enum_activiteiten_type" DEFAULT 'email' NOT NULL,
  	"richting" "payload"."enum_activiteiten_richting" DEFAULT 'uitgaand',
  	"datum" timestamp(3) with time zone NOT NULL,
  	"onderwerp" varchar NOT NULL,
  	"inhoud" varchar,
  	"van" varchar,
  	"naar" varchar,
  	"kandidaat_id" uuid,
  	"bedrijf_id" uuid,
  	"email_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."team" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"voornaam" varchar NOT NULL,
  	"achternaam" varchar NOT NULL,
  	"naam" varchar,
  	"rol" "payload"."enum_team_rol",
  	"bio" varchar,
  	"foto_id" uuid,
  	"email" varchar,
  	"linkedin" varchar,
  	"volgorde" numeric DEFAULT 99,
  	"actief" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."blog" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"titel" varchar NOT NULL,
  	"slug" varchar,
  	"status" "payload"."enum_blog_status" DEFAULT 'concept',
  	"publicatiedatum" timestamp(3) with time zone,
  	"auteur_id" uuid,
  	"cover_id" uuid,
  	"cover_url" varchar,
  	"samenvatting" varchar,
  	"inhoud" jsonb,
  	"meta_titel" varchar,
  	"meta_beschrijving" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."media" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"alt" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."documenten" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"omschrijving" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "payload"."gebruikers_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "payload"."gebruikers" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"naam" varchar NOT NULL,
  	"rol" "payload"."enum_gebruikers_rol" DEFAULT 'consultant' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload"."payload_kv" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"vacatures_id" uuid,
  	"kandidaten_id" uuid,
  	"bedrijven_id" uuid,
  	"sollicitaties_id" uuid,
  	"activiteiten_id" uuid,
  	"team_id" uuid,
  	"blog_id" uuid,
  	"media_id" uuid,
  	"documenten_id" uuid,
  	"gebruikers_id" uuid
  );
  
  CREATE TABLE "payload"."payload_preferences" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"gebruikers_id" uuid
  );
  
  CREATE TABLE "payload"."payload_migrations" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."instellingen_hero_woorden" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"woord" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."instellingen_sectoren" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"naam" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."instellingen_statistieken" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"waarde" varchar NOT NULL,
  	"label" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."instellingen" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"naam" varchar DEFAULT 'Specified',
  	"logo_id" uuid,
  	"bcc_logging_email" varchar,
  	"contact_email" varchar DEFAULT 'info@specified.be',
  	"telefoon" varchar,
  	"adres" varchar DEFAULT 'Kontich, België',
  	"linkedin" varchar DEFAULT 'https://www.linkedin.com/company/specified-be',
  	"footer_tekst" varchar DEFAULT '© 2026 Specified BV — Kontich, België',
  	"hero_prefix" varchar DEFAULT 'We',
  	"hero_suffix" varchar DEFAULT 'possibilities.',
  	"hero_tagline" varchar DEFAULT 'Engineering recruitment',
  	"hero_subtitel" varchar DEFAULT 'Specified verbindt technische toptalenten met ambitieuze ingenieurbureaus en industriële bedrijven. Eerlijk, snel en persoonlijk.',
  	"hero_cta_tekst" varchar DEFAULT 'Bekijk vacatures',
  	"hero_cta_2_tekst" varchar DEFAULT 'Neem contact op',
  	"kandidaten_tag" varchar DEFAULT 'Voor kandidaten',
  	"bedrijven_tag" varchar DEFAULT 'Voor bedrijven',
  	"kandidaten_titel" varchar DEFAULT 'Jouw carrière verdient een echte partner',
  	"bedrijven_titel" varchar DEFAULT 'Engineering talent dat echt het verschil maakt',
  	"kandidaten_tekst" varchar DEFAULT 'We luisteren eerst. Pas daarna zoeken we. Samen bepalen we welke stap écht past bij wie jij bent en waar je naartoe wil groeien als engineer.',
  	"bedrijven_tekst" varchar DEFAULT 'Geen CV-schieten. Wij screenen diep, valideren technisch en leveren enkel kandidaten die passen bij jouw cultuur, stack en ambitie.',
  	"kandidaten_cta" varchar DEFAULT 'Bekijk openstaande jobs',
  	"bedrijven_cta" varchar DEFAULT 'Vertel ons wat je zoekt',
  	"jobs_titel" varchar DEFAULT 'Vind jouw volgende stap.',
  	"jobs_link_tekst" varchar DEFAULT 'Alle vacatures',
  	"contact_titel" varchar DEFAULT 'Laten we kennismaken.',
  	"vacatures_titel" varchar DEFAULT 'Jouw volgende stap.',
  	"over_titel" varchar DEFAULT 'Twee founders.',
  	"over_titel_accent" varchar DEFAULT 'Eén missie.',
  	"over_tekst" varchar,
  	"meta_titel" varchar DEFAULT 'Specified — Engineering Recruitment',
  	"meta_beschrijving" varchar DEFAULT 'Specified verbindt technische toptalenten met ingenieurbureaus en industriële bedrijven in België.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload"."vacatures_vereisten" ADD CONSTRAINT "vacatures_vereisten_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."vacatures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."vacatures_nice_to_have" ADD CONSTRAINT "vacatures_nice_to_have_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."vacatures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."vacatures_aanbod" ADD CONSTRAINT "vacatures_aanbod_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."vacatures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."vacatures" ADD CONSTRAINT "vacatures_opdrachtgever_id_bedrijven_id_fk" FOREIGN KEY ("opdrachtgever_id") REFERENCES "payload"."bedrijven"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."kandidaten_skills" ADD CONSTRAINT "kandidaten_skills_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."kandidaten"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."kandidaten" ADD CONSTRAINT "kandidaten_cv_id_documenten_id_fk" FOREIGN KEY ("cv_id") REFERENCES "payload"."documenten"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."kandidaten" ADD CONSTRAINT "kandidaten_foto_id_documenten_id_fk" FOREIGN KEY ("foto_id") REFERENCES "payload"."documenten"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."bedrijven" ADD CONSTRAINT "bedrijven_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."sollicitaties" ADD CONSTRAINT "sollicitaties_kandidaat_id_kandidaten_id_fk" FOREIGN KEY ("kandidaat_id") REFERENCES "payload"."kandidaten"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."sollicitaties" ADD CONSTRAINT "sollicitaties_vacature_id_vacatures_id_fk" FOREIGN KEY ("vacature_id") REFERENCES "payload"."vacatures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."sollicitaties" ADD CONSTRAINT "sollicitaties_consultant_id_gebruikers_id_fk" FOREIGN KEY ("consultant_id") REFERENCES "payload"."gebruikers"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."activiteiten" ADD CONSTRAINT "activiteiten_kandidaat_id_kandidaten_id_fk" FOREIGN KEY ("kandidaat_id") REFERENCES "payload"."kandidaten"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."activiteiten" ADD CONSTRAINT "activiteiten_bedrijf_id_bedrijven_id_fk" FOREIGN KEY ("bedrijf_id") REFERENCES "payload"."bedrijven"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."team" ADD CONSTRAINT "team_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."blog" ADD CONSTRAINT "blog_auteur_id_team_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "payload"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."blog" ADD CONSTRAINT "blog_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."gebruikers_sessions" ADD CONSTRAINT "gebruikers_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."gebruikers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vacatures_fk" FOREIGN KEY ("vacatures_id") REFERENCES "payload"."vacatures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_kandidaten_fk" FOREIGN KEY ("kandidaten_id") REFERENCES "payload"."kandidaten"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bedrijven_fk" FOREIGN KEY ("bedrijven_id") REFERENCES "payload"."bedrijven"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sollicitaties_fk" FOREIGN KEY ("sollicitaties_id") REFERENCES "payload"."sollicitaties"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activiteiten_fk" FOREIGN KEY ("activiteiten_id") REFERENCES "payload"."activiteiten"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "payload"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_fk" FOREIGN KEY ("blog_id") REFERENCES "payload"."blog"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "payload"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documenten_fk" FOREIGN KEY ("documenten_id") REFERENCES "payload"."documenten"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gebruikers_fk" FOREIGN KEY ("gebruikers_id") REFERENCES "payload"."gebruikers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_gebruikers_fk" FOREIGN KEY ("gebruikers_id") REFERENCES "payload"."gebruikers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."instellingen_hero_woorden" ADD CONSTRAINT "instellingen_hero_woorden_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."instellingen"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."instellingen_sectoren" ADD CONSTRAINT "instellingen_sectoren_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."instellingen"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."instellingen_statistieken" ADD CONSTRAINT "instellingen_statistieken_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."instellingen"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."instellingen" ADD CONSTRAINT "instellingen_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "vacatures_vereisten_order_idx" ON "payload"."vacatures_vereisten" USING btree ("_order");
  CREATE INDEX "vacatures_vereisten_parent_id_idx" ON "payload"."vacatures_vereisten" USING btree ("_parent_id");
  CREATE INDEX "vacatures_nice_to_have_order_idx" ON "payload"."vacatures_nice_to_have" USING btree ("_order");
  CREATE INDEX "vacatures_nice_to_have_parent_id_idx" ON "payload"."vacatures_nice_to_have" USING btree ("_parent_id");
  CREATE INDEX "vacatures_aanbod_order_idx" ON "payload"."vacatures_aanbod" USING btree ("_order");
  CREATE INDEX "vacatures_aanbod_parent_id_idx" ON "payload"."vacatures_aanbod" USING btree ("_parent_id");
  CREATE INDEX "vacatures_opdrachtgever_idx" ON "payload"."vacatures" USING btree ("opdrachtgever_id");
  CREATE INDEX "vacatures_updated_at_idx" ON "payload"."vacatures" USING btree ("updated_at");
  CREATE INDEX "vacatures_created_at_idx" ON "payload"."vacatures" USING btree ("created_at");
  CREATE INDEX "kandidaten_skills_order_idx" ON "payload"."kandidaten_skills" USING btree ("_order");
  CREATE INDEX "kandidaten_skills_parent_id_idx" ON "payload"."kandidaten_skills" USING btree ("_parent_id");
  CREATE INDEX "kandidaten_cv_idx" ON "payload"."kandidaten" USING btree ("cv_id");
  CREATE INDEX "kandidaten_foto_idx" ON "payload"."kandidaten" USING btree ("foto_id");
  CREATE INDEX "kandidaten_updated_at_idx" ON "payload"."kandidaten" USING btree ("updated_at");
  CREATE INDEX "kandidaten_created_at_idx" ON "payload"."kandidaten" USING btree ("created_at");
  CREATE INDEX "bedrijven_logo_idx" ON "payload"."bedrijven" USING btree ("logo_id");
  CREATE INDEX "bedrijven_updated_at_idx" ON "payload"."bedrijven" USING btree ("updated_at");
  CREATE INDEX "bedrijven_created_at_idx" ON "payload"."bedrijven" USING btree ("created_at");
  CREATE INDEX "sollicitaties_kandidaat_idx" ON "payload"."sollicitaties" USING btree ("kandidaat_id");
  CREATE INDEX "sollicitaties_vacature_idx" ON "payload"."sollicitaties" USING btree ("vacature_id");
  CREATE INDEX "sollicitaties_consultant_idx" ON "payload"."sollicitaties" USING btree ("consultant_id");
  CREATE INDEX "sollicitaties_updated_at_idx" ON "payload"."sollicitaties" USING btree ("updated_at");
  CREATE INDEX "sollicitaties_created_at_idx" ON "payload"."sollicitaties" USING btree ("created_at");
  CREATE INDEX "activiteiten_kandidaat_idx" ON "payload"."activiteiten" USING btree ("kandidaat_id");
  CREATE INDEX "activiteiten_bedrijf_idx" ON "payload"."activiteiten" USING btree ("bedrijf_id");
  CREATE INDEX "activiteiten_updated_at_idx" ON "payload"."activiteiten" USING btree ("updated_at");
  CREATE INDEX "activiteiten_created_at_idx" ON "payload"."activiteiten" USING btree ("created_at");
  CREATE INDEX "team_foto_idx" ON "payload"."team" USING btree ("foto_id");
  CREATE INDEX "team_updated_at_idx" ON "payload"."team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "payload"."team" USING btree ("created_at");
  CREATE UNIQUE INDEX "blog_slug_idx" ON "payload"."blog" USING btree ("slug");
  CREATE INDEX "blog_status_idx" ON "payload"."blog" USING btree ("status");
  CREATE INDEX "blog_auteur_idx" ON "payload"."blog" USING btree ("auteur_id");
  CREATE INDEX "blog_cover_idx" ON "payload"."blog" USING btree ("cover_id");
  CREATE INDEX "blog_updated_at_idx" ON "payload"."blog" USING btree ("updated_at");
  CREATE INDEX "blog_created_at_idx" ON "payload"."blog" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "payload"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "payload"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "payload"."media" USING btree ("filename");
  CREATE INDEX "documenten_updated_at_idx" ON "payload"."documenten" USING btree ("updated_at");
  CREATE INDEX "documenten_created_at_idx" ON "payload"."documenten" USING btree ("created_at");
  CREATE UNIQUE INDEX "documenten_filename_idx" ON "payload"."documenten" USING btree ("filename");
  CREATE INDEX "gebruikers_sessions_order_idx" ON "payload"."gebruikers_sessions" USING btree ("_order");
  CREATE INDEX "gebruikers_sessions_parent_id_idx" ON "payload"."gebruikers_sessions" USING btree ("_parent_id");
  CREATE INDEX "gebruikers_updated_at_idx" ON "payload"."gebruikers" USING btree ("updated_at");
  CREATE INDEX "gebruikers_created_at_idx" ON "payload"."gebruikers" USING btree ("created_at");
  CREATE UNIQUE INDEX "gebruikers_email_idx" ON "payload"."gebruikers" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_vacatures_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("vacatures_id");
  CREATE INDEX "payload_locked_documents_rels_kandidaten_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("kandidaten_id");
  CREATE INDEX "payload_locked_documents_rels_bedrijven_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("bedrijven_id");
  CREATE INDEX "payload_locked_documents_rels_sollicitaties_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("sollicitaties_id");
  CREATE INDEX "payload_locked_documents_rels_activiteiten_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("activiteiten_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_blog_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("blog_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_documenten_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("documenten_id");
  CREATE INDEX "payload_locked_documents_rels_gebruikers_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("gebruikers_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_gebruikers_id_idx" ON "payload"."payload_preferences_rels" USING btree ("gebruikers_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "instellingen_hero_woorden_order_idx" ON "payload"."instellingen_hero_woorden" USING btree ("_order");
  CREATE INDEX "instellingen_hero_woorden_parent_id_idx" ON "payload"."instellingen_hero_woorden" USING btree ("_parent_id");
  CREATE INDEX "instellingen_sectoren_order_idx" ON "payload"."instellingen_sectoren" USING btree ("_order");
  CREATE INDEX "instellingen_sectoren_parent_id_idx" ON "payload"."instellingen_sectoren" USING btree ("_parent_id");
  CREATE INDEX "instellingen_statistieken_order_idx" ON "payload"."instellingen_statistieken" USING btree ("_order");
  CREATE INDEX "instellingen_statistieken_parent_id_idx" ON "payload"."instellingen_statistieken" USING btree ("_parent_id");
  CREATE INDEX "instellingen_logo_idx" ON "payload"."instellingen" USING btree ("logo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "payload"."vacatures_vereisten" CASCADE;
  DROP TABLE "payload"."vacatures_nice_to_have" CASCADE;
  DROP TABLE "payload"."vacatures_aanbod" CASCADE;
  DROP TABLE "payload"."vacatures" CASCADE;
  DROP TABLE "payload"."kandidaten_skills" CASCADE;
  DROP TABLE "payload"."kandidaten" CASCADE;
  DROP TABLE "payload"."bedrijven" CASCADE;
  DROP TABLE "payload"."sollicitaties" CASCADE;
  DROP TABLE "payload"."activiteiten" CASCADE;
  DROP TABLE "payload"."team" CASCADE;
  DROP TABLE "payload"."blog" CASCADE;
  DROP TABLE "payload"."media" CASCADE;
  DROP TABLE "payload"."documenten" CASCADE;
  DROP TABLE "payload"."gebruikers_sessions" CASCADE;
  DROP TABLE "payload"."gebruikers" CASCADE;
  DROP TABLE "payload"."payload_kv" CASCADE;
  DROP TABLE "payload"."payload_locked_documents" CASCADE;
  DROP TABLE "payload"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload"."payload_preferences" CASCADE;
  DROP TABLE "payload"."payload_preferences_rels" CASCADE;
  DROP TABLE "payload"."payload_migrations" CASCADE;
  DROP TABLE "payload"."instellingen_hero_woorden" CASCADE;
  DROP TABLE "payload"."instellingen_sectoren" CASCADE;
  DROP TABLE "payload"."instellingen_statistieken" CASCADE;
  DROP TABLE "payload"."instellingen" CASCADE;
  DROP TYPE "payload"."enum_vacatures_sector";
  DROP TYPE "payload"."enum_vacatures_type";
  DROP TYPE "payload"."enum_vacatures_status";
  DROP TYPE "payload"."enum_vacatures_ervaringsniveau";
  DROP TYPE "payload"."enum_kandidaten_sector";
  DROP TYPE "payload"."enum_kandidaten_ervaringsniveau";
  DROP TYPE "payload"."enum_kandidaten_beschikbaarheid";
  DROP TYPE "payload"."enum_kandidaten_status";
  DROP TYPE "payload"."enum_kandidaten_bron";
  DROP TYPE "payload"."enum_bedrijven_sector";
  DROP TYPE "payload"."enum_bedrijven_grootte";
  DROP TYPE "payload"."enum_bedrijven_relatiestatus";
  DROP TYPE "payload"."enum_sollicitaties_status";
  DROP TYPE "payload"."enum_activiteiten_type";
  DROP TYPE "payload"."enum_activiteiten_richting";
  DROP TYPE "payload"."enum_team_rol";
  DROP TYPE "payload"."enum_blog_status";
  DROP TYPE "payload"."enum_gebruikers_rol";`)
}
