-- Public read access for jutsus GET endpoints.
grant select on table public.jutsus to anon;

drop policy if exists jutsus_select_anon on public.jutsus;
create policy jutsus_select_anon
on public.jutsus
for select
to anon
using (true);
