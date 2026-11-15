-- Beheer van Specified, rechtstreeks op Supabase (zonder Payload).
-- Alleen wat Specified gebruikt: vacatures, blog, team, media, homepage-teksten
-- en gebruikers. Het oude schema "payload" blijft onaangeroerd als archief.
--
-- Toegang:
--   anon (de website)  leest alleen wat publiek hoort: actieve en ingevulde
--                      vacatures, gepubliceerde artikels, actieve teamleden,
--                      media en de homepage-teksten.
--   authenticated      heeft alleen rechten met een profiel (rol). Een account
--                      zonder profiel ziet wat anon ziet, niets meer.
--   Profielen aanmaken en rollen geven gebeurt alleen op de server (service role).

-- ── Rollen en profielen ────────────────────────────────────────────────

create type public.rol as enum ('creator', 'beheerder', 'redacteur');

create table public.profielen (
  id uuid primary key references auth.users (id) on delete cascade,
  naam text not null default '' check (char_length(naam) <= 80),
  rol public.rol not null default 'redacteur',
  aangemaakt timestamptz not null default now()
);

-- Rol van de ingelogde gebruiker, of null zonder profiel. Security definer zodat
-- RLS op profielen geen kringverwijzing geeft.
create function public.mijn_rol() returns public.rol
language sql stable security definer set search_path = ''
as $$ select rol from public.profielen where id = (select auth.uid()) $$;

create function public.is_redactie() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profielen where id = (select auth.uid())) $$;

create function public.is_beheerder() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profielen where id = (select auth.uid()) and rol in ('creator', 'beheerder')) $$;

revoke execute on function public.mijn_rol(), public.is_redactie(), public.is_beheerder() from public, anon;
grant execute on function public.mijn_rol(), public.is_redactie(), public.is_beheerder() to authenticated;

-- ── Media (bestanden staan in Cloudflare R2, hier de beschrijving) ─────

create table public.media (
  id uuid primary key default gen_random_uuid(),
  sleutel text not null unique check (sleutel ~ '^media/[a-z0-9/._-]{1,200}$'),
  bestandsnaam text not null default '' check (char_length(bestandsnaam) <= 200),
  mime text not null check (mime in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif')),
  grootte integer not null check (grootte > 0 and grootte <= 15000000),
  breedte integer check (breedte > 0),
  hoogte integer check (hoogte > 0),
  alt text not null default '' check (char_length(alt) <= 200),
  aangemaakt timestamptz not null default now(),
  aangemaakt_door uuid references auth.users (id) on delete set null
);

-- ── Team ───────────────────────────────────────────────────────────────

create table public.team (
  id uuid primary key default gen_random_uuid(),
  voornaam text not null check (char_length(voornaam) between 1 and 60),
  achternaam text not null default '' check (char_length(achternaam) <= 60),
  rol text not null default '' check (char_length(rol) <= 60),
  bio text not null default '' check (char_length(bio) <= 1200),
  foto_id uuid references public.media (id) on delete set null,
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  linkedin text check (linkedin is null or linkedin ~* '^https://([a-z]+\.)?linkedin\.com/'),
  volgorde integer not null default 99,
  actief boolean not null default true,
  aangemaakt timestamptz not null default now(),
  gewijzigd timestamptz not null default now(),
  gewijzigd_door uuid references auth.users (id) on delete set null
);

-- ── Vacatures ──────────────────────────────────────────────────────────

create table public.vacatures (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 140),
  titel text not null check (char_length(titel) between 1 and 120),
  vakgebied text not null check (vakgebied in ('civiel', 'elektro', 'automatisering', 'werktuig', 'it', 'bouw', 'energie', 'industrie', 'projectmanagement')),
  contract text not null check (contract in ('vast', 'freelance', 'interim', 'student')),
  status text not null default 'actief' check (status in ('actief', 'on_hold', 'ingevuld', 'geannuleerd')),
  locatie text not null default 'België' check (char_length(locatie) <= 80),
  ervaring text check (ervaring in ('junior', 'medior', 'senior', 'lead')),
  uren text check (uren in ('voltijds', 'deeltijds', 'beide')),
  opleiding text check (opleiding in ('secundair', 'graduaat', 'bachelor', 'master', 'geen')),
  talen text[] not null default '{}' check (talen <@ array['nl', 'en', 'fr', 'de']),
  beschrijving jsonb, -- Tiptap-document
  vereisten text[] not null default '{}',
  nice_to_have text[] not null default '{}',
  aanbod text[] not null default '{}',
  geplaatst_op date,
  zichtbaar boolean not null default true,
  aangemaakt timestamptz not null default now(),
  gewijzigd timestamptz not null default now(),
  gewijzigd_door uuid references auth.users (id) on delete set null
);

-- Wat nooit op de website mag komen, in een eigen tabel zonder publieke regel.
create table public.vacatures_intern (
  vacature_id uuid primary key references public.vacatures (id) on delete cascade,
  salaris text not null default '' check (char_length(salaris) <= 120),
  notitie text not null default '' check (char_length(notitie) <= 2000)
);

-- ── Blog ───────────────────────────────────────────────────────────────

create table public.blog (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 140),
  titel text not null check (char_length(titel) between 1 and 160),
  status text not null default 'concept' check (status in ('concept', 'gepubliceerd')),
  publicatiedatum date not null default current_date,
  auteur_id uuid references public.team (id) on delete set null,
  cover_id uuid references public.media (id) on delete set null,
  cover_url text check (cover_url is null or cover_url ~* '^https://'),
  samenvatting text not null default '' check (char_length(samenvatting) <= 400),
  inhoud jsonb, -- Tiptap-document
  meta_titel text not null default '' check (char_length(meta_titel) <= 70),
  meta_beschrijving text not null default '' check (char_length(meta_beschrijving) <= 170),
  aangemaakt timestamptz not null default now(),
  gewijzigd timestamptz not null default now(),
  gewijzigd_door uuid references auth.users (id) on delete set null
);

-- ── Teksten van de website (één rij per pagina, nu alleen de homepage) ─

create table public.pagina_inhoud (
  sleutel text primary key check (sleutel in ('homepage')),
  waarde jsonb not null default '{}'::jsonb check (jsonb_typeof(waarde) = 'object'),
  gewijzigd timestamptz not null default now(),
  gewijzigd_door uuid references auth.users (id) on delete set null
);

-- ── Wie wijzigde wat ───────────────────────────────────────────────────

create table public.wijzigingen (
  id bigint generated always as identity primary key,
  tabel text not null,
  rij text not null,
  actie text not null check (actie in ('nieuw', 'gewijzigd', 'verwijderd')),
  titel text not null default '',
  door uuid references auth.users (id) on delete set null,
  wanneer timestamptz not null default now()
);

-- ── Indexen ────────────────────────────────────────────────────────────

create index blog_publiek_idx on public.blog (status, publicatiedatum desc);
create index blog_auteur_idx on public.blog (auteur_id);
create index blog_cover_idx on public.blog (cover_id);
create index blog_gewijzigd_door_idx on public.blog (gewijzigd_door);
create index team_volgorde_idx on public.team (volgorde);
create index team_foto_idx on public.team (foto_id);
create index team_gewijzigd_door_idx on public.team (gewijzigd_door);
create index vacatures_publiek_idx on public.vacatures (status, zichtbaar);
create index vacatures_gewijzigd_door_idx on public.vacatures (gewijzigd_door);
create index media_aangemaakt_door_idx on public.media (aangemaakt_door);
create index pagina_inhoud_gewijzigd_door_idx on public.pagina_inhoud (gewijzigd_door);
create index wijzigingen_wanneer_idx on public.wijzigingen (wanneer desc);
create index wijzigingen_door_idx on public.wijzigingen (door);

-- ── Triggers: gewijzigd bijhouden en logboek ───────────────────────────

create function public.zet_gewijzigd() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.gewijzigd := now();
  new.gewijzigd_door := coalesce((select auth.uid()), new.gewijzigd_door);
  return new;
end $$;

create trigger vacatures_gewijzigd before update on public.vacatures for each row execute function public.zet_gewijzigd();
create trigger blog_gewijzigd before update on public.blog for each row execute function public.zet_gewijzigd();
create trigger team_gewijzigd before update on public.team for each row execute function public.zet_gewijzigd();
create trigger pagina_inhoud_gewijzigd before update on public.pagina_inhoud for each row execute function public.zet_gewijzigd();

create function public.log_wijziging() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  rij jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.wijzigingen (tabel, rij, actie, titel, door)
  values (
    tg_table_name,
    coalesce(rij ->> 'id', rij ->> 'sleutel', rij ->> 'vacature_id', ''),
    case tg_op when 'INSERT' then 'nieuw' when 'UPDATE' then 'gewijzigd' else 'verwijderd' end,
    left(coalesce(rij ->> 'titel', nullif(trim(concat(rij ->> 'voornaam', ' ', rij ->> 'achternaam')), ''), rij ->> 'bestandsnaam', rij ->> 'sleutel', rij ->> 'naam', ''), 160),
    (select auth.uid())
  );
  return null;
end $$;

revoke execute on function public.log_wijziging() from public, anon, authenticated;

create trigger vacatures_log after insert or update or delete on public.vacatures for each row execute function public.log_wijziging();
create trigger blog_log after insert or update or delete on public.blog for each row execute function public.log_wijziging();
create trigger team_log after insert or update or delete on public.team for each row execute function public.log_wijziging();
create trigger media_log after insert or update or delete on public.media for each row execute function public.log_wijziging();
create trigger pagina_inhoud_log after update on public.pagina_inhoud for each row execute function public.log_wijziging();
create trigger profielen_log after insert or update or delete on public.profielen for each row execute function public.log_wijziging();

-- ── Row Level Security ─────────────────────────────────────────────────

alter table public.profielen enable row level security;
alter table public.media enable row level security;
alter table public.team enable row level security;
alter table public.vacatures enable row level security;
alter table public.vacatures_intern enable row level security;
alter table public.blog enable row level security;
alter table public.pagina_inhoud enable row level security;
alter table public.wijzigingen enable row level security;

-- Rechten op tabelniveau: anon leest alleen de publieke tabellen; de rest bepaalt RLS.
revoke all on public.profielen, public.media, public.team, public.vacatures, public.vacatures_intern,
  public.blog, public.pagina_inhoud, public.wijzigingen from anon, authenticated;
grant select on public.media, public.team, public.vacatures, public.blog, public.pagina_inhoud to anon;
grant select, insert, update, delete on public.media, public.team, public.vacatures, public.vacatures_intern, public.blog to authenticated;
grant select, update on public.pagina_inhoud to authenticated;
grant select, update (naam) on public.profielen to authenticated;
grant select on public.wijzigingen to authenticated;

-- Profielen: je ziet je collega's, het creator-account alleen als je zelf creator bent.
create policy "redactie leest profielen" on public.profielen for select to authenticated
  using ((select public.is_redactie()) and (rol <> 'creator' or id = (select auth.uid()) or (select public.mijn_rol()) = 'creator'));
create policy "eigen naam wijzigen" on public.profielen for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Media: publiek leesbaar (beelden op de website), schrijven door de redactie.
create policy "iedereen leest media" on public.media for select to anon, authenticated using (true);
create policy "redactie voegt media toe" on public.media for insert to authenticated with check ((select public.is_redactie()));
create policy "redactie wijzigt media" on public.media for update to authenticated using ((select public.is_redactie())) with check ((select public.is_redactie()));
create policy "redactie verwijdert media" on public.media for delete to authenticated using ((select public.is_redactie()));

-- Team
create policy "publiek leest actieve teamleden" on public.team for select to anon, authenticated using (actief);
create policy "redactie leest team" on public.team for select to authenticated using ((select public.is_redactie()));
create policy "redactie voegt teamlid toe" on public.team for insert to authenticated with check ((select public.is_redactie()));
create policy "redactie wijzigt team" on public.team for update to authenticated using ((select public.is_redactie())) with check ((select public.is_redactie()));
create policy "redactie verwijdert teamlid" on public.team for delete to authenticated using ((select public.is_redactie()));

-- Vacatures: actief en ingevuld zijn publiek (ingevuld toont de site als ingevuld).
create policy "publiek leest vacatures op de site" on public.vacatures for select to anon, authenticated
  using (zichtbaar and status in ('actief', 'ingevuld'));
create policy "redactie leest vacatures" on public.vacatures for select to authenticated using ((select public.is_redactie()));
create policy "redactie voegt vacature toe" on public.vacatures for insert to authenticated with check ((select public.is_redactie()));
create policy "redactie wijzigt vacature" on public.vacatures for update to authenticated using ((select public.is_redactie())) with check ((select public.is_redactie()));
create policy "redactie verwijdert vacature" on public.vacatures for delete to authenticated using ((select public.is_redactie()));

create policy "redactie beheert interne vacaturegegevens" on public.vacatures_intern for all to authenticated
  using ((select public.is_redactie())) with check ((select public.is_redactie()));

-- Blog: gepubliceerd en niet in de toekomst gedateerd is publiek.
create policy "publiek leest gepubliceerde artikels" on public.blog for select to anon, authenticated
  using (status = 'gepubliceerd' and publicatiedatum <= current_date);
create policy "redactie leest blog" on public.blog for select to authenticated using ((select public.is_redactie()));
create policy "redactie voegt artikel toe" on public.blog for insert to authenticated with check ((select public.is_redactie()));
create policy "redactie wijzigt artikel" on public.blog for update to authenticated using ((select public.is_redactie())) with check ((select public.is_redactie()));
create policy "redactie verwijdert artikel" on public.blog for delete to authenticated using ((select public.is_redactie()));

-- Homepage-teksten: publiek leesbaar, wijzigen door beheerder en creator.
create policy "iedereen leest paginateksten" on public.pagina_inhoud for select to anon, authenticated using (true);
create policy "beheerder wijzigt paginateksten" on public.pagina_inhoud for update to authenticated
  using ((select public.is_beheerder())) with check ((select public.is_beheerder()));

-- Logboek: alleen beheerder en creator lezen; schrijven doet alleen de trigger.
create policy "beheerder leest logboek" on public.wijzigingen for select to authenticated using ((select public.is_beheerder()));

insert into public.pagina_inhoud (sleutel) values ('homepage');
