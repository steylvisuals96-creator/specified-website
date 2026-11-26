-- Indexen op de twee verwijzingen naar profielen die er nog geen hadden (opkuis, 2026-11-26).
create index if not exists seizoensthema_gewijzigd_door_idx on public.seizoensthema (gewijzigd_door);
create index if not exists seo_voorstellen_besloten_door_idx on public.seo_voorstellen (besloten_door);
