-- 04-audit-structure.sql
-- Audit trail: Track all changes to techniques for compliance and debugging

begin;

-- Technique audit log: Complete lifecycle tracking
create table if not exists public.technique_updates (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('INSERT', 'UPDATE', 'DELETE')),
  technique_id uuid references public.techniques(id) on delete set null,
  technique_name_snapshot text not null,
  changed_by uuid references public.players(id) on delete set null,
  changed_fields text[] not null,
  before_snapshot jsonb,
  after_snapshot jsonb,
  created_at timestamptz not null default now()
);

commit;
