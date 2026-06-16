-- 02-audit-triggers.sql
-- Audit trail and application triggers: Log changes and handle auth events

begin;

drop trigger if exists trg_techniques_log_lifecycle on public.techniques;
create trigger trg_techniques_log_lifecycle
after insert or update or delete on public.techniques
for each row
execute function public.log_technique_lifecycle();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

commit;
