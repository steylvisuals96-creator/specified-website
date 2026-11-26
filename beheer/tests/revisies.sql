-- Uitsluitend lokaal uitvoeren in een wegwerpdatabase; alles wordt teruggedraaid.
\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('11111111-1111-4111-8111-111111111111'), ('22222222-2222-4222-8222-222222222222'), ('33333333-3333-4333-8333-333333333333');
insert into public.profielen(id,naam,rol) values ('11111111-1111-4111-8111-111111111111','Sam','creator'),('22222222-2222-4222-8222-222222222222','Simon','beheerder'),('33333333-3333-4333-8333-333333333333','Redacteur','redacteur');
select set_config('request.jwt.claim.sub','22222222-2222-4222-8222-222222222222',true),set_config('request.jwt.claim.aal','aal2',true);
set local role authenticated;
insert into public.revisies(titel,pagina,beschrijving,apparaat,prioriteit) values ('Footer aanpassen','/en#footer','Nieuw telefoonnummer','mobiel','hoog') returning id as revisie_id, gewijzigd as versie \gset
insert into public.revisies(titel,pagina,beschrijving) values ('Homepage','/','Controleer de kop.');
do $$ begin
 if (select auteur_naam from public.revisies where titel='Footer aanpassen') <> 'Simon' then raise exception 'Auteur fout'; end if;
 if (select count(*) from public.revisie_activiteiten where actie='aangemaakt') <> 2 then raise exception 'Historiek ontbreekt'; end if;
 begin insert into public.revisies(titel,pagina,beschrijving,auteur_naam) values ('Vervalst','/','Test','Tom'); raise exception 'Auteur vervalsbaar'; exception when insufficient_privilege then null; end;
 begin insert into public.revisie_activiteiten(revisie_id,auteur_naam,actie) select id,'Tom','aangemaakt' from public.revisies limit 1; raise exception 'Historiek vervalsbaar'; exception when insufficient_privilege then null; end;
 begin insert into public.revisies(titel,pagina,beschrijving) values ('Extern','//evil.be','Test'); raise exception 'Extern pad aanvaard'; exception when check_violation then null; end;
end $$;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
update public.revisies set status='bezig' where id=:'revisie_id';
insert into public.revisie_reacties(revisie_id,tekst) values (:'revisie_id','Ik pak dit op.');
do $$ begin
 if not exists(select from public.revisie_activiteiten where auteur_naam='Sam' and actie='status' and van='open' and naar='bezig') then raise exception 'Statusauteur ontbreekt'; end if;
 if not exists(select from public.revisie_reacties where auteur_naam='Sam') then raise exception 'Reactieauteur ontbreekt'; end if;
 begin update public.revisies set auteur_naam='Ander'; raise exception 'Auteur wijzigbaar'; exception when insufficient_privilege then null; end;
 begin delete from public.revisies; raise exception 'Revisies verwijderbaar'; exception when insufficient_privilege then null; end;
end $$;
-- De oorspronkelijke versie mag een latere wijziging niet overschrijven.
update public.revisies set status='afgerond' where id=:'revisie_id' and gewijzigd=:'versie';
do $$ begin if exists(select from public.revisies where status='afgerond') then raise exception 'Conflictbeveiliging faalt'; end if; end $$;
select set_config('request.jwt.claim.sub','33333333-3333-4333-8333-333333333333',true);
insert into public.revisie_reacties(revisie_id,tekst) values (:'revisie_id','Extra uitleg van de redacteur.');
update public.revisies set status='afgerond' where id=:'revisie_id';
do $$ begin if exists(select from public.revisies where status='afgerond') then raise exception 'Redacteur kan status wijzigen'; end if; end $$;
select set_config('request.jwt.claim.aal','aal1',true);
do $$ begin
 if (select count(*) from public.revisies) <> 0 or (select count(*) from public.revisie_reacties) <> 0 or (select count(*) from public.revisie_activiteiten) <> 0 then raise exception 'Zonder MFA leesbaar'; end if;
 begin insert into public.revisies(titel,pagina,beschrijving) values ('Geen MFA','/','Test'); raise exception 'Zonder MFA schrijven'; exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform 1 from public.revisies; raise exception 'Anoniem leesbaar'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'Revisietests geslaagd: auteurs, reacties, historiek, conflicten, rollen, MFA en anonieme toegang' as resultaat;
