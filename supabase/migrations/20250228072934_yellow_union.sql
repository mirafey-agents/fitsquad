-- Fix the men_weight and women_weight columns in workout_plan_exercises
ALTER TABLE workout_plan_exercises 
  ADD COLUMN IF NOT EXISTS men_weight numeric,
  ADD COLUMN IF NOT EXISTS women_weight numeric;

-- Fix the age column issue by ensuring it exists
ALTER TABLE users 
  DROP COLUMN IF EXISTS age;

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS age integer;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_workout_plan_exercises_plan_id 
  ON workout_plan_exercises(workout_plan_id);