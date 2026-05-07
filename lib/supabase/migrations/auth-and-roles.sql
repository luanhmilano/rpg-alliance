-- Profiles + roles + approvals baseline for RPG Alliance

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'MEMBER' check (role in ('KAGE', 'MEMBER')),
  approval_status text not null default 'PENDING' check (approval_status in ('PENDING', 'APPROVED', 'REJECTED')),
  email text,
  phone text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, phone, role, approval_status)
  values (new.id, new.email, new.phone, 'MEMBER', 'PENDING')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;

grant usage on schema public to authenticated;
grant select, update on table public.profiles to authenticated;

create or replace function public.is_kage(user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'KAGE'
      and p.approval_status = 'APPROVED'
  );
$$;

revoke all on function public.is_kage(uuid) from public;
grant execute on function public.is_kage(uuid) to authenticated;

create or replace function public.enforce_profile_update_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_kage(auth.uid()) then
    if new.role is distinct from old.role then
      raise exception 'Only KAGE can change role';
    end if;

    if new.approval_status is distinct from old.approval_status then
      raise exception 'Only KAGE can change approval status';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_profile_update_guard on public.profiles;

create trigger enforce_profile_update_guard
before update on public.profiles
for each row
execute function public.enforce_profile_update_guard();

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists profiles_kage_select_all on public.profiles;
create policy profiles_kage_select_all
on public.profiles
for select
to authenticated
using (public.is_kage(auth.uid()));

drop policy if exists profiles_kage_update_all on public.profiles;
create policy profiles_kage_update_all
on public.profiles
for update
to authenticated
using (public.is_kage(auth.uid()))
with check (public.is_kage(auth.uid()));

-- Promote an existing user to first KAGE (replace UUID)
-- update public.profiles
-- set role = 'KAGE', approval_status = 'APPROVED'
-- where id = '00000000-0000-0000-0000-000000000000';
