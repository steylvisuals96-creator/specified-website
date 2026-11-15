-- Eén instelling voor de publieke website. Begint in de gewone huisstijl.
begin;

create table public.seizoensthema (
  id boolean primary key default true check (id),
  thema text not null default 'standaard'
    check (thema in ('standaard', 'kerst', 'winter', 'lente', 'zomer', 'herfst')),
  vanaf date,
  tot_en_met date,
  gewijzigd timestamptz not null default now(),
  gewijzigd_door uuid references public.profielen(id) on delete set null,
  check (vanaf is null or tot_en_met is null or vanaf <= tot_en_met),
  check (thema <> 'standaard' or (vanaf is null and tot_en_met is null))
);

insert into public.seizoensthema default values;

alter table public.seizoensthema enable row level security;
revoke all on public.seizoensthema from public, anon, authenticated;
grant select (id, thema, vanaf, tot_en_met) on public.seizoensthema to anon, authenticated;
grant update (thema, vanaf, tot_en_met) on public.seizoensthema to authenticated;

create policy "iedereen leest seizoensthema" on public.seizoensthema for select to anon, authenticated using (true);
create policy "beheerder wijzigt seizoensthema" on public.seizoensthema for update to authenticated
  using ((select privaat.is_beheerder())) with check ((select privaat.is_beheerder()));

create trigger seizoensthema_gewijzigd before update on public.seizoensthema
  for each row execute function privaat.zet_gewijzigd();
create trigger seizoensthema_log after update on public.seizoensthema
  for each row execute function privaat.log_wijziging();

commit;
