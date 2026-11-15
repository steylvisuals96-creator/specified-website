-- De bot schrijft als service_role. Het beheer ziet het rapport via RLS.
begin;

create table public.seo_runs (
  id uuid primary key default gen_random_uuid(),
  week date not null unique,
  gestart timestamptz not null default now(),
  voltooid timestamptz,
  status text not null default 'bezig' check (status in ('bezig', 'klaar', 'mislukt')),
  artikel_id uuid references public.blog (id) on delete set null,
  rapport jsonb not null default '{}'::jsonb
);

create table public.seo_voorstellen (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.seo_runs (id) on delete cascade,
  pad text not null check (pad in ('/', '/voor-bedrijven', '/voor-engineers', '/vacatures', '/contact', '/faq', '/blog')),
  titel text not null check (char_length(titel) between 15 and 70),
  beschrijving text not null check (char_length(beschrijving) between 50 and 165),
  vorige_titel text not null,
  vorige_beschrijving text not null,
  vorige_id uuid,
  reden text not null check (char_length(reden) between 1 and 350),
  zoekterm text not null,
  status text not null default 'open' check (status in ('open', 'toegepast', 'ingehaald', 'verworpen')),
  besloten_op timestamptz,
  besloten_door uuid references auth.users (id) on delete set null,
  unique (run_id, pad)
);

-- Deze tabel bevat uitsluitend metadata die de website mag tonen.
create table public.seo_metadata (
  pad text primary key,
  voorstel_id uuid not null references public.seo_voorstellen (id),
  titel text not null,
  beschrijving text not null,
  bijgewerkt timestamptz not null default now()
);

alter table public.seo_runs enable row level security;
alter table public.seo_voorstellen enable row level security;
alter table public.seo_metadata enable row level security;

revoke all on public.seo_runs, public.seo_voorstellen, public.seo_metadata from public, anon, authenticated;
grant select on public.seo_runs, public.seo_voorstellen to authenticated;
grant select (pad, titel, beschrijving) on public.seo_metadata to anon, authenticated;
grant all on public.seo_runs, public.seo_voorstellen, public.seo_metadata to service_role;

-- Gebruikers met een geverifieerde factor zien ook in de Data API pas
-- rapporten nadat ze de tweede stap hebben afgerond.
create function privaat.seo_mag_lezen() returns boolean
language sql stable security definer set search_path = ''
as $$
  select privaat.is_beheerder() and (
    (select auth.jwt()->>'aal') = 'aal2'
    or not exists (
      select 1 from auth.mfa_factors where user_id = (select auth.uid()) and status = 'verified'
    )
  )
$$;
revoke all on function privaat.seo_mag_lezen() from public, anon;
grant execute on function privaat.seo_mag_lezen() to authenticated;

create policy "beheerder leest SEO-runs" on public.seo_runs for select to authenticated
  using ((select privaat.seo_mag_lezen()));
create policy "beheerder leest SEO-voorstellen" on public.seo_voorstellen for select to authenticated
  using ((select privaat.seo_mag_lezen()));
create policy "publiek leest toegepaste metadata" on public.seo_metadata for select to anon, authenticated
  using (true);

create index seo_metadata_voorstel_idx on public.seo_metadata (voorstel_id);
create index seo_runs_artikel_idx on public.seo_runs (artikel_id);

-- Vergrendel de publicatie per pagina. Een verouderd voorstel kan de intussen
-- gepubliceerde tekst niet overschrijven, ook bij gelijktijdige goedkeuringen.
create function privaat.seo_beslis(p_id uuid, p_toepassen boolean, p_door uuid) returns text
language plpgsql set search_path = ''
as $$
declare
  voorstel public.seo_voorstellen;
begin
  select * into voorstel from public.seo_voorstellen where id = p_id for update;
  if not found or voorstel.status <> 'open' then return null; end if;

  if p_toepassen then
    perform pg_advisory_xact_lock(hashtextextended('specified-seo:' || voorstel.pad, 0));
    if (select voorstel_id from public.seo_metadata where pad = voorstel.pad) is distinct from voorstel.vorige_id then
      update public.seo_voorstellen set status = 'ingehaald', besloten_op = now(), besloten_door = p_door
      where id = voorstel.id;
      return null;
    end if;

    insert into public.seo_metadata (pad, voorstel_id, titel, beschrijving)
    values (voorstel.pad, voorstel.id, voorstel.titel, voorstel.beschrijving)
    on conflict (pad) do update set voorstel_id = excluded.voorstel_id, titel = excluded.titel,
      beschrijving = excluded.beschrijving, bijgewerkt = now();
  end if;

  update public.seo_voorstellen
    set status = case when p_toepassen then 'toegepast' else 'verworpen' end,
        besloten_op = now(), besloten_door = p_door
    where id = voorstel.id;
  return voorstel.pad;
