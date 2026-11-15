-- Teksten van de doorklikpagina's: één rij per pagina in pagina_inhoud, net als
-- de homepage. De beschrijving van de velden staat op de website
-- (lib/paginas.ts, /api/pagina-schema). Een lege waarde = de standaardtekst.
-- Zelfde RLS: iedereen leest, beheerder en creator wijzigen. Nieuwe rijen komen
-- er alleen via een migratie (geen insert-regel voor gebruikers).
alter table public.pagina_inhoud drop constraint if exists pagina_inhoud_sleutel_check;
alter table public.pagina_inhoud add constraint pagina_inhoud_sleutel_check check (
  sleutel in ('homepage', 'algemeen', 'voor-bedrijven', 'voor-engineers', 'vacatures', 'contact', 'faq', 'open-sollicitatie', 'blog')
);

insert into public.pagina_inhoud (sleutel)
values ('algemeen'), ('voor-bedrijven'), ('voor-engineers'), ('vacatures'), ('contact'), ('faq'), ('open-sollicitatie'), ('blog')
on conflict (sleutel) do nothing;
