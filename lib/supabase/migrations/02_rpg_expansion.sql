-- Extend profiles with RPG fields
alter table public.profiles add column if not exists username text unique;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists village text;
alter table public.profiles add column if not exists character_name text;
alter table public.profiles add column if not exists bio text;

-- Create jutsus table
create table if not exists public.jutsus (
  id text primary key default gen_random_uuid()::text,
  name text not null unique,
  type text not null check (type in ('Ninjutsu', 'Taijutsu', 'Genjutsu', 'Fuinjutsu')),
  rank text not null check (rank in ('S', 'A', 'B', 'C', 'D')),
  description text not null,
  chakra_cost integer not null default 0,
  price integer not null default 0,
  difficulty integer not null check (difficulty >= 0 and difficulty <= 10),
  hand_seals text[] default array[]::text[],
  available_to_roles text[] not null default array['KAGE', 'MEMBER'],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- Create jutsu_updates feed table
create table if not exists public.jutsu_updates (
  id text primary key default gen_random_uuid()::text,
  jutsu_id text not null references public.jutsus(id) on delete cascade,
  changed_by uuid not null references auth.users(id) on delete restrict,
  changed_fields text[] not null,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS on new tables
alter table public.jutsus enable row level security;
alter table public.jutsu_updates enable row level security;

-- Grant permissions
grant usage on schema public to authenticated;
grant select on table public.jutsus to authenticated;
grant select on table public.jutsu_updates to authenticated;
grant update on table public.jutsus to authenticated;

-- RLS Policies for jutsus

-- Allow all authenticated users to read jutsus (role filtering happens in app)
drop policy if exists jutsus_select_all on public.jutsus;
create policy jutsus_select_all
on public.jutsus
for select
to authenticated
using (true);

-- Allow only KAGE users to update/insert jutsus
drop policy if exists jutsus_update_kage on public.jutsus;
create policy jutsus_update_kage
on public.jutsus
for update
to authenticated
using (public.is_kage(auth.uid()))
with check (public.is_kage(auth.uid()));

drop policy if exists jutsus_insert_kage on public.jutsus;
create policy jutsus_insert_kage
on public.jutsus
for insert
to authenticated
with check (public.is_kage(auth.uid()));

drop policy if exists jutsus_delete_kage on public.jutsus;
create policy jutsus_delete_kage
on public.jutsus
for delete
to authenticated
using (public.is_kage(auth.uid()));

-- RLS Policies for jutsu_updates

-- Allow all approved users to read the feed
drop policy if exists jutsu_updates_select_all on public.jutsu_updates;
create policy jutsu_updates_select_all
on public.jutsu_updates
for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.approval_status = 'APPROVED'
  )
);

-- System-only insert via trigger or application
grant insert on table public.jutsu_updates to authenticated;

-- Function to create feed entry when jutsu is updated
create or replace function public.log_jutsu_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_fields text[];
  before_snapshot jsonb;
  after_snapshot jsonb;
begin
  -- Determine which fields changed
  changed_fields := array[]::text[];
  if new.name is distinct from old.name then changed_fields := array_append(changed_fields, 'name'); end if;
  if new.type is distinct from old.type then changed_fields := array_append(changed_fields, 'type'); end if;
  if new.rank is distinct from old.rank then changed_fields := array_append(changed_fields, 'rank'); end if;
  if new.description is distinct from old.description then changed_fields := array_append(changed_fields, 'description'); end if;
  if new.chakra_cost is distinct from old.chakra_cost then changed_fields := array_append(changed_fields, 'chakra_cost'); end if;
  if new.price is distinct from old.price then changed_fields := array_append(changed_fields, 'price'); end if;
  if new.difficulty is distinct from old.difficulty then changed_fields := array_append(changed_fields, 'difficulty'); end if;
  if new.hand_seals is distinct from old.hand_seals then changed_fields := array_append(changed_fields, 'hand_seals'); end if;
  if new.available_to_roles is distinct from old.available_to_roles then changed_fields := array_append(changed_fields, 'available_to_roles'); end if;

  -- Create feed entry
  insert into public.jutsu_updates (jutsu_id, changed_by, changed_fields, before_snapshot, after_snapshot)
  values (
    new.id,
    new.updated_by,
    changed_fields,
    row_to_json(old),
    row_to_json(new)
  );

  return new;
end;
$$;

drop trigger if exists on_jutsu_update on public.jutsus;
create trigger on_jutsu_update
after update on public.jutsus
for each row
execute function public.log_jutsu_update();

-- Create index for fast feed queries
create index if not exists idx_jutsu_updates_created_at_desc on public.jutsu_updates (created_at desc);
create index if not exists idx_jutsu_updates_jutsu_id on public.jutsu_updates (jutsu_id);

-- Update trigger for updated_at column on jutsus
drop trigger if exists set_jutsus_updated_at on public.jutsus;
create trigger set_jutsus_updated_at
before update on public.jutsus
for each row
execute function public.set_updated_at();
