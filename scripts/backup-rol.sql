-- Eenmalig uitvoeren in Supabase > SQL Editor (project specified-cms).
-- Maakt de rol waarmee de nachtelijke back-up de database leest.
-- Ze kan alleen lezen: geen schrijven, geen andere schema's, maximaal 2 verbindingen.
--
-- Vervang VUL_HIER_EEN_WACHTWOORD_IN door een lang willekeurig wachtwoord,
-- bv. uit: openssl rand -base64 32 | tr -d '/+='
-- Bewaar het in je wachtwoordbeheerder en in GitHub als deel van BACKUP_DATABASE_URI.

create role backup_lezer with login password 'VUL_HIER_EEN_WACHTWOORD_IN'
  nosuperuser nocreatedb nocreaterole noinherit noreplication connection limit 2;

grant usage on schema payload to backup_lezer;
grant select on all tables in schema payload to backup_lezer;
grant select on all sequences in schema payload to backup_lezer;

-- Ook tabellen die latere migraties toevoegen.
alter default privileges for role postgres in schema payload grant select on tables to backup_lezer;
alter default privileges for role postgres in schema payload grant select on sequences to backup_lezer;

-- payload.teksten heeft RLS aan zonder regels; zonder deze leesregel weigert pg_dump de tabel.
create policy backup_lezen on payload.teksten for select to backup_lezer using (true);
