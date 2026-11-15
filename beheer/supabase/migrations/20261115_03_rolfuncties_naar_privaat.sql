-- De hulpfuncties voor rollen en de triggerfuncties uit het publieke API-schema
-- halen (Supabase-advies 0029). Policies en triggers verwijzen naar de functie
-- zelf, niet naar haar naam, en blijven dus werken. Het schema "privaat" staat
-- niet in de Data API.
create schema if not exists privaat;
revoke all on schema privaat from public, anon;
grant usage on schema privaat to authenticated;
alter function public.mijn_rol() set schema privaat;
alter function public.is_redactie() set schema privaat;
alter function public.is_beheerder() set schema privaat;
alter function public.log_wijziging() set schema privaat;
alter function public.zet_gewijzigd() set schema privaat;
