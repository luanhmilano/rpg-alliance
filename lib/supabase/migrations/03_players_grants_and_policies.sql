begin;

-- Grant basic select privileges so PostgREST role can access tables
grant select on public.roles to anon, authenticated;
grant select on public.villages to anon, authenticated;
grant select on public.characters to anon, authenticated;

-- Allow authenticated role to select and update players (RLS still applies)
grant select, update on public.players to authenticated;

-- Avoid querying public.players from within a policy (causes infinite recursion).
-- Create SECURITY DEFINER helper functions that check role/mutation rules and run with definer rights.
drop function if exists public.is_kage(uuid) cascade;
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

drop function if exists public.can_update_players(uuid, uuid, uuid, uuid, uuid, boolean) cascade;
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

  -- email and phone are allowed to change by the owner (password changes at auth layer).
  return true;
end;
$$;

-- Update players policies to allow KAGE users to manage/see other players
drop policy if exists "players can read own row" on public.players;
drop policy if exists "players can read own row or kage" on public.players;
create policy "players can read own row or kage"
  on public.players
  for select
  to authenticated
  using (
    auth.uid() = id
    or public.is_kage(auth.uid())
  );

drop policy if exists "players can update own row" on public.players;
drop policy if exists "players can update own row or kage" on public.players;
create policy "players can update own row or kage"
  on public.players
  for update
  to authenticated
  using (
    auth.uid() = id
    or public.is_kage(auth.uid())
  )
  with check (
    public.can_update_players(auth.uid(), id, character_id, village_id, role_id, approved)
  );

commit;