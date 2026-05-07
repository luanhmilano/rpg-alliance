-- Align public.jutsus with the domain model discussed in product requirements.
-- Model fields:
-- rank, atk, chackra, description, observations, requirements,
-- escape, price, link, characters, cooldown, targets, type.

-- Keep compatibility with older column naming if this migration runs after v02.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jutsus'
      and column_name = 'chakra_cost'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'jutsus'
      and column_name = 'chackra'
  ) then
    execute 'alter table public.jutsus rename column chakra_cost to chackra';
  end if;
end $$;

-- Add new optional and required columns.
alter table public.jutsus add column if not exists atk text;
alter table public.jutsus add column if not exists chackra integer;
alter table public.jutsus add column if not exists observations text;
alter table public.jutsus add column if not exists requirements text;
alter table public.jutsus add column if not exists escape text;
alter table public.jutsus add column if not exists link text;
alter table public.jutsus add column if not exists characters text[];
alter table public.jutsus add column if not exists cooldown integer;
alter table public.jutsus add column if not exists targets text;

-- Backfill required values for existing rows.
update public.jutsus
set chackra = coalesce(chackra, 0),
    link = coalesce(link, 'https://example.com')
where chackra is null
   or link is null;

-- Normalize old type values to the new enum domain.
update public.jutsus
set type = 'Ninjutsu'
where type = 'Fuinjutsu';

-- Drop older check constraints if they exist.
alter table public.jutsus drop constraint if exists jutsus_rank_check;
alter table public.jutsus drop constraint if exists jutsus_type_check;

-- Apply the new required constraints.
alter table public.jutsus
  alter column rank set not null,
  alter column description set not null,
  alter column price set not null,
  alter column chackra set not null,
  alter column link set not null,
  alter column type set not null;

-- Apply new enum-like checks.
alter table public.jutsus
  add constraint jutsus_rank_check
  check (rank in ('C', 'B', 'A', 'S', 'SS', 'SSS'));

alter table public.jutsus
  add constraint jutsus_type_check
  check (type in ('Ninjutsu', 'Taijutsu', 'Dojutsu', 'Genjutsu'));

-- Update feed logging function to track the aligned fields.
create or replace function public.log_jutsu_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_fields text[];
begin
  changed_fields := array[]::text[];

  if new.name is distinct from old.name then
    changed_fields := array_append(changed_fields, 'name');
  end if;
  if new.rank is distinct from old.rank then
    changed_fields := array_append(changed_fields, 'rank');
  end if;
  if new.atk is distinct from old.atk then
    changed_fields := array_append(changed_fields, 'atk');
  end if;
  if new.chackra is distinct from old.chackra then
    changed_fields := array_append(changed_fields, 'chackra');
  end if;
  if new.description is distinct from old.description then
    changed_fields := array_append(changed_fields, 'description');
  end if;
  if new.observations is distinct from old.observations then
    changed_fields := array_append(changed_fields, 'observations');
  end if;
  if new.requirements is distinct from old.requirements then
    changed_fields := array_append(changed_fields, 'requirements');
  end if;
  if new.escape is distinct from old.escape then
    changed_fields := array_append(changed_fields, 'escape');
  end if;
  if new.price is distinct from old.price then
    changed_fields := array_append(changed_fields, 'price');
  end if;
  if new.link is distinct from old.link then
    changed_fields := array_append(changed_fields, 'link');
  end if;
  if new.characters is distinct from old.characters then
    changed_fields := array_append(changed_fields, 'characters');
  end if;
  if new.cooldown is distinct from old.cooldown then
    changed_fields := array_append(changed_fields, 'cooldown');
  end if;
  if new.targets is distinct from old.targets then
    changed_fields := array_append(changed_fields, 'targets');
  end if;
  if new.type is distinct from old.type then
    changed_fields := array_append(changed_fields, 'type');
  end if;

  insert into public.jutsu_updates (
    jutsu_id,
    changed_by,
    changed_fields,
    before_snapshot,
    after_snapshot
  )
  values (
    new.id,
    coalesce(new.updated_by, auth.uid()),
    changed_fields,
    row_to_json(old),
    row_to_json(new)
  );

  return new;
end;
$$;

create index if not exists idx_jutsus_rank on public.jutsus (rank);
create index if not exists idx_jutsus_type on public.jutsus (type);
create index if not exists idx_jutsus_price on public.jutsus (price);
create index if not exists idx_jutsus_chackra on public.jutsus (chackra);
create index if not exists idx_jutsus_characters_gin on public.jutsus using gin (characters);
