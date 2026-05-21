-- 02-ranks.sql
-- Initial ranks data: Technique power levels

begin;

insert into public.ranks (value, description)
values
  ('C', 'Weakest rank'),
  ('B', 'Below average rank'),
  ('A', 'Above average rank'),
  ('S', 'Strong rank'),
  ('SS', 'Very strong rank'),
  ('SSS', 'Strongest rank')
on conflict (value) do nothing;

commit;
