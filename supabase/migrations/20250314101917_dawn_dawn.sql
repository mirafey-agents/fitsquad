-- Add cascade delete to squad_members and squad_workout_plans
ALTER TABLE squad_members
  DROP CONSTRAINT IF EXISTS squad_members_squad_id_fkey,
  ADD CONSTRAINT squad_members_squad_id_fkey
  FOREIGN KEY (squad_id)
  REFERENCES squads(id)
  ON DELETE CASCADE;

ALTER TABLE squad_workout_plans
  DROP CONSTRAINT IF EXISTS squad_workout_plans_squad_id_fkey,
  ADD CONSTRAINT squad_workout_plans_squad_id_fkey
  FOREIGN KEY (squad_id)
  REFERENCES squads(id)
  ON DELETE CASCADE;

ALTER TABLE workouts
  DROP CONSTRAINT IF EXISTS workouts_squad_id_fkey,
  ADD CONSTRAINT workouts_squad_id_fkey
  FOREIGN KEY (squad_id)
  REFERENCES squads(id)
  ON DELETE CASCADE;