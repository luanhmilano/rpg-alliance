-- 02-public-tables-policies.sql
-- Policies for public lookup tables: Roles, Villages, Ranks, Technique Types, Targets, Escapes
-- These are readable by everyone but only managed by KAGE

begin;

-- ROLES: Public read
drop policy if exists "roles are readable by everyone" on public.roles;
create policy "roles are readable by everyone"
  on public.roles
  for select
  to anon, authenticated
  using (true);

-- VILLAGES: Public read
drop policy if exists "villages are readable by everyone" on public.villages;
create policy "villages are readable by everyone"
  on public.villages
  for select
  to anon, authenticated
  using (true);

-- RANKS: Public read
drop policy if exists "ranks are readable by everyone" on public.ranks;
create policy "ranks are readable by everyone"
  on public.ranks
  for select
  to anon, authenticated
  using (true);

-- TECHNIQUE TYPES: Public read
drop policy if exists "technique types are readable by authenticated users" on public.technique_types;
create policy "technique types are readable by authenticated users"
  on public.technique_types
  for select
  to authenticated
  using (true);

drop policy if exists "technique types are managed by kage" on public.technique_types;
create policy "technique types are managed by kage"
  on public.technique_types
  for all
  to authenticated
  using (public.is_kage(auth.uid()))
  with check (public.is_kage(auth.uid()));

-- CHARACTERS: Public read
drop policy if exists "characters are readable by everyone" on public.characters;
create policy "characters are readable by everyone"
  on public.characters
  for select
  to anon, authenticated
  using (true);

-- TARGETS: Public read
drop policy if exists "targets are readable by authenticated users" on public.targets;
create policy "targets are readable by authenticated users"
  on public.targets
  for select
  to authenticated
  using (true);

-- ESCAPES: Public read
drop policy if exists "escapes are readable by authenticated users" on public.escapes;
create policy "escapes are readable by authenticated users"
  on public.escapes
  for select
  to authenticated
  using (true);

commit;
