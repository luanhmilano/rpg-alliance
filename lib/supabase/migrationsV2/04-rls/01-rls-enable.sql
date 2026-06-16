-- 01-rls-enable.sql
-- Enable Row Level Security on all tables
-- RLS must be enabled before policies can be created

begin;

alter table if exists public.roles enable row level security;
alter table if exists public.villages enable row level security;
alter table if exists public.ranks enable row level security;
alter table if exists public.technique_types enable row level security;
alter table if exists public.characters enable row level security;
alter table if exists public.players enable row level security;
alter table if exists public.techniques enable row level security;
alter table if exists public.jutsus enable row level security;
alter table if exists public.summonings enable row level security;
alter table if exists public.technique_costs enable row level security;
alter table if exists public.technique_limits enable row level security;
alter table if exists public.technique_effects enable row level security;
alter table if exists public.technique_effect_values enable row level security;
alter table if exists public.technique_targets enable row level security;
alter table if exists public.targets enable row level security;
alter table if exists public.technique_escapes enable row level security;
alter table if exists public.escapes enable row level security;
alter table if exists public.technique_prices enable row level security;
alter table if exists public.technique_updates enable row level security;

commit;
