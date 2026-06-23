-- 05-technique-costs-ag.sql
-- Incremental update: allow AG as a valid technique usage cost resource

begin;

alter table public.technique_costs
  drop constraint if exists technique_costs_resource_check;

alter table public.technique_costs
  add constraint technique_costs_resource_check
  check (resource in ('CK', 'HP', 'AG'));

commit;