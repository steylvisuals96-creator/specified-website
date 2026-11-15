-- Overstap: wat sinds de eerste kopie (2026-11-15) in de oude CMS (schema payload)
-- veranderde, opnieuw naar de tabellen van het beheer halen. Draai dit vlak voor
-- NEXT_PUBLIC_DATABRON=supabase op de website komt.
--
-- Veilig om meermaals te draaien:
--   - rijen die nog niet bestaan komen erbij;
--   - bestaande rijen worden alleen bijgewerkt als de oude CMS nieuwer is dan
--     de laatste wijziging in het beheer (wat in het beheer werd aangepast blijft);
--   - niets wordt verwijderd. Het laatste resultaat toont wat in het beheer
--     staat maar niet (meer) in de oude CMS: dat beslis je met de hand.
--
-- Draaien: Supabase > SQL Editor, alles plakken en uitvoeren. Elke stap geeft
-- het aantal nieuwe en bijgewerkte rijen terug.

-- Tekst binnen een blok: tekstknopen met opmaak, links als markering.
create function pg_temp.lex_inline(n jsonb, marks jsonb) returns jsonb
language plpgsql as $$
declare
  res jsonb := '[]';
  c jsonb;
  m jsonb := marks;
  f int;
begin
  if n ->> 'type' = 'text' then
    f := coalesce((n ->> 'format')::int, 0);
    if (f & 1) <> 0 then m := m || '[{"type":"bold"}]'; end if;
    if (f & 2) <> 0 then m := m || '[{"type":"italic"}]'; end if;
    if (f & 8) <> 0 then m := m || '[{"type":"underline"}]'; end if;
    if coalesce(n ->> 'text', '') = '' then return '[]'; end if;
    return jsonb_build_array(
      jsonb_build_object('type', 'text', 'text', n ->> 'text')
      || case when jsonb_array_length(m) > 0 then jsonb_build_object('marks', m) else '{}'::jsonb end
    );
  elsif n ->> 'type' = 'linebreak' then
    return '[{"type":"hardBreak"}]';
  elsif n ->> 'type' in ('link', 'autolink') then
    m := marks || jsonb_build_array(jsonb_build_object('type', 'link', 'attrs',
      jsonb_build_object('href', coalesce(n #>> '{fields,url}', n ->> 'url', '#'))));
  end if;
  for c in select * from jsonb_array_elements(coalesce(n -> 'children', '[]')) loop
    res := res || pg_temp.lex_inline(c, m);
  end loop;
  return res;
end $$;

create function pg_temp.met_inhoud(knoop jsonb, inl jsonb) returns jsonb
language sql as $$
  select knoop || case when jsonb_array_length(inl) > 0 then jsonb_build_object('content', inl) else '{}'::jsonb end
$$;

create function pg_temp.lex_blok(n jsonb) returns jsonb
language plpgsql as $$
declare
  items jsonb := '[]';
  c jsonb;
  t text := n ->> 'type';
begin
  if t = 'heading' then
    return pg_temp.met_inhoud(
      jsonb_build_object('type', 'heading', 'attrs', jsonb_build_object('level',
        case when n ->> 'tag' in ('h3', 'h4', 'h5', 'h6') then 3 else 2 end)),
      pg_temp.lex_inline(n, '[]'));
  elsif t = 'list' then
    for c in select * from jsonb_array_elements(coalesce(n -> 'children', '[]')) loop
      items := items || jsonb_build_array(jsonb_build_object('type', 'listItem', 'content',
        jsonb_build_array(pg_temp.met_inhoud('{"type":"paragraph"}', pg_temp.lex_inline(c, '[]')))));
    end loop;
    return jsonb_build_object('type', case when n ->> 'listType' = 'number' then 'orderedList' else 'bulletList' end, 'content', items);
  elsif t = 'quote' then
    return jsonb_build_object('type', 'blockquote', 'content',
      jsonb_build_array(pg_temp.met_inhoud('{"type":"paragraph"}', pg_temp.lex_inline(n, '[]'))));
  elsif t = 'horizontalrule' then
    return '{"type":"horizontalRule"}';
  end if;
  return pg_temp.met_inhoud('{"type":"paragraph"}', pg_temp.lex_inline(n, '[]'));
end $$;

create function pg_temp.lex2tiptap(l jsonb) returns jsonb
language sql as $$
  select case when l #> '{root,children}' is null then null else (
    select jsonb_build_object('type', 'doc', 'content', coalesce(jsonb_agg(pg_temp.lex_blok(c) order by nr), '[]'))
    from jsonb_array_elements(l #> '{root,children}') with ordinality as x(c, nr)
  ) end
$$;


-- 1. Vacatures
with resultaat as (
  insert into public.vacatures as doel (id, slug, titel, vakgebied, contract, status, locatie, ervaring, uren, opleiding,
    talen, beschrijving, vereisten, nice_to_have, aanbod, geplaatst_op, zichtbaar, aangemaakt, gewijzigd)
  select v.id, v.slug, v.titel, v.sector::text, v.type::text, coalesce(v.status::text, 'actief'),
    coalesce(nullif(v.locatie, ''), 'België'), v.ervaringsniveau::text, v.uren::text, v.opleidingsniveau::text,
    coalesce((select array_agg(t.value::text order by t."order") from payload.vacatures_talen t where t.parent_id = v.id), '{}'),
    pg_temp.lex2tiptap(v.beschrijving),
    coalesce((select array_agg(r.punt order by r._order) from payload.vacatures_vereisten r where r._parent_id = v.id), '{}'),
    coalesce((select array_agg(r.punt order by r._order) from payload.vacatures_nice_to_have r where r._parent_id = v.id), '{}'),
    coalesce((select array_agg(r.punt order by r._order) from payload.vacatures_aanbod r where r._parent_id = v.id), '{}'),
    v.gepubliceerd_op::date, coalesce(v.zichtbaar_op_website, true), v.created_at, v.updated_at
  from payload.vacatures v
  on conflict (id) do update set
    titel = excluded.titel, vakgebied = excluded.vakgebied, contract = excluded.contract, status = excluded.status,
    locatie = excluded.locatie, ervaring = excluded.ervaring, uren = excluded.uren, opleiding = excluded.opleiding,
    talen = excluded.talen, beschrijving = excluded.beschrijving, vereisten = excluded.vereisten,
    nice_to_have = excluded.nice_to_have, aanbod = excluded.aanbod, geplaatst_op = excluded.geplaatst_op,
    zichtbaar = excluded.zichtbaar
  where doel.gewijzigd < excluded.gewijzigd
  returning (xmax = 0) as nieuw
)
select 'vacatures' as tabel, count(*) filter (where nieuw) as nieuw, count(*) filter (where not nieuw) as bijgewerkt from resultaat;

insert into public.vacatures_intern (vacature_id, salaris)
select v.id, coalesce(v.salaris, '') from payload.vacatures v
on conflict (vacature_id) do nothing;

-- 2. Blog
with resultaat as (
  insert into public.blog as doel (id, slug, titel, status, publicatiedatum, cover_url, samenvatting, inhoud,
    meta_titel, meta_beschrijving, aangemaakt, gewijzigd)
  select b.id, b.slug, b.titel, b.status::text, coalesce(b.publicatiedatum::date, current_date), b.cover_url,
    coalesce(b.samenvatting, ''), pg_temp.lex2tiptap(b.inhoud),
    coalesce(b.meta_titel, ''), coalesce(b.meta_beschrijving, ''), b.created_at, b.updated_at
  from payload.blog b
  on conflict (id) do update set
    titel = excluded.titel, status = excluded.status, publicatiedatum = excluded.publicatiedatum,
    cover_url = excluded.cover_url, samenvatting = excluded.samenvatting, inhoud = excluded.inhoud,
    meta_titel = excluded.meta_titel, meta_beschrijving = excluded.meta_beschrijving
  where doel.gewijzigd < excluded.gewijzigd
  returning (xmax = 0) as nieuw
)
select 'blog' as tabel, count(*) filter (where nieuw) as nieuw, count(*) filter (where not nieuw) as bijgewerkt from resultaat;

-- 3. Homepage-teksten (alleen als de oude CMS nieuwer is dan de laatste opslag in het beheer)
with resultaat as (
  update public.pagina_inhoud set waarde = jsonb_strip_nulls(jsonb_build_object(
    'hero', jsonb_build_object('prefix', w.hero_prefix, 'woord', w.hero_woord, 'suffix', w.hero_suffix,
      'ctaBedrijven', w.hero_cta_bedrijven, 'ctaEngineers', w.hero_cta_engineers),
    'tekening', jsonb_build_object('intro', w.tekening_intro, 'scrollHint', w.tekening_scroll_hint,
      'project', w.tekening_project, 'locatie', w.tekening_locatie, 'waarden', w.tekening_waarden, 'akkoord', w.tekening_akkoord),
    'callouts', (select coalesce(jsonb_agg(jsonb_build_object('label', c.label, 'tekst', c.tekst) order by c._order), '[]')
      from payload.website_callouts c where c._parent_id = w.id),
    'consultants', jsonb_build_object('titel', w.consultants_titel, 'accent', w.consultants_accent, 'tekst', w.consultants_tekst,
      'profielen', (select coalesce(jsonb_agg(jsonb_build_object('naam', p.naam) order by p._order), '[]')
        from payload.website_consultants_profielen p where p._parent_id = w.id)),
    'diensten_bedrijven', jsonb_build_object('kop', w.diensten_bedrijven_kop, 'titel', w.diensten_bedrijven_titel,
      'tekst', w.diensten_bedrijven_tekst, 'cta', w.diensten_bedrijven_cta),
    'diensten_engineers', jsonb_build_object('kop', w.diensten_engineers_kop, 'titel', w.diensten_engineers_titel,
      'tekst', w.diensten_engineers_tekst, 'cta', w.diensten_engineers_cta),
    'jobs', jsonb_build_object('titel', w.jobs_titel, 'linkTekst', w.jobs_link_tekst),
    'contact', jsonb_build_object('email', w.contact_email, 'telefoon', w.contact_telefoon,
      'linkedin', w.contact_linkedin, 'footerTekst', w.contact_footer_tekst)
  ))
  from (select * from payload.website limit 1) w
  where sleutel = 'homepage' and pagina_inhoud.gewijzigd < w.updated_at
  returning 1
)
select 'homepage' as tabel, 0 as nieuw, count(*) as bijgewerkt from resultaat;

-- 4. Ter controle: staat in het beheer, niet (meer) in de oude CMS. Niets wordt verwijderd.
select 'vacature' as soort, titel from public.vacatures where id not in (select id from payload.vacatures)
union all
select 'artikel', titel from public.blog where id not in (select id from payload.blog);
