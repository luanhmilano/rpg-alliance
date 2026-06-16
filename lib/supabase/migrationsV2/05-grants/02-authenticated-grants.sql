-- 02-authenticated-grants.sql
-- Grant permissions for authenticated users

begin;

-- Public lookup tables: SELECT only
grant select on public.roles to authenticated;
grant select on public.villages to authenticated;
grant select on public.ranks to authenticated;
grant select on public.technique_types to authenticated;
grant select on public.characters to authenticated;
grant select on public.targets to authenticated;
grant select on public.escapes to authenticated;

-- Players: SELECT and UPDATE (RLS restricts access)
grant select, update on public.players to authenticated;

-- Technique catalog: SELECT only (RLS restricts mutations to KAGE)
grant select on public.techniques to authenticated;
grant select on public.jutsus to authenticated;
grant select on public.summonings to authenticated;
grant select on public.technique_costs to authenticated;
grant select on public.technique_limits to authenticated;
grant select on public.technique_effects to authenticated;
grant select on public.technique_effect_values to authenticated;
grant select on public.technique_targets to authenticated;
grant select on public.technique_escapes to authenticated;
grant select on public.technique_prices to authenticated;
grant select on public.technique_updates to authenticated;

-- Technique mutations: Granted but gated by RLS policies (KAGE only)
grant insert, update, delete on public.techniques to authenticated;
grant insert, update, delete on public.jutsus to authenticated;
grant insert, update, delete on public.summonings to authenticated;
grant insert, update, delete on public.technique_costs to authenticated;
grant insert, update, delete on public.technique_limits to authenticated;
grant insert, update, delete on public.technique_effects to authenticated;
grant insert, update, delete on public.technique_effect_values to authenticated;
grant insert, update, delete on public.technique_targets to authenticated;
grant insert, update, delete on public.technique_escapes to authenticated;
grant insert, update, delete on public.technique_types to authenticated;
grant insert, update, delete on public.technique_prices to authenticated;
grant insert on public.technique_updates to authenticated;

commit;
