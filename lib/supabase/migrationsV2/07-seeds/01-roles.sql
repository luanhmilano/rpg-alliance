-- 01-roles.sql
-- Initial roles data: User access levels

begin;

insert into public.roles (name, description)
values
  ('MEMBER', 'Regular player with standard permissions'),
  ('KAGE', 'Administrator with full control over techniques and players')
on conflict (name) do nothing;

commit;
