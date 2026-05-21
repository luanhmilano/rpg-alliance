-- 02-players-structure.sql
-- Player-related schema: Characters, Players
-- Relationship between auth.users and player metadata

begin;

-- Characters: In-game character profiles
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Players: Mapping of auth users to game metadata
-- Foreign key to auth.users via id (established at RLS trigger level)
create table if not exists public.players (
  id uuid primary key,  -- matches auth.users.id
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
