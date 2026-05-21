-- 01-all-indexes.sql
-- Database indexes for query performance optimization

begin;

-- Players indexes
create index if not exists idx_players_role_id on public.players(role_id);
create index if not exists idx_players_character_id on public.players(character_id);
create index if not exists idx_players_village_id on public.players(village_id);
create index if not exists idx_players_email on public.players(email);
create index if not exists idx_players_created_at on public.players(created_at desc);

-- Techniques indexes
create index if not exists idx_techniques_kind on public.techniques(kind);
create index if not exists idx_techniques_technique_type_id on public.techniques(technique_type_id);
create index if not exists idx_techniques_rank_id on public.techniques(rank_id);
create index if not exists idx_techniques_updated_by on public.techniques(updated_by);
create index if not exists idx_techniques_created_at on public.techniques(created_at desc);

-- Technique relationships indexes
create index if not exists idx_technique_costs_technique_id on public.technique_costs(technique_id);
create index if not exists idx_technique_limits_technique_id on public.technique_limits(technique_id);
create index if not exists idx_technique_effects_technique_id on public.technique_effects(technique_id);
create index if not exists idx_technique_effect_values_effect_id on public.technique_effect_values(effect_id);
create index if not exists idx_technique_targets_technique_id on public.technique_targets(technique_id);
create index if not exists idx_technique_targets_target_id on public.technique_targets(target_id);
create index if not exists idx_technique_escapes_technique_id on public.technique_escapes(technique_id);
create index if not exists idx_technique_escapes_escape_id on public.technique_escapes(escape_id);
create index if not exists idx_technique_prices_technique_id on public.technique_prices(technique_id);

-- Audit trail indexes
create index if not exists idx_technique_updates_technique_id on public.technique_updates(technique_id);
create index if not exists idx_technique_updates_event_type on public.technique_updates(event_type);
create index if not exists idx_technique_updates_created_at on public.technique_updates(created_at desc);
create index if not exists idx_technique_updates_changed_by on public.technique_updates(changed_by);

commit;
