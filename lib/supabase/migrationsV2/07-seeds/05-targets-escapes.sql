-- 05-targets-escapes.sql
-- Initial targets and escapes: Game mechanics reference data

begin;

-- Targets: Valid targets for techniques
insert into public.targets (code, description)
values
  ('SELF', 'Technique targets the user'),
  ('SINGLE_ALLY', 'Technique targets a single ally'),
  ('ALL_ALLIES', 'Technique targets all allies'),
  ('SINGLE_ENEMY', 'Technique targets a single enemy'),
  ('ALL_ENEMIES', 'Technique targets all enemies'),
  ('AREA', 'Technique affects an area')
on conflict (code) do nothing;

-- Escapes: Valid escape methods for techniques
insert into public.escapes (code, description)
values
  ('DODGE', 'Can be escaped by dodging'),
  ('BLOCK', 'Can be blocked by a shield or similar'),
  ('COUNTER', 'Can be countered with another technique'),
  ('NONE', 'Cannot be escaped'),
  ('PARTIAL', 'Can be partially escaped or mitigated')
on conflict (code) do nothing;

commit;
