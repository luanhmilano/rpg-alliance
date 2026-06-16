-- 01-core-entities.sql
-- Core entities: Roles, Villages, Ranks
-- These are foundational lookup tables used throughout the system

begin;

create schema if not exists public;

-- Roles: Define user access levels (MEMBER, KAGE, etc.)
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Villages: Organizational units for characters
create table if not exists public.villages (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ranks: Power level classifications (C, B, A, S, SS, SSS)
create table if not exists public.ranks (
  id uuid primary key default gen_random_uuid(),
  value text not null unique check (value in ('C', 'B', 'A', 'S', 'SS', 'SSS')),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Technique Types: Classification of techniques (NINJUTSU, TAIJUTSU, etc.)
create table if not exists public.technique_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('NINJUTSU', 'TAIJUTSU', 'GENJUTSU', 'DOJUTSU', 'SUMMONING')),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

commit;
