-- 02-auth-functions.sql
-- Authentication and authorization helper functions

begin;

-- Check if a player has KAGE role
create or replace function public.is_kage(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 from public.players p
    where p.id = $1
      and p.role_id = (select id from public.roles where name = 'KAGE')
  );
$$;

-- Validate player update permissions
-- KAGE can update any player, regular users can only update specific fields of their own record
create or replace function public.can_update_players(
  uid uuid,
  target_player_id uuid,
  target_character_id uuid,
  target_village_id uuid,
  target_role_id uuid,
  target_approved boolean
)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  cur public.players%rowtype;
begin
  select * into cur from public.players where id = target_player_id;
  if cur is null then
    return false;
  end if;

  -- KAGE can update any player
  if exists (
    select 1 from public.players p where p.id = uid and p.role_id = (select id from public.roles where name = 'KAGE')
  ) then
    return true;
  end if;

  if target_player_id is distinct from uid then
    return false;
  end if;

  -- Regular players cannot change character_id, village_id, role_id or approved flag via direct updates.
  if target_character_id is distinct from cur.character_id then
    return false;
  end if;
  if target_village_id is distinct from cur.village_id then
    return false;
  end if;
  if target_role_id is distinct from cur.role_id then
    return false;
  end if;
  if target_approved is distinct from cur.approved then
    return false;
  end if;

  -- email and phone are allowed to change by the owner
  return true;
end;
$$;

-- Handle new authenticated users: Create player record
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  member_role_id uuid;
  normalized_phone text;
  village_uuid uuid;
  character_uuid uuid;
begin
  select id
    into member_role_id
  from public.roles
  where name = 'MEMBER';

  if member_role_id is null then
    raise exception 'Role MEMBER nao encontrada no banco';
  end if;

  normalized_phone := nullif(new.raw_user_meta_data ->> 'phone', '');
  village_uuid := nullif(new.raw_user_meta_data ->> 'villageId', '')::uuid;
  character_uuid := nullif(new.raw_user_meta_data ->> 'characterId', '')::uuid;

  insert into public.players (
    id,
    role_id,
    approved,
    email,
    phone,
    village_id,
    character_id
  ) values (
    new.id,
    member_role_id,
    false,
    new.email,
    normalized_phone,
    village_uuid,
    character_uuid
  );

  return new;
end;
$$;

commit;
