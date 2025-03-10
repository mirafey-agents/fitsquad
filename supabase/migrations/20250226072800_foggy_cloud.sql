/*
  # Fix Squad Workout Plans Policies

  1. Changes
    - Drop existing restrictive policies
    - Add new policies for demo environment
    - Allow workout plan assignments in demo mode
  
  2. Security
    - Temporarily disable RLS restrictions for demo purposes
    - In production, this would be replaced with proper role-based policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow squad workout plan assignments in demo" ON squad_workout_plans;
DROP POLICY IF EXISTS "Trainers can manage squad workout plan assignments" ON squad_workout_plans;
DROP POLICY IF EXISTS "Members can view their squad's workout plans" ON squad_workout_plans;

-- Create new policy for demo environment
CREATE POLICY "Allow all operations on squad workout plans in demo"
  ON squad_workout_plans
  FOR ALL
  USING (true)
  WITH CHECK (true);