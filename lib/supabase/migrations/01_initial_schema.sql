-- RPG Alliance - Initial relational schema (fresh database)
-- Decisions applied:
-- 1) jsonb for snapshots
-- 2) timestamptz for all timestamps
-- 3) global uniqueness for technique names
-- 4) technique updates are preserved even after technique deletion

begin;

create extension if not exists pgcrypto;

create schema if not exists public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.villages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ranks (
  id uuid primary key default gen_random_uuid(),
  value text not null unique check (value in ('C', 'B', 'A', 'S', 'SS', 'SSS')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete restrict,
  approved boolean not null default false,
  email text not null unique,
  phone text,
  character_id uuid references public.characters(id) on delete set null,
  village_id uuid references public.villages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.techniques (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('JUTSU', 'SUMMONING')),
  name text not null,
  rank_id uuid not null references public.ranks(id) on delete restrict,
  link text,
  observations text,
  updated_by uuid references public.players(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Global name uniqueness across all technique kinds.
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
  resource text not null check (resource in ('CK', 'HP')),
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
  check (
    (has_turn_limit = false and max_active_turns is null)
    or (has_turn_limit = true and max_active_turns is not null and max_active_turns > 0)
  ),
  check (
    (has_fight_use_limit = false and max_uses_per_fight is null)
    or (has_fight_use_limit = true and max_uses_per_fight is not null and max_uses_per_fight > 0)
  )
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
  check (
    (value_type = 'NUMERIC' and value_numeric is not null and value_text is null and value_token is null)
    or (value_type = 'TEXT' and value_numeric is null and value_text is not null and value_token is null)
    or (value_type = 'TOKEN' and value_numeric is null and value_text is null and value_token is not null)
  )
);

create table if not exists public.targets (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null
);

create table if not exists public.technique_targets (
  technique_id uuid not null references public.techniques(id) on delete cascade,
  target_id uuid not null references public.targets(id) on delete restrict,
  primary key (technique_id, target_id)
);

create table if not exists public.escapes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null
);

create table if not exists public.technique_escapes (
  technique_id uuid not null references public.techniques(id) on delete cascade,
  escape_id uuid not null references public.escapes(id) on delete restrict,
  primary key (technique_id, escape_id)
);

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

create or replace function public.log_technique_lifecycle()
returns trigger
language plpgsql
as $$
declare
  changed_fields text[] := array[]::text[];
  actor_id uuid;
begin
  if tg_op = 'INSERT' then
    actor_id := new.updated_by;

    insert into public.technique_updates (
      event_type,
      technique_id,
      technique_name_snapshot,
      changed_by,
      changed_fields,
      before_snapshot,
      after_snapshot
    ) values (
      'INSERT',
      new.id,
      new.name,
      actor_id,
      array['created'],
      null,
      to_jsonb(new)
    );

    return new;
  elsif tg_op = 'UPDATE' then
    actor_id := coalesce(new.updated_by, old.updated_by);

    if new.kind is distinct from old.kind then changed_fields := array_append(changed_fields, 'kind'); end if;
    if new.name is distinct from old.name then changed_fields := array_append(changed_fields, 'name'); end if;
    if new.rank_id is distinct from old.rank_id then changed_fields := array_append(changed_fields, 'rank_id'); end if;
    if new.link is distinct from old.link then changed_fields := array_append(changed_fields, 'link'); end if;
    if new.observations is distinct from old.observations then changed_fields := array_append(changed_fields, 'observations'); end if;
    if new.updated_by is distinct from old.updated_by then changed_fields := array_append(changed_fields, 'updated_by'); end if;

    if coalesce(array_length(changed_fields, 1), 0) = 0 then
      changed_fields := array['updated'];
    end if;

    insert into public.technique_updates (
      event_type,
      technique_id,
      technique_name_snapshot,
      changed_by,
      changed_fields,
      before_snapshot,
      after_snapshot
    ) values (
      'UPDATE',
      new.id,
      new.name,
      actor_id,
      changed_fields,
      to_jsonb(old),
      to_jsonb(new)
    );

    return new;
  else
    actor_id := old.updated_by;

    insert into public.technique_updates (
      event_type,
      technique_id,
      technique_name_snapshot,
      changed_by,
      changed_fields,
      before_snapshot,
      after_snapshot
    ) values (
      'DELETE',
      old.id,
      old.name,
      actor_id,
      array['deleted'],
      to_jsonb(old),
      null
    );

    return old;
  end if;
end;
$$;

drop trigger if exists trg_roles_set_updated_at on public.roles;
create trigger trg_roles_set_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_villages_set_updated_at on public.villages;
create trigger trg_villages_set_updated_at
before update on public.villages
for each row
execute function public.set_updated_at();

drop trigger if exists trg_ranks_set_updated_at on public.ranks;
create trigger trg_ranks_set_updated_at
before update on public.ranks
for each row
execute function public.set_updated_at();

drop trigger if exists trg_characters_set_updated_at on public.characters;
create trigger trg_characters_set_updated_at
before update on public.characters
for each row
execute function public.set_updated_at();

drop trigger if exists trg_players_set_updated_at on public.players;
create trigger trg_players_set_updated_at
before update on public.players
for each row
execute function public.set_updated_at();

drop trigger if exists trg_techniques_set_updated_at on public.techniques;
create trigger trg_techniques_set_updated_at
before update on public.techniques
for each row
execute function public.set_updated_at();

drop trigger if exists trg_techniques_log_lifecycle on public.techniques;
create trigger trg_techniques_log_lifecycle
after insert or update or delete on public.techniques
for each row
execute function public.log_technique_lifecycle();

create index if not exists idx_players_role_id on public.players(role_id);
create index if not exists idx_players_character_id on public.players(character_id);
create index if not exists idx_players_village_id on public.players(village_id);

create index if not exists idx_techniques_kind on public.techniques(kind);
create index if not exists idx_techniques_rank_id on public.techniques(rank_id);
create index if not exists idx_techniques_updated_by on public.techniques(updated_by);
create index if not exists idx_techniques_created_at on public.techniques(created_at desc);

create index if not exists idx_technique_costs_technique_id on public.technique_costs(technique_id);
create index if not exists idx_technique_effects_technique_id on public.technique_effects(technique_id);
create index if not exists idx_technique_updates_technique_id on public.technique_updates(technique_id);
create index if not exists idx_technique_updates_event_type on public.technique_updates(event_type);
create index if not exists idx_technique_updates_created_at on public.technique_updates(created_at desc);

commit;
