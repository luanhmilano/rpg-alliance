begin;

-- Allow authenticated users to read the technique catalog and audit feed.
grant select on public.techniques to authenticated;
grant select on public.jutsus to authenticated;
grant select on public.summonings to authenticated;
grant select on public.technique_costs to authenticated;
grant select on public.technique_limits to authenticated;
grant select on public.technique_effects to authenticated;
grant select on public.technique_effect_values to authenticated;
grant select on public.technique_targets to authenticated;
grant select on public.technique_escapes to authenticated;
grant select on public.technique_updates to authenticated;

-- Allow authenticated users to attempt technique mutations, but gate them with KAGE-only policies.
grant insert, update, delete on public.techniques to authenticated;
grant insert, update, delete on public.jutsus to authenticated;
grant insert, update, delete on public.summonings to authenticated;
grant insert, update, delete on public.technique_costs to authenticated;
grant insert, update, delete on public.technique_limits to authenticated;
grant insert, update, delete on public.technique_effects to authenticated;
grant insert, update, delete on public.technique_effect_values to authenticated;
grant insert, update, delete on public.technique_targets to authenticated;
grant insert, update, delete on public.technique_escapes to authenticated;

alter table if exists public.techniques enable row level security;
alter table if exists public.jutsus enable row level security;
alter table if exists public.summonings enable row level security;
alter table if exists public.technique_costs enable row level security;
alter table if exists public.technique_limits enable row level security;
alter table if exists public.technique_effects enable row level security;
alter table if exists public.technique_effect_values enable row level security;
alter table if exists public.technique_targets enable row level security;
alter table if exists public.technique_escapes enable row level security;
alter table if exists public.technique_updates enable row level security;

drop policy if exists "techniques are readable by authenticated users" on public.techniques;
create policy "techniques are readable by authenticated users"
  on public.techniques
  for select
  to authenticated
  using (true);

drop policy if exists "techniques are managed by kage" on public.techniques;
create policy "techniques are managed by kage"
  on public.techniques
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "techniques are updated by kage" on public.techniques;
create policy "techniques are updated by kage"
  on public.techniques
  for update
  to authenticated
  using (public.is_kage(auth.uid()))
  with check (public.is_kage(auth.uid()));

drop policy if exists "techniques are deleted by kage" on public.techniques;
create policy "techniques are deleted by kage"
  on public.techniques
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "jutsus are readable by authenticated users" on public.jutsus;
create policy "jutsus are readable by authenticated users"
  on public.jutsus
  for select
  to authenticated
  using (true);

drop policy if exists "jutsus are managed by kage" on public.jutsus;
create policy "jutsus are managed by kage"
  on public.jutsus
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "jutsus are removed by kage" on public.jutsus;
create policy "jutsus are removed by kage"
  on public.jutsus
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "summonings are readable by authenticated users" on public.summonings;
create policy "summonings are readable by authenticated users"
  on public.summonings
  for select
  to authenticated
  using (true);

drop policy if exists "summonings are managed by kage" on public.summonings;
create policy "summonings are managed by kage"
  on public.summonings
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "summonings are removed by kage" on public.summonings;
create policy "summonings are removed by kage"
  on public.summonings
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "technique costs are readable by authenticated users" on public.technique_costs;
create policy "technique costs are readable by authenticated users"
  on public.technique_costs
  for select
  to authenticated
  using (true);

drop policy if exists "technique costs are managed by kage" on public.technique_costs;
create policy "technique costs are managed by kage"
  on public.technique_costs
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique costs are updated by kage" on public.technique_costs;
create policy "technique costs are updated by kage"
  on public.technique_costs
  for update
  to authenticated
  using (public.is_kage(auth.uid()))
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique costs are deleted by kage" on public.technique_costs;
create policy "technique costs are deleted by kage"
  on public.technique_costs
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "technique limits are readable by authenticated users" on public.technique_limits;
create policy "technique limits are readable by authenticated users"
  on public.technique_limits
  for select
  to authenticated
  using (true);

drop policy if exists "technique limits are managed by kage" on public.technique_limits;
create policy "technique limits are managed by kage"
  on public.technique_limits
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique limits are updated by kage" on public.technique_limits;
create policy "technique limits are updated by kage"
  on public.technique_limits
  for update
  to authenticated
  using (public.is_kage(auth.uid()))
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique limits are deleted by kage" on public.technique_limits;
create policy "technique limits are deleted by kage"
  on public.technique_limits
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "technique effects are readable by authenticated users" on public.technique_effects;
create policy "technique effects are readable by authenticated users"
  on public.technique_effects
  for select
  to authenticated
  using (true);

drop policy if exists "technique effects are managed by kage" on public.technique_effects;
create policy "technique effects are managed by kage"
  on public.technique_effects
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique effects are updated by kage" on public.technique_effects;
create policy "technique effects are updated by kage"
  on public.technique_effects
  for update
  to authenticated
  using (public.is_kage(auth.uid()))
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique effects are deleted by kage" on public.technique_effects;
create policy "technique effects are deleted by kage"
  on public.technique_effects
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "technique effect values are readable by authenticated users" on public.technique_effect_values;
create policy "technique effect values are readable by authenticated users"
  on public.technique_effect_values
  for select
  to authenticated
  using (true);

drop policy if exists "technique effect values are managed by kage" on public.technique_effect_values;
create policy "technique effect values are managed by kage"
  on public.technique_effect_values
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique effect values are updated by kage" on public.technique_effect_values;
create policy "technique effect values are updated by kage"
  on public.technique_effect_values
  for update
  to authenticated
  using (public.is_kage(auth.uid()))
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique effect values are deleted by kage" on public.technique_effect_values;
create policy "technique effect values are deleted by kage"
  on public.technique_effect_values
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "technique targets are readable by authenticated users" on public.technique_targets;
create policy "technique targets are readable by authenticated users"
  on public.technique_targets
  for select
  to authenticated
  using (true);

drop policy if exists "technique targets are managed by kage" on public.technique_targets;
create policy "technique targets are managed by kage"
  on public.technique_targets
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique targets are deleted by kage" on public.technique_targets;
create policy "technique targets are deleted by kage"
  on public.technique_targets
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "technique escapes are readable by authenticated users" on public.technique_escapes;
create policy "technique escapes are readable by authenticated users"
  on public.technique_escapes
  for select
  to authenticated
  using (true);

drop policy if exists "technique escapes are managed by kage" on public.technique_escapes;
create policy "technique escapes are managed by kage"
  on public.technique_escapes
  for insert
  to authenticated
  with check (public.is_kage(auth.uid()));

drop policy if exists "technique escapes are deleted by kage" on public.technique_escapes;
create policy "technique escapes are deleted by kage"
  on public.technique_escapes
  for delete
  to authenticated
  using (public.is_kage(auth.uid()));

drop policy if exists "technique updates are readable by authenticated users" on public.technique_updates;
create policy "technique updates are readable by authenticated users"
  on public.technique_updates
  for select
  to authenticated
  using (true);

commit;