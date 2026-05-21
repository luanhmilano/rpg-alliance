begin;

create table if not exists public.technique_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code in ('NINJUTSU', 'TAIJUTSU', 'GENJUTSU', 'DOJUTSU', 'SUMMONING')),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.technique_types (code, name)
values
  ('NINJUTSU', 'Ninjutsu'),
  ('TAIJUTSU', 'Taijutsu'),
  ('GENJUTSU', 'Genjutsu'),
  ('DOJUTSU', 'Dojutsu'),
  ('SUMMONING', 'Invocacao')
on conflict (code) do update
set name = excluded.name;

alter table public.techniques
  add column if not exists technique_type_id uuid references public.technique_types(id) on delete restrict;

update public.techniques t
set technique_type_id = tt.id
from public.technique_types tt
where t.technique_type_id is null
  and (
    (t.kind = 'SUMMONING' and tt.code = 'SUMMONING')
    or (t.kind = 'JUTSU' and tt.code = 'NINJUTSU')
  );

alter table public.techniques
  alter column technique_type_id set not null;

create index if not exists idx_techniques_technique_type_id on public.techniques(technique_type_id);

alter table public.technique_limits
  add column if not exists has_card_use_limit boolean not null default false,
  add column if not exists max_uses_per_card integer;

alter table public.technique_limits
  drop constraint if exists technique_limits_card_limit_check;

alter table public.technique_limits
  add constraint technique_limits_card_limit_check
  check (
    (has_card_use_limit = false and max_uses_per_card is null)
    or (has_card_use_limit = true and max_uses_per_card is not null and max_uses_per_card > 0)
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

create index if not exists idx_technique_prices_technique_id on public.technique_prices(technique_id);

grant select on public.technique_types to authenticated;
grant insert, update, delete on public.technique_types to authenticated;
grant select on public.technique_prices to authenticated;
grant insert, update, delete on public.technique_prices to authenticated;

alter table if exists public.technique_types enable row level security;
alter table if exists public.technique_prices enable row level security;

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

drop policy if exists "technique prices are readable by authenticated users" on public.technique_prices;
create policy "technique prices are readable by authenticated users"
  on public.technique_prices
  for select
  to authenticated
  using (true);

drop policy if exists "technique prices are managed by kage" on public.technique_prices;
create policy "technique prices are managed by kage"
  on public.technique_prices
  for all
  to authenticated
  using (public.is_kage(auth.uid()))
  with check (public.is_kage(auth.uid()));

commit;
