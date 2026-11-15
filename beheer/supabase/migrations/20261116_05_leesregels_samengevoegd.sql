-- Eén leesregel per rol in plaats van twee (Supabase-advies 0006, multiple
-- permissive policies): een ingelogde gebruiker liep anders bij elke rij twee
-- regels door. Wie wat ziet verandert niet:
--   anon            alleen wat publiek is;
--   authenticated   met een profiel alles, zonder profiel alleen wat publiek is.

drop policy if exists "publiek leest gepubliceerde artikels" on public.blog;
drop policy if exists "redactie leest blog" on public.blog;
create policy "publiek leest gepubliceerde artikels" on public.blog for select to anon
  using (status = 'gepubliceerd' and publicatiedatum <= current_date);
create policy "ingelogd leest blog" on public.blog for select to authenticated
  using ((select privaat.is_redactie()) or (status = 'gepubliceerd' and publicatiedatum <= current_date));

drop policy if exists "publiek leest actieve teamleden" on public.team;
drop policy if exists "redactie leest team" on public.team;
create policy "publiek leest actieve teamleden" on public.team for select to anon using (actief);
create policy "ingelogd leest team" on public.team for select to authenticated
  using ((select privaat.is_redactie()) or actief);

drop policy if exists "publiek leest vacatures op de site" on public.vacatures;
drop policy if exists "redactie leest vacatures" on public.vacatures;
create policy "publiek leest vacatures op de site" on public.vacatures for select to anon
  using (zichtbaar and status in ('actief', 'ingevuld'));
create policy "ingelogd leest vacatures" on public.vacatures for select to authenticated
  using ((select privaat.is_redactie()) or (zichtbaar and status in ('actief', 'ingevuld')));
