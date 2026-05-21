-- 01-anon-grants.sql
-- Grant permissions for anonymous (unauthenticated) users

begin;

-- Anonymous users can read public lookup tables
grant select on public.roles to anon;
grant select on public.villages to anon;
grant select on public.ranks to anon;
grant select on public.characters to anon;

commit;
