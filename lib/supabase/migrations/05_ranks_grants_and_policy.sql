begin;

-- Rank options are used by authenticated dashboard forms.
grant select on public.ranks to anon, authenticated;

alter table if exists public.ranks enable row level security;

drop policy if exists "ranks are readable by everyone" on public.ranks;
create policy "ranks are readable by everyone"
  on public.ranks
  for select
  to anon, authenticated
  using (true);

commit;
