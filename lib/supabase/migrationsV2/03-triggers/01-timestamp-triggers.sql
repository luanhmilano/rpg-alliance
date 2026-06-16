-- 01-timestamp-triggers.sql
-- Automatic timestamp management: Set updated_at on row modification

begin;

drop trigger if exists trg_roles_set_updated_at on public.roles;
create trigger trg_roles_set_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_villages_set_updated_at on public.villages;
create trigger trg_villages_set_updated_at
before update on public.villages
for each row
execute function public.set_updated_at();

drop trigger if exists trg_ranks_set_updated_at on public.ranks;
create trigger trg_ranks_set_updated_at
before update on public.ranks
for each row
execute function public.set_updated_at();

drop trigger if exists trg_technique_types_set_updated_at on public.technique_types;
create trigger trg_technique_types_set_updated_at
before update on public.technique_types
for each row
execute function public.set_updated_at();

drop trigger if exists trg_characters_set_updated_at on public.characters;
create trigger trg_characters_set_updated_at
before update on public.characters
for each row
execute function public.set_updated_at();

drop trigger if exists trg_players_set_updated_at on public.players;
create trigger trg_players_set_updated_at
before update on public.players
for each row
execute function public.set_updated_at();

drop trigger if exists trg_techniques_set_updated_at on public.techniques;
create trigger trg_techniques_set_updated_at
before update on public.techniques
for each row
execute function public.set_updated_at();

commit;
