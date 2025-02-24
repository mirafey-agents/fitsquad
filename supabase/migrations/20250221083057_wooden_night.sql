-- Create a demo user with a fixed UUID
INSERT INTO auth.users (id, email)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@example.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, email, display_name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@example.com', 'Demo User', 'trainer')
ON CONFLICT (id) DO NOTHING;

-- Update policies to allow the demo user to manage workout plans
DROP POLICY IF EXISTS "Anyone can create workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can view their created workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can update their workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Users can delete their workout plans" ON workout_plans;

CREATE POLICY "Allow demo user to manage workout plans"
  ON workout_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update policies for workout_plan_exercises
DROP POLICY IF EXISTS "Users can manage their workout plan exercises" ON workout_plan_exercises;
DROP POLICY IF EXISTS "Users can view assigned workout plan exercises" ON workout_plan_exercises;

CREATE POLICY "Allow demo user to manage workout plan exercises"
  ON workout_plan_exercises
  FOR ALL
  USING (true)
  WITH CHECK (true);