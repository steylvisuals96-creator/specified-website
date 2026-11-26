-- Feedback op de website, met onveranderbare auteur en activiteitenhistoriek.
begin;

create table public.revisies (
  id uuid primary key default gen_random_uuid(),
  titel text not null check (char_length(trim(titel)) between 1 and 160),
  pagina text not null check (char_length(pagina) between 1 and 600 and pagina ~ '^/($|[^/])' and pagina !~ '[\\\x00-\x20]'),
  beschrijving text not null check (char_length(trim(beschrijving)) between 1 and 6000),
  apparaat text not null default 'alle' check (apparaat in ('alle', 'desktop', 'tablet', 'mobiel')),
  prioriteit text not null default 'normaal' check (prioriteit in ('laag', 'normaal', 'hoog')),
  status text not null default 'open' check (status in ('open', 'bezig', 'nakijken', 'afgerond')),
  aangemaakt_door uuid references auth.users(id) on delete set null default auth.uid(),
  auteur_naam text not null default '',
  aangemaakt timestamptz not null default now(),
  gewijzigd timestamptz not null default now(),
  gewijzigd_door uuid references auth.users(id) on delete set null
);

create table public.revisie_reacties (
  id uuid primary key default gen_random_uuid(),
  revisie_id uuid not null references public.revisies(id),
  tekst text not null check (char_length(trim(tekst)) between 1 and 4000),
  aangemaakt_door uuid references auth.users(id) on delete set null default auth.uid(),
  auteur_naam text not null default '',
  aangemaakt timestamptz not null default now()
);

create table public.revisie_activiteiten (
  id bigint generated always as identity primary key,
  revisie_id uuid not null references public.revisies(id),
  auteur_naam text not null,
  actie text not null check (actie in ('aangemaakt', 'status', 'prioriteit')),
  van text,
  naar text,
  aangemaakt timestamptz not null default now()
);

create index revisies_lijst_idx on public.revisies(status, aangemaakt desc, id);
create index revisies_auteur_idx on public.revisies(aangemaakt_door);
create index revisies_gewijzigd_door_idx on public.revisies(gewijzigd_door);
create index revisie_reacties_revisie_idx on public.revisie_reacties(revisie_id, aangemaakt);
create index revisie_reacties_auteur_idx on public.revisie_reacties(aangemaakt_door);
create index revisie_activiteiten_revisie_idx on public.revisie_activiteiten(revisie_id, aangemaakt);

-- De naam wordt in de database vastgelegd, nooit uit een formulier vertrouwd.
create function privaat.revisie_auteur() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not coalesce(privaat.is_redactie(), false) then
    raise exception 'Geen toegang' using errcode = '42501';
  end if;
  new.aangemaakt_door := auth.uid();
  select coalesce(nullif(naam, ''), 'Teamlid') into new.auteur_naam
    from public.profielen where id = auth.uid();
  new.aangemaakt := clock_timestamp();
  return new;
end $$;

create function privaat.revisie_log() returns trigger
language plpgsql security definer set search_path = '' as $$
declare naam text;
begin
  select coalesce(nullif(p.naam, ''), 'Teamlid') into naam
    from public.profielen p where p.id = auth.uid();
  if tg_op = 'INSERT' then
    insert into public.revisie_activiteiten(revisie_id, auteur_naam, actie)
      values(new.id, new.auteur_naam, 'aangemaakt');
  else
    if old.status is distinct from new.status then
      insert into public.revisie_activiteiten(revisie_id, auteur_naam, actie, van, naar)
        values(new.id, coalesce(naam, 'Systeem'), 'status', old.status, new.status);
    end if;
    if old.prioriteit is distinct from new.prioriteit then
      insert into public.revisie_activiteiten(revisie_id, auteur_naam, actie, van, naar)
        values(new.id, coalesce(naam, 'Systeem'), 'prioriteit', old.prioriteit, new.prioriteit);
    end if;
  end if;
  return null;
end $$;

create trigger revisies_auteur before insert on public.revisies for each row execute function privaat.revisie_auteur();
create trigger revisie_reacties_auteur before insert on public.revisie_reacties for each row execute function privaat.revisie_auteur();
create function privaat.revisie_bijwerken() returns trigger
language plpgsql set search_path = '' as $$
begin
  -- Ook twee wijzigingen in dezelfde transactie krijgen een eigen versie.
  new.gewijzigd := clock_timestamp();
  new.gewijzigd_door := coalesce(auth.uid(), new.gewijzigd_door);
  return new;
end $$;
create trigger revisies_gewijzigd before update on public.revisies for each row execute function privaat.revisie_bijwerken();
create trigger revisies_activiteiten after insert or update on public.revisies for each row execute function privaat.revisie_log();
create trigger revisies_logboek after insert or update on public.revisies for each row execute function privaat.log_wijziging();

revoke all on function privaat.revisie_auteur(), privaat.revisie_log(), privaat.revisie_bijwerken() from public, anon, authenticated;
alter table public.revisies enable row level security;
alter table public.revisie_reacties enable row level security;
alter table public.revisie_activiteiten enable row level security;
revoke all on public.revisies, public.revisie_reacties, public.revisie_activiteiten from anon, authenticated;
grant select on public.revisies, public.revisie_reacties, public.revisie_activiteiten to authenticated;
grant insert (titel, pagina, beschrijving, apparaat, prioriteit) on public.revisies to authenticated;
grant update (status, prioriteit) on public.revisies to authenticated;
grant insert (revisie_id, tekst) on public.revisie_reacties to authenticated;
create policy "redactie leest revisies" on public.revisies for select to authenticated using ((select privaat.is_redactie()));
create policy "redactie meldt revisie" on public.revisies for insert to authenticated with check ((select privaat.is_redactie()) and aangemaakt_door = (select auth.uid()));
create policy "beheerder volgt revisie op" on public.revisies for update to authenticated using ((select privaat.is_beheerder())) with check ((select privaat.is_beheerder()));
create policy "redactie leest reacties" on public.revisie_reacties for select to authenticated using ((select privaat.is_redactie()));
create policy "redactie reageert" on public.revisie_reacties for insert to authenticated with check ((select privaat.is_redactie()) and aangemaakt_door = (select auth.uid()));
create policy "redactie leest revisiehistoriek" on public.revisie_activiteiten for select to authenticated using ((select privaat.is_redactie()));
commit;
