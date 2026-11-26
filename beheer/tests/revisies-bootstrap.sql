create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key);
create table auth.mfa_factors(user_id uuid, status text);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select jsonb_build_object('aal', current_setting('request.jwt.claim.aal', true)) $$;
grant usage on schema auth to anon, authenticated;
grant execute on all functions in schema auth to anon, authenticated;
