-- 01-utility-functions.sql
-- Utility functions used throughout the system

begin;

-- Set updated_at timestamp on record modification
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

commit;