end $$;

revoke all on function privaat.seo_beslis(uuid, boolean, uuid) from public, anon, authenticated;
grant usage on schema privaat to service_role;
grant execute on function privaat.seo_beslis(uuid, boolean, uuid) to service_role;

-- De server heeft vóór deze call al de sessie inclusief eventuele MFA nagekeken.
create function public.seo_beslis(p_id uuid, p_toepassen boolean, p_beheerder uuid) returns text
language plpgsql set search_path = ''
as $$
begin
  if not exists (select 1 from public.profielen where id = p_beheerder and rol in ('creator', 'beheerder')) then
    raise insufficient_privilege;
  end if;
  return privaat.seo_beslis(p_id, p_toepassen, p_beheerder);
end $$;

revoke all on function public.seo_beslis(uuid, boolean, uuid) from public, anon, authenticated;
grant execute on function public.seo_beslis(uuid, boolean, uuid) to service_role;

-- Artikel, media, rapport en voorstellen worden samen vastgelegd. Een fout laat
-- de vorige database-inhoud staan. R2 wordt door de aanroeper afgehandeld.
create function public.seo_voltooi(
  p_run uuid, p_rapport jsonb, p_artikel jsonb, p_media jsonb, p_voorstellen jsonb, p_automatisch boolean
) returns text[]
language plpgsql set search_path = ''
as $$
declare
  rij jsonb;
  media_id uuid;
  nieuw_artikel_id uuid;
  voorstel_id uuid;
  pad text;
  paden text[] := '{}';
begin
  perform 1 from public.seo_runs where id = p_run and status = 'bezig' for update;
  if not found then raise exception 'SEO-run is niet meer actief'; end if;

  if p_artikel is not null then
    if p_media is not null then
      insert into public.media (sleutel, bestandsnaam, mime, grootte, breedte, hoogte, alt)
      values (p_media->>'sleutel', p_media->>'bestandsnaam', 'image/webp',
        (p_media->>'grootte')::integer, 1536, 1024, p_media->>'alt')
      returning id into media_id;
    end if;
    insert into public.blog (slug, titel, status, cover_id, samenvatting, inhoud, meta_titel, meta_beschrijving)
    values (p_artikel->>'slug', p_artikel->>'titel', 'concept', media_id, p_artikel->>'samenvatting',
      p_artikel->'inhoud', p_artikel->>'metaTitel', p_artikel->>'metaBeschrijving')
    returning id into nieuw_artikel_id;
  end if;

  -- Vaste lockvolgorde bij automatisch toepassen op meerdere pagina's.
  for rij in select value from jsonb_array_elements(p_voorstellen) order by value->>'pad' loop
    insert into public.seo_voorstellen (run_id, pad, titel, beschrijving, vorige_titel, vorige_beschrijving, vorige_id, reden, zoekterm)
    values (p_run, rij->>'pad', rij->>'titel', rij->>'beschrijving', rij->>'vorigeTitel',
      rij->>'vorigeBeschrijving', (rij->>'vorigeId')::uuid, rij->>'reden', rij->>'zoekterm')
    returning id into voorstel_id;
    if p_automatisch then
      pad := privaat.seo_beslis(voorstel_id, true, null);
      if pad is not null then paden := array_append(paden, pad); end if;
    end if;
  end loop;

  update public.seo_runs set status = 'klaar', voltooid = now(), rapport = p_rapport, artikel_id = nieuw_artikel_id
  where id = p_run;
  return paden;
end $$;

revoke all on function public.seo_voltooi(uuid, jsonb, jsonb, jsonb, jsonb, boolean) from public, anon, authenticated;
grant execute on function public.seo_voltooi(uuid, jsonb, jsonb, jsonb, jsonb, boolean) to service_role;

commit;
