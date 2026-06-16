-- 03-players-policies.sql
-- Policies for player records: Players can read/update their own, KAGE can manage all

begin;

-- PLAYERS: Read own or if KAGE
drop policy if exists "players can read own row or kage" on public.players;
create policy "players can read own row or kage"
  on public.players
  for select
  to authenticated
  using (
    auth.uid() = id
    or public.is_kage(auth.uid())
  );

-- PLAYERS: Update own (with restrictions) or if KAGE
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
