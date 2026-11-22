-- Engelse versie van de website (2026-11-23): per pagina een tweede rij met
-- de Engelse teksten, sleutel "en:<sleutel>". Zelfde vorm en dezelfde RLS als
-- de Nederlandse rij (iedereen leest, beheerder en creator wijzigen). Een
-- lege waarde betekent de Engelse standaardtekst van de website
-- (lib/inhoud-en.ts en lib/paginas.ts). E-mail, telefoon en LinkedIn blijven
-- alleen in de Nederlandse rij "homepage" staan.
alter table public.pagina_inhoud drop constraint if exists pagina_inhoud_sleutel_check;
alter table public.pagina_inhoud add constraint pagina_inhoud_sleutel_check check (
  sleutel in (
    'homepage', 'algemeen', 'voor-bedrijven', 'voor-engineers', 'vacatures', 'contact', 'faq', 'open-sollicitatie', 'blog',
    'en:homepage', 'en:algemeen', 'en:voor-bedrijven', 'en:voor-engineers', 'en:vacatures', 'en:contact', 'en:faq', 'en:open-sollicitatie', 'en:blog'
  )
);

insert into public.pagina_inhoud (sleutel)
values ('en:homepage'), ('en:algemeen'), ('en:voor-bedrijven'), ('en:voor-engineers'), ('en:vacatures'), ('en:contact'), ('en:faq'), ('en:open-sollicitatie'), ('en:blog')
on conflict (sleutel) do nothing;
