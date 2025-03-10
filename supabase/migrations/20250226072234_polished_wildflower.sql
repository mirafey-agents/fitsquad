-- Add section field to workout_plan_exercises table
ALTER TABLE workout_plan_exercises
  ADD COLUMN IF NOT EXISTS section text CHECK (section IN ('warmup', 'module', 'challenge', 'cooldown'));

-- Create index for section-based queries
CREATE INDEX IF NOT EXISTS idx_workout_plan_exercises_section 
  ON workout_plan_exercises(workout_plan_id, section);