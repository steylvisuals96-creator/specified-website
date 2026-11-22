-- Tweestapslogin ook in de database afdwingen, niet alleen in de app.
--
-- Tot nu vroeg het beheer de code uit de authenticator-app, maar keken de
-- regels (RLS) alleen naar de rol. Wie het wachtwoord van een account met
-- tweestapslogin kende, kreeg met dat eerste token (aal1) via de Data API
-- toch alles wat bij de rol hoort.
--
-- Nu: heeft een gebruiker een geverifieerde factor, dan tellen zijn rechten
-- pas met een token van niveau aal2 (na de code). Zonder factor verandert er
-- niets; dat blijft de app regelen (MFA_VERPLICHT=1 stuurt zo iemand eerst naar
-- Account > Tweestapslogin).
--
-- Alle regels lopen via privaat.mijn_rol, is_redactie en is_beheerder.
-- "create or replace" houdt dezelfde functie, dus de regels hoeven niet opnieuw.
-- De enige regel die rechtstreeks auth.uid() gebruikt ("eigen naam wijzigen")
-- krijgt de controle er expliciet bij.

create function privaat.tweede_stap_ok() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt()->>'aal'), '') = 'aal2'
    or not exists (
      select 1 from auth.mfa_factors
      where user_id = (select auth.uid()) and status = 'verified'
    )
$$;
revoke all on function privaat.tweede_stap_ok() from public, anon;
grant execute on function privaat.tweede_stap_ok() to authenticated;

create or replace function privaat.mijn_rol() returns public.rol
language sql stable security definer set search_path = ''
as $$
  select rol from public.profielen
  where id = (select auth.uid()) and (select privaat.tweede_stap_ok())
$$;

create or replace function privaat.is_redactie() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profielen where id = (select auth.uid()))
    and (select privaat.tweede_stap_ok())
$$;

create or replace function privaat.is_beheerder() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profielen
    where id = (select auth.uid()) and rol in ('creator', 'beheerder')
  ) and (select privaat.tweede_stap_ok())
$$;

-- Zat al in de SEO-regel; nu dubbel, dus terug naar alleen de rol.
create or replace function privaat.seo_mag_lezen() returns boolean
language sql stable security definer set search_path = ''
as $$ select privaat.is_beheerder() $$;

drop policy "eigen naam wijzigen" on public.profielen;
create policy "eigen naam wijzigen" on public.profielen for update to authenticated
  using (id = (select auth.uid()) and (select privaat.tweede_stap_ok()))
  with check (id = (select auth.uid()) and (select privaat.tweede_stap_ok()));
