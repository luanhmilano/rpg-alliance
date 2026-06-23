-- run_all_migrations.sql
-- Master migration file: Execute all migrations in the correct order
-- This file can be used to set up the entire database from scratch
-- 
-- Usage in Supabase SQL Editor: Copy and paste this entire file and execute
-- Or use with supabase-cli: supabase db push
--
-- ⚠️  WARNING: This will create/modify tables. Review before running on production!

-- ============================================================================
-- STEP 1: SCHEMA - Table definitions
-- ============================================================================

-- 01-schema/01-core-entities.sql
begin;
create schema if not exists public;
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.villages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.ranks (
  id uuid primary key default gen_random_uuid(),
  value text not null unique check (value in ('C', 'B', 'A', 'S', 'SS', 'SSS')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.technique_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('NINJUTSU', 'TAIJUTSU', 'GENJUTSU', 'DOJUTSU', 'SUMMONING')),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
commit;

-- 01-schema/02-players-structure.sql
begin;
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.players (
  id uuid primary key,
  role_id uuid not null references public.roles(id) on delete restrict,
  approved boolean not null default false,
  email text not null unique,
  phone text,
  character_id uuid references public.characters(id) on delete set null,
  village_id uuid references public.villages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
commit;

-- 01-schema/03-techniques-structure.sql
begin;
create table if not exists public.techniques (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('JUTSU', 'SUMMONING')),
  technique_type_id uuid not null references public.technique_types(id) on delete restrict,
  name text not null,
  rank_id uuid not null references public.ranks(id) on delete restrict,
  link text,
  observations text,
  updated_by uuid references public.players(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uq_techniques_name_global on public.techniques (lower(name));
create table if not exists public.jutsus (
  technique_id uuid primary key references public.techniques(id) on delete cascade
);
create table if not exists public.summonings (
  technique_id uuid primary key references public.techniques(id) on delete cascade
);
create table if not exists public.technique_costs (
  id uuid primary key default gen_random_uuid(),
  technique_id uuid not null references public.techniques(id) on delete cascade,
  resource text not null check (resource in ('CK', 'HP', 'AG')),
  amount numeric not null check (amount >= 0),
  frequency text not null check (frequency in ('ONE_TIME', 'ACTIVATION', 'PER_TURN')),
  created_at timestamptz not null default now()
);
create table if not exists public.technique_limits (
  technique_id uuid primary key references public.techniques(id) on delete cascade,
  has_turn_limit boolean not null default false,
  max_active_turns integer,
  has_fight_use_limit boolean not null default false,
  max_uses_per_fight integer,
  has_card_use_limit boolean not null default false,
  max_uses_per_card integer,
  check ((has_turn_limit = false and max_active_turns is null) or (has_turn_limit = true and max_active_turns is not null and max_active_turns > 0)),
  check ((has_fight_use_limit = false and max_uses_per_fight is null) or (has_fight_use_limit = true and max_uses_per_fight is not null and max_uses_per_fight > 0)),
  check ((has_card_use_limit = false and max_uses_per_card is null) or (has_card_use_limit = true and max_uses_per_card is not null and max_uses_per_card > 0))
);
create table if not exists public.technique_effects (
  id uuid primary key default gen_random_uuid(),
  technique_id uuid not null references public.techniques(id) on delete cascade,
  target_scope text not null check (target_scope in ('SELF', 'ALLY', 'ENEMY', 'AREA')),
  affected_attribute text not null,
  effect_kind text not null check (effect_kind in ('FIXED', 'BUFF', 'BARRIER', 'SPECIAL')),
  operation text not null check (operation in ('SET', 'ADD', 'SUB', 'MULTIPLY')),
  execution_order integer,
  check (execution_order is null or execution_order >= 1)
);
create table if not exists public.technique_effect_values (
  effect_id uuid primary key references public.technique_effects(id) on delete cascade,
  value_type text not null check (value_type in ('NUMERIC', 'TEXT', 'TOKEN')),
  value_numeric numeric,
  value_text text,
  value_token text,
  check ((value_type = 'NUMERIC' and value_numeric is not null and value_text is null and value_token is null) or (value_type = 'TEXT' and value_numeric is null and value_text is not null and value_token is null) or (value_type = 'TOKEN' and value_numeric is null and value_text is null and value_token is not null))
);
create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.technique_targets (
  technique_id uuid not null references public.techniques(id) on delete cascade,
  target_id uuid not null references public.targets(id) on delete restrict,
  primary key (technique_id, target_id)
);
create table if not exists public.escapes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.technique_escapes (
  technique_id uuid not null references public.techniques(id) on delete cascade,
  escape_id uuid not null references public.escapes(id) on delete restrict,
  primary key (technique_id, escape_id)
);
create table if not exists public.technique_prices (
  id uuid primary key default gen_random_uuid(),
  technique_id uuid not null references public.techniques(id) on delete cascade,
  price_context text not null check (price_context in ('TECHNIQUE_PURCHASE', 'SUMMON_UNIT_PURCHASE', 'OTHER')),
  amount numeric not null check (amount >= 0),
  notes text,
  created_at timestamptz not null default now(),
  unique (technique_id, price_context)
);
commit;

-- 01-schema/04-audit-structure.sql
begin;
create table if not exists public.technique_updates (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('INSERT', 'UPDATE', 'DELETE')),
  technique_id uuid references public.techniques(id) on delete set null,
  technique_name_snapshot text not null,
  changed_by uuid references public.players(id) on delete set null,
  changed_fields text[] not null,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz not null default now()
);
commit;

-- ============================================================================
-- STEP 2: FUNCTIONS - Database functions
-- ============================================================================

-- 02-functions/01-utility-functions.sql
begin;
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
commit;

-- 02-functions/02-auth-functions.sql
begin;
create or replace function public.is_kage(uid uuid)
returns boolean language sql security definer stable as $$
  select exists(select 1 from public.players p where p.id = $1 and p.role_id = (select id from public.roles where name = 'KAGE'));
$$;

create or replace function public.can_update_players(uid uuid, target_player_id uuid, target_character_id uuid, target_village_id uuid, target_role_id uuid, target_approved boolean)
returns boolean language plpgsql security definer stable as $$
declare
  cur public.players%rowtype;
begin
  select * into cur from public.players where id = target_player_id;
  if cur is null then return false; end if;
  if exists (select 1 from public.players p where p.id = uid and p.role_id = (select id from public.roles where name = 'KAGE')) then return true; end if;
  if target_player_id is distinct from uid then return false; end if;
  if target_character_id is distinct from cur.character_id then return false; end if;
  if target_village_id is distinct from cur.village_id then return false; end if;
  if target_role_id is distinct from cur.role_id then return false; end if;
  if target_approved is distinct from cur.approved then return false; end if;
  return true;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  member_role_id uuid;
  normalized_phone text;
  village_uuid uuid;
  character_uuid uuid;
begin
  select id into member_role_id from public.roles where name = 'MEMBER';
  if member_role_id is null then raise exception 'Role MEMBER nao encontrada no banco'; end if;
  normalized_phone := nullif(new.raw_user_meta_data ->> 'phone', '');
  village_uuid := nullif(new.raw_user_meta_data ->> 'villageId', '')::uuid;
  character_uuid := nullif(new.raw_user_meta_data ->> 'characterId', '')::uuid;
  insert into public.players (id, role_id, approved, email, phone, village_id, character_id)
  values (new.id, member_role_id, false, new.email, normalized_phone, village_uuid, character_uuid);
  return new;
end;
$$;
commit;

-- 02-functions/03-technique-functions.sql
begin;
create or replace function public.log_technique_lifecycle()
returns trigger language plpgsql as $$
declare
  changed_fields text[] := array[]::text[];
  actor_id uuid;
begin
  if tg_op = 'INSERT' then
    actor_id := new.updated_by;
    insert into public.technique_updates (event_type, technique_id, technique_name_snapshot, changed_by, changed_fields, before_snapshot, after_snapshot)
    values ('INSERT', new.id, new.name, actor_id, array['created'], null, to_jsonb(new));
    return new;
  elsif tg_op = 'UPDATE' then
    actor_id := coalesce(new.updated_by, old.updated_by);
    if new.kind is distinct from old.kind then changed_fields := array_append(changed_fields, 'kind'); end if;
    if new.name is distinct from old.name then changed_fields := array_append(changed_fields, 'name'); end if;
    if new.technique_type_id is distinct from old.technique_type_id then changed_fields := array_append(changed_fields, 'technique_type_id'); end if;
    if new.rank_id is distinct from old.rank_id then changed_fields := array_append(changed_fields, 'rank_id'); end if;
    if new.link is distinct from old.link then changed_fields := array_append(changed_fields, 'link'); end if;
    if new.observations is distinct from old.observations then changed_fields := array_append(changed_fields, 'observations'); end if;
    if new.updated_by is distinct from old.updated_by then changed_fields := array_append(changed_fields, 'updated_by'); end if;
    if coalesce(array_length(changed_fields, 1), 0) = 0 then changed_fields := array['updated']; end if;
    insert into public.technique_updates (event_type, technique_id, technique_name_snapshot, changed_by, changed_fields, before_snapshot, after_snapshot)
    values ('UPDATE', new.id, new.name, actor_id, changed_fields, to_jsonb(old), to_jsonb(new));
    return new;
  else
    actor_id := old.updated_by;
    insert into public.technique_updates (event_type, technique_id, technique_name_snapshot, changed_by, changed_fields, before_snapshot, after_snapshot)
    values ('DELETE', old.id, old.name, actor_id, array['deleted'], to_jsonb(old), null);
    return old;
  end if;
end;
$$;
commit;

-- ============================================================================
-- STEP 3: TRIGGERS
-- ============================================================================

-- 03-triggers/01-timestamp-triggers.sql
begin;
drop trigger if exists trg_roles_set_updated_at on public.roles;
create trigger trg_roles_set_updated_at before update on public.roles for each row execute function public.set_updated_at();
drop trigger if exists trg_villages_set_updated_at on public.villages;
create trigger trg_villages_set_updated_at before update on public.villages for each row execute function public.set_updated_at();
drop trigger if exists trg_ranks_set_updated_at on public.ranks;
create trigger trg_ranks_set_updated_at before update on public.ranks for each row execute function public.set_updated_at();
drop trigger if exists trg_technique_types_set_updated_at on public.technique_types;
create trigger trg_technique_types_set_updated_at before update on public.technique_types for each row execute function public.set_updated_at();
drop trigger if exists trg_characters_set_updated_at on public.characters;
create trigger trg_characters_set_updated_at before update on public.characters for each row execute function public.set_updated_at();
drop trigger if exists trg_players_set_updated_at on public.players;
create trigger trg_players_set_updated_at before update on public.players for each row execute function public.set_updated_at();
drop trigger if exists trg_techniques_set_updated_at on public.techniques;
create trigger trg_techniques_set_updated_at before update on public.techniques for each row execute function public.set_updated_at();
commit;

-- 03-triggers/02-audit-triggers.sql
begin;
drop trigger if exists trg_techniques_log_lifecycle on public.techniques;
create trigger trg_techniques_log_lifecycle after insert or update or delete on public.techniques for each row execute function public.log_technique_lifecycle();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_auth_user();
commit;

-- ============================================================================
-- STEP 4: ROW LEVEL SECURITY
-- ============================================================================

-- 04-rls/01-rls-enable.sql
begin;
alter table if exists public.roles enable row level security;
alter table if exists public.villages enable row level security;
alter table if exists public.ranks enable row level security;
alter table if exists public.technique_types enable row level security;
alter table if exists public.characters enable row level security;
alter table if exists public.players enable row level security;
alter table if exists public.techniques enable row level security;
alter table if exists public.jutsus enable row level security;
alter table if exists public.summonings enable row level security;
alter table if exists public.technique_costs enable row level security;
alter table if exists public.technique_limits enable row level security;
alter table if exists public.technique_effects enable row level security;
alter table if exists public.technique_effect_values enable row level security;
alter table if exists public.technique_targets enable row level security;
alter table if exists public.targets enable row level security;
alter table if exists public.technique_escapes enable row level security;
alter table if exists public.escapes enable row level security;
alter table if exists public.technique_prices enable row level security;
alter table if exists public.technique_updates enable row level security;
commit;

-- 04-rls/02-public-tables-policies.sql
begin;
drop policy if exists "roles are readable by everyone" on public.roles;
create policy "roles are readable by everyone" on public.roles for select to anon, authenticated using (true);
drop policy if exists "villages are readable by everyone" on public.villages;
create policy "villages are readable by everyone" on public.villages for select to anon, authenticated using (true);
drop policy if exists "ranks are readable by everyone" on public.ranks;
create policy "ranks are readable by everyone" on public.ranks for select to anon, authenticated using (true);
drop policy if exists "technique types are readable by authenticated users" on public.technique_types;
create policy "technique types are readable by authenticated users" on public.technique_types for select to authenticated using (true);
drop policy if exists "technique types are managed by kage" on public.technique_types;
create policy "technique types are managed by kage" on public.technique_types for all to authenticated using (public.is_kage(auth.uid())) with check (public.is_kage(auth.uid()));
drop policy if exists "characters are readable by everyone" on public.characters;
create policy "characters are readable by everyone" on public.characters for select to anon, authenticated using (true);
drop policy if exists "targets are readable by authenticated users" on public.targets;
create policy "targets are readable by authenticated users" on public.targets for select to authenticated using (true);
drop policy if exists "escapes are readable by authenticated users" on public.escapes;
create policy "escapes are readable by authenticated users" on public.escapes for select to authenticated using (true);
commit;

-- 04-rls/03-players-policies.sql
begin;
drop policy if exists "players can read own row or kage" on public.players;
create policy "players can read own row or kage" on public.players for select to authenticated using (auth.uid() = id or public.is_kage(auth.uid()));
drop policy if exists "players can update own row or kage" on public.players;
create policy "players can update own row or kage" on public.players for update to authenticated using (auth.uid() = id or public.is_kage(auth.uid())) with check (public.can_update_players(auth.uid(), id, character_id, village_id, role_id, approved));
commit;

-- 04-rls/04-techniques-policies.sql
begin;
drop policy if exists "techniques are readable by authenticated users" on public.techniques;
create policy "techniques are readable by authenticated users" on public.techniques for select to authenticated using (true);
drop policy if exists "techniques are managed by kage" on public.techniques;
create policy "techniques are managed by kage" on public.techniques for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "techniques are updated by kage" on public.techniques;
create policy "techniques are updated by kage" on public.techniques for update to authenticated using (public.is_kage(auth.uid())) with check (public.is_kage(auth.uid()));
drop policy if exists "techniques are deleted by kage" on public.techniques;
create policy "techniques are deleted by kage" on public.techniques for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "jutsus are readable by authenticated users" on public.jutsus;
create policy "jutsus are readable by authenticated users" on public.jutsus for select to authenticated using (true);
drop policy if exists "jutsus are managed by kage" on public.jutsus;
create policy "jutsus are managed by kage" on public.jutsus for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "jutsus are removed by kage" on public.jutsus;
create policy "jutsus are removed by kage" on public.jutsus for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "summonings are readable by authenticated users" on public.summonings;
create policy "summonings are readable by authenticated users" on public.summonings for select to authenticated using (true);
drop policy if exists "summonings are managed by kage" on public.summonings;
create policy "summonings are managed by kage" on public.summonings for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "summonings are removed by kage" on public.summonings;
create policy "summonings are removed by kage" on public.summonings for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "technique costs are readable by authenticated users" on public.technique_costs;
create policy "technique costs are readable by authenticated users" on public.technique_costs for select to authenticated using (true);
drop policy if exists "technique costs are managed by kage" on public.technique_costs;
create policy "technique costs are managed by kage" on public.technique_costs for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "technique costs are updated by kage" on public.technique_costs;
create policy "technique costs are updated by kage" on public.technique_costs for update to authenticated using (public.is_kage(auth.uid())) with check (public.is_kage(auth.uid()));
drop policy if exists "technique costs are deleted by kage" on public.technique_costs;
create policy "technique costs are deleted by kage" on public.technique_costs for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "technique limits are readable by authenticated users" on public.technique_limits;
create policy "technique limits are readable by authenticated users" on public.technique_limits for select to authenticated using (true);
drop policy if exists "technique limits are managed by kage" on public.technique_limits;
create policy "technique limits are managed by kage" on public.technique_limits for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "technique limits are updated by kage" on public.technique_limits;
create policy "technique limits are updated by kage" on public.technique_limits for update to authenticated using (public.is_kage(auth.uid())) with check (public.is_kage(auth.uid()));
drop policy if exists "technique limits are deleted by kage" on public.technique_limits;
create policy "technique limits are deleted by kage" on public.technique_limits for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "technique effects are readable by authenticated users" on public.technique_effects;
create policy "technique effects are readable by authenticated users" on public.technique_effects for select to authenticated using (true);
drop policy if exists "technique effects are managed by kage" on public.technique_effects;
create policy "technique effects are managed by kage" on public.technique_effects for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "technique effects are updated by kage" on public.technique_effects;
create policy "technique effects are updated by kage" on public.technique_effects for update to authenticated using (public.is_kage(auth.uid())) with check (public.is_kage(auth.uid()));
drop policy if exists "technique effects are deleted by kage" on public.technique_effects;
create policy "technique effects are deleted by kage" on public.technique_effects for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "technique effect values are readable by authenticated users" on public.technique_effect_values;
create policy "technique effect values are readable by authenticated users" on public.technique_effect_values for select to authenticated using (true);
drop policy if exists "technique effect values are managed by kage" on public.technique_effect_values;
create policy "technique effect values are managed by kage" on public.technique_effect_values for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "technique effect values are updated by kage" on public.technique_effect_values;
create policy "technique effect values are updated by kage" on public.technique_effect_values for update to authenticated using (public.is_kage(auth.uid())) with check (public.is_kage(auth.uid()));
drop policy if exists "technique effect values are deleted by kage" on public.technique_effect_values;
create policy "technique effect values are deleted by kage" on public.technique_effect_values for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "technique targets are readable by authenticated users" on public.technique_targets;
create policy "technique targets are readable by authenticated users" on public.technique_targets for select to authenticated using (true);
drop policy if exists "technique targets are managed by kage" on public.technique_targets;
create policy "technique targets are managed by kage" on public.technique_targets for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "technique targets are deleted by kage" on public.technique_targets;
create policy "technique targets are deleted by kage" on public.technique_targets for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "technique escapes are readable by authenticated users" on public.technique_escapes;
create policy "technique escapes are readable by authenticated users" on public.technique_escapes for select to authenticated using (true);
drop policy if exists "technique escapes are managed by kage" on public.technique_escapes;
create policy "technique escapes are managed by kage" on public.technique_escapes for insert to authenticated with check (public.is_kage(auth.uid()));
drop policy if exists "technique escapes are deleted by kage" on public.technique_escapes;
create policy "technique escapes are deleted by kage" on public.technique_escapes for delete to authenticated using (public.is_kage(auth.uid()));
drop policy if exists "technique prices are readable by authenticated users" on public.technique_prices;
create policy "technique prices are readable by authenticated users" on public.technique_prices for select to authenticated using (true);
drop policy if exists "technique prices are managed by kage" on public.technique_prices;
create policy "technique prices are managed by kage" on public.technique_prices for all to authenticated using (public.is_kage(auth.uid())) with check (public.is_kage(auth.uid()));
drop policy if exists "technique updates are readable by authenticated users" on public.technique_updates;
create policy "technique updates are readable by authenticated users" on public.technique_updates for select to authenticated using (true);
drop policy if exists "technique updates are inserted by kage" on public.technique_updates;
create policy "technique updates are inserted by kage" on public.technique_updates for insert to authenticated with check (public.is_kage(auth.uid()));
commit;

-- ============================================================================
-- STEP 5: GRANTS
-- ============================================================================

-- 05-grants/01-anon-grants.sql
begin;
grant select on public.roles to anon;
grant select on public.villages to anon;
grant select on public.ranks to anon;
grant select on public.characters to anon;
commit;

-- 05-grants/02-authenticated-grants.sql
begin;
grant select on public.roles to authenticated;
grant select on public.villages to authenticated;
grant select on public.ranks to authenticated;
grant select on public.technique_types to authenticated;
grant select on public.characters to authenticated;
grant select on public.targets to authenticated;
grant select on public.escapes to authenticated;
grant select, update on public.players to authenticated;
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

-- ============================================================================
-- STEP 6: INDEXES
-- ============================================================================

-- 06-indexes/01-all-indexes.sql
begin;
create index if not exists idx_players_role_id on public.players(role_id);
create index if not exists idx_players_character_id on public.players(character_id);
create index if not exists idx_players_village_id on public.players(village_id);
create index if not exists idx_players_email on public.players(email);
create index if not exists idx_players_created_at on public.players(created_at desc);
create index if not exists idx_techniques_kind on public.techniques(kind);
create index if not exists idx_techniques_technique_type_id on public.techniques(technique_type_id);
create index if not exists idx_techniques_rank_id on public.techniques(rank_id);
create index if not exists idx_techniques_updated_by on public.techniques(updated_by);
create index if not exists idx_techniques_created_at on public.techniques(created_at desc);
create index if not exists idx_technique_costs_technique_id on public.technique_costs(technique_id);
create index if not exists idx_technique_limits_technique_id on public.technique_limits(technique_id);
create index if not exists idx_technique_effects_technique_id on public.technique_effects(technique_id);
create index if not exists idx_technique_effect_values_effect_id on public.technique_effect_values(effect_id);
create index if not exists idx_technique_targets_technique_id on public.technique_targets(technique_id);
create index if not exists idx_technique_targets_target_id on public.technique_targets(target_id);
create index if not exists idx_technique_escapes_technique_id on public.technique_escapes(technique_id);
create index if not exists idx_technique_escapes_escape_id on public.technique_escapes(escape_id);
create index if not exists idx_technique_prices_technique_id on public.technique_prices(technique_id);
create index if not exists idx_technique_updates_technique_id on public.technique_updates(technique_id);
create index if not exists idx_technique_updates_event_type on public.technique_updates(event_type);
create index if not exists idx_technique_updates_created_at on public.technique_updates(created_at desc);
create index if not exists idx_technique_updates_changed_by on public.technique_updates(changed_by);
commit;

-- ============================================================================
-- STEP 7: SEEDS
-- ============================================================================

-- 07-seeds/01-roles.sql
begin;
insert into public.roles (name, description) values
  ('MEMBER', 'Regular player with standard permissions'),
  ('KAGE', 'Administrator with full control over techniques and players')
on conflict (name) do nothing;
commit;

-- 07-seeds/02-ranks.sql
begin;
insert into public.ranks (value, description) values
  ('C', 'Weakest rank'),
  ('B', 'Below average rank'),
  ('A', 'Above average rank'),
  ('S', 'Strong rank'),
  ('SS', 'Very strong rank'),
  ('SSS', 'Strongest rank')
on conflict (value) do nothing;
commit;

-- 07-seeds/03-technique-types.sql
begin;
insert into public.technique_types (code, name, description) values
  ('NINJUTSU', 'Ninjutsu', 'Ninja technique using chakra manipulation'),
  ('TAIJUTSU', 'Taijutsu', 'Physical combat technique'),
  ('GENJUTSU', 'Genjutsu', 'Illusion-based technique'),
  ('DOJUTSU', 'Dojutsu', 'Eye-based kekkei genkai technique'),
  ('SUMMONING', 'Invocacao', 'Summoning technique to call creatures')
on conflict (code) do nothing;
commit;

-- 07-seeds/04-villages.sql
begin;
-- Example villages - customize for your game world
-- insert into public.villages (name, description) values
--   ('Village 1', 'First major village'),
--   ('Village 2', 'Second major village'),
--   ('Village 3', 'Third major village')
-- on conflict (name) do nothing;
commit;

-- 07-seeds/05-targets-escapes.sql
begin;
insert into public.targets (code, description) values
  ('SELF', 'Technique targets the user'),
  ('SINGLE_ALLY', 'Technique targets a single ally'),
  ('ALL_ALLIES', 'Technique targets all allies'),
  ('SINGLE_ENEMY', 'Technique targets a single enemy'),
  ('ALL_ENEMIES', 'Technique targets all enemies'),
  ('AREA', 'Technique affects an area')
on conflict (code) do nothing;
insert into public.escapes (code, description) values
  ('DODGE', 'Can be escaped by dodging'),
  ('BLOCK', 'Can be blocked by a shield or similar'),
  ('COUNTER', 'Can be countered with another technique'),
  ('NONE', 'Cannot be escaped'),
  ('PARTIAL', 'Can be partially escaped or mitigated')
on conflict (code) do nothing;
commit;

-- ============================================================================
-- ✅ MIGRATION COMPLETE
-- ============================================================================
-- All database objects have been created and configured.
-- The schema is ready for application use.
