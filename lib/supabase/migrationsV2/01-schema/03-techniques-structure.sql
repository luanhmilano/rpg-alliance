-- 03-techniques-structure.sql
-- Technique system: Core technique management and related entities
-- Comprehensive technique definition with costs, limits, effects, and targets

begin;

-- Main techniques table: Base definition for jutsus and summonings
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

-- Global name uniqueness across all technique kinds and types
create unique index if not exists uq_techniques_name_global on public.techniques (lower(name));

-- Technique type classification: JUTSU or SUMMONING
create table if not exists public.jutsus (
  technique_id uuid primary key references public.techniques(id) on delete cascade
);

create table if not exists public.summonings (
  technique_id uuid primary key references public.techniques(id) on delete cascade
);

-- Cost definition: CK (Chakra), HP (Health)
create table if not exists public.technique_costs (
  id uuid primary key default gen_random_uuid(),
  technique_id uuid not null references public.techniques(id) on delete cascade,
  resource text not null check (resource in ('CK', 'HP')),
  amount numeric not null check (amount >= 0),
  frequency text not null check (frequency in ('ONE_TIME', 'ACTIVATION', 'PER_TURN')),
  created_at timestamptz not null default now()
);

-- Usage limitations: Turn limits, fight use limits, card use limits
create table if not exists public.technique_limits (
  technique_id uuid primary key references public.techniques(id) on delete cascade,
  has_turn_limit boolean not null default false,
  max_active_turns integer,
  has_fight_use_limit boolean not null default false,
  max_uses_per_fight integer,
  has_card_use_limit boolean not null default false,
  max_uses_per_card integer,
  check (
    (has_turn_limit = false and max_active_turns is null)
    or (has_turn_limit = true and max_active_turns is not null and max_active_turns > 0)
  ),
  check (
    (has_fight_use_limit = false and max_uses_per_fight is null)
    or (has_fight_use_limit = true and max_uses_per_fight is not null and max_uses_per_fight > 0)
  ),
  check (
    (has_card_use_limit = false and max_uses_per_card is null)
    or (has_card_use_limit = true and max_uses_per_card is not null and max_uses_per_card > 0)
  )
);

-- Effect application: What changes when technique is used
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

-- Effect value storage: Numeric, text, or token values
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

-- Technique targets: Who the technique can target
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

-- Technique escapes: How techniques can be escaped
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

-- Technique pricing: Market values for different contexts
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
