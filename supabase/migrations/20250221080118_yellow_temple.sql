/*
  # Add Workout Plans Schema

  1. New Tables
    - `workout_plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_by` (uuid, references users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `workout_plan_exercises`
      - `id` (uuid, primary key)
      - `workout_plan_id` (uuid, references workout_plans)
      - `exercise_id` (integer, references exercises)
      - `order` (integer)
      - `sets` (integer)
      - `reps` (text)
      - `notes` (text)

    - `squad_workout_plans`
      - `id` (uuid, primary key)
      - `squad_id` (uuid, references squads)
      - `workout_plan_id` (uuid, references workout_plans)
      - `assigned_at` (timestamp)
      - `assigned_by` (uuid, references users)

  2. Security
    - Enable RLS on all tables
    - Add policies for trainers and members
*/

-- Create workout_plans table
CREATE TABLE workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout_plan_exercises table
CREATE TABLE workout_plan_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id integer REFERENCES exercises(id) ON DELETE CASCADE,
  "order" integer NOT NULL,
  sets integer,
  reps text,
  notes text,
  UNIQUE(workout_plan_id, exercise_id)
);

-- Create squad_workout_plans table
CREATE TABLE squad_workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id uuid REFERENCES squads(id) ON DELETE CASCADE,
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES users(id) NOT NULL,
  UNIQUE(squad_id, workout_plan_id)
);

-- Enable RLS
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_workout_plans ENABLE ROW LEVEL SECURITY;

-- Policies for workout_plans
CREATE POLICY "Trainers can manage their workout plans"
  ON workout_plans
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Members can view assigned workout plans"
  ON workout_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squad_workout_plans swp
      JOIN squad_members sm ON sm.squad_id = swp.squad_id
      WHERE swp.workout_plan_id = workout_plans.id
      AND sm.user_id = auth.uid()
    )
  );

-- Policies for workout_plan_exercises
CREATE POLICY "Trainers can manage workout plan exercises"
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

CREATE POLICY "Members can view workout plan exercises"
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

-- Policies for squad_workout_plans
CREATE POLICY "Trainers can manage squad workout plan assignments"
  ON squad_workout_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squads
      WHERE id = squad_workout_plans.squad_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Members can view their squad's workout plans"
  ON squad_workout_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squad_members
      WHERE squad_id = squad_workout_plans.squad_id
      AND user_id = auth.uid()
    )
  );