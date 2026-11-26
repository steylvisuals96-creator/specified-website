-- Tweestapslogin verplicht in de database, ook voor wie nog geen factor heeft.
--
-- Sinds 20261123_01 vroegen de regels aal2 alleen aan wie al een factor had.
-- Een account zonder factor kon met alleen het wachtwoord (aal1) via de Data
-- API nog schrijven en concepten lezen. Nu telt een rol pas met een token van
-- niveau aal2, voor iedereen. Hoort samen met MFA_VERPLICHT=1 in het beheer:
-- dat stuurt wie nog geen factor heeft eerst naar Account > Tweestapslogin.
--
-- Het koppelen van de app loopt via Supabase Auth en niet via deze regels, en
-- het eigen profiel blijft leesbaar, zodat een nieuw account kan inloggen en
-- tot aan het instellen van de code geraakt. Service-rol (gebruikersbeheer,
-- SEO-bot) en de triggers gebruiken deze functies niet.

create or replace function privaat.tweede_stap_ok() returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select auth.jwt()->>'aal'), '') = 'aal2'
$$;

-- Eigen rij altijd leesbaar (naam en rol), ook voor de tweede stap.
-- In dezelfde regel, zodat er geen tweede permissive policy bijkomt.
drop policy "redactie leest profielen" on public.profielen;
create policy "redactie leest profielen" on public.profielen for select to authenticated
  using (
    id = (select auth.uid())
    or (
      (select privaat.is_redactie())
      and (rol <> 'creator' or (select privaat.mijn_rol()) = 'creator')
    )
  );
