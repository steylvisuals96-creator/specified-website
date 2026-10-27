-- Rol voor de nachtelijke back-up: alleen lezen, maximaal 2 verbindingen.
-- Werkt ook als de rol al bestaat (dan krijgt ze het nieuwe wachtwoord).
-- Vervang VUL_HIER_EEN_WACHTWOORD_IN door je wachtwoord (zonder / + =).

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'backup_lezer') then
    create role backup_lezer;
  end if;
end $$;

-- Alleen wachtwoord, login en verbindingslimiet: superuser, createdb, createrole
-- en replication staan bij een nieuwe rol al uit (en Supabase laat ze niet wijzigen).
alter role backup_lezer with login password 'VUL_HIER_EEN_WACHTWOORD_IN' connection limit 2;

grant usage on schema payload to backup_lezer;
grant select on all tables in schema payload to backup_lezer;
grant select on all sequences in schema payload to backup_lezer;
alter default privileges for role postgres in schema payload grant select on tables to backup_lezer;
alter default privileges for role postgres in schema payload grant select on sequences to backup_lezer;

drop policy if exists backup_lezen on payload.teksten;
create policy backup_lezen on payload.teksten for select to backup_lezer using (true);
