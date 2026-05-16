begin;

alter table if exists public.roles enable row level security;
drop policy if exists "roles are readable by everyone" on public.roles;
create policy "roles are readable by everyone"
  on public.roles
  for select
  to anon, authenticated
  using (true);

alter table if exists public.villages enable row level security;
drop policy if exists "villages are readable by everyone" on public.villages;
create policy "villages are readable by everyone"
  on public.villages
  for select
  to anon, authenticated
  using (true);

alter table if exists public.characters enable row level security;
drop policy if exists "characters are readable by everyone" on public.characters;
create policy "characters are readable by everyone"
  on public.characters
  for select
  to anon, authenticated
  using (true);

alter table if exists public.players enable row level security;
drop policy if exists "players can read own row" on public.players;
create policy "players can read own row"
  on public.players
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "players can update own row" on public.players;
create policy "players can update own row"
  on public.players
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

commit;