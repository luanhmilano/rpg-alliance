-- 03-technique-types.sql
-- Initial technique types: Classification of techniques

begin;

insert into public.technique_types (code, name, description)
values
  ('NINJUTSU', 'Ninjutsu', 'Ninja technique using chakra manipulation'),
  ('TAIJUTSU', 'Taijutsu', 'Physical combat technique'),
  ('GENJUTSU', 'Genjutsu', 'Illusion-based technique'),
  ('DOJUTSU', 'Dojutsu', 'Eye-based kekkei genkai technique'),
  ('SUMMONING', 'Invocacao', 'Summoning technique to call creatures')
on conflict (code) do nothing;

commit;
