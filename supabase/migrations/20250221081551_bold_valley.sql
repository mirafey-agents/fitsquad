/*
  # Fix RLS policies for workout plans
  
  This migration updates the RLS policies for workout plans to:
  1. Allow authenticated users to create workout plans
  2. Allow trainers to manage their workout plans
  3. Allow members to view assigned workout plans
  
  The previous policies were too restrictive and prevented workout plan creation.
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Trainers can manage their workout plans" ON workout_plans;
DROP POLICY IF EXISTS "Members can view assigned workout plans" ON workout_plans;

-- Create new policies
CREATE POLICY "Anyone can create workout plans"
  ON workout_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their created workout plans"
  ON workout_plans
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can update their workout plans"
  ON workout_plans
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their workout plans"
  ON workout_plans
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Update policies for workout_plan_exercises to match
DROP POLICY IF EXISTS "Trainers can manage workout plan exercises" ON workout_plan_exercises;
DROP POLICY IF EXISTS "Members can view workout plan exercises" ON workout_plan_exercises;

CREATE POLICY "Users can manage their workout plan exercises"
  ON workout_plan_exercises
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE id = workout_plan_exercises.workout_plan_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view assigned workout plan exercises"
  ON workout_plan_exercises
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans wp
      JOIN squad_workout_plans swp ON swp.workout_plan_id = wp.id
      JOIN squad_members sm ON sm.squad_id = swp.squad_id
      WHERE wp.id = workout_plan_exercises.workout_plan_id
      AND sm.user_id = auth.uid()
    )
  );