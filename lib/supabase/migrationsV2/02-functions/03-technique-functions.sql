-- 03-technique-functions.sql
-- Technique-related functions: Auditing and lifecycle management

begin;

-- Log all technique changes (INSERT, UPDATE, DELETE) for audit trail
create or replace function public.log_technique_lifecycle()
returns trigger
language plpgsql
as $$
declare
  changed_fields text[] := array[]::text[];
  actor_id uuid;
begin
  if tg_op = 'INSERT' then
    actor_id := new.updated_by;

    insert into public.technique_updates (
      event_type,
      technique_id,
      technique_name_snapshot,
      changed_by,
      changed_fields,
      before_snapshot,
      after_snapshot
    ) values (
      'INSERT',
      new.id,
      new.name,
      actor_id,
      array['created'],
      null,
      to_jsonb(new)
    );

    return new;
  elsif tg_op = 'UPDATE' then
    actor_id := coalesce(new.updated_by, old.updated_by);

    if new.kind is distinct from old.kind then changed_fields := array_append(changed_fields, 'kind'); end if;
    if new.name is distinct from old.name then changed_fields := array_append(changed_fields, 'name'); end if;
    if new.technique_type_id is distinct from old.technique_type_id then changed_fields := array_append(changed_fields, 'technique_type_id'); end if;
    if new.rank_id is distinct from old.rank_id then changed_fields := array_append(changed_fields, 'rank_id'); end if;
    if new.link is distinct from old.link then changed_fields := array_append(changed_fields, 'link'); end if;
    if new.observations is distinct from old.observations then changed_fields := array_append(changed_fields, 'observations'); end if;
    if new.updated_by is distinct from old.updated_by then changed_fields := array_append(changed_fields, 'updated_by'); end if;

    if coalesce(array_length(changed_fields, 1), 0) = 0 then
      changed_fields := array['updated'];
    end if;

    insert into public.technique_updates (
      event_type,
      technique_id,
      technique_name_snapshot,
      changed_by,
      changed_fields,
      before_snapshot,
      after_snapshot
    ) values (
      'UPDATE',
      new.id,
      new.name,
      actor_id,
      changed_fields,
      to_jsonb(old),
      to_jsonb(new)
    );

    return new;
  else
    actor_id := old.updated_by;

    insert into public.technique_updates (
      event_type,
      technique_id,
      technique_name_snapshot,
      changed_by,
      changed_fields,
      before_snapshot,
      after_snapshot
    ) values (
      'DELETE',
      old.id,
      old.name,
      actor_id,
      array['deleted'],
      to_jsonb(old),
      null
    );

    return old;
  end if;
end;
$$;

commit;
