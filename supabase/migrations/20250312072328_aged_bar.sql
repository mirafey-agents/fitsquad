/*
  # Add Trainer Input Fields

  1. Changes
    - Add trainer input type column
    - Add input timestamp column
    - Create index for performance
    - Update access policies
  
  2. Security
    - Drop existing policies first to avoid conflicts
    - Create new policies for member and trainer access
*/

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Members can view their own trainer inputs" ON workout_participants;
DROP POLICY IF EXISTS "Trainers can manage workout participants" ON workout_participants;
DROP POLICY IF EXISTS "Members can view workout participation" ON workout_participants;
DROP POLICY IF EXISTS "Users can manage their own participation" ON workout_participants;

-- Add trainer input columns
ALTER TABLE workout_participants 
  ADD COLUMN IF NOT EXISTS trainer_input_type text,
  ADD COLUMN IF NOT EXISTS input_timestamp timestamptz DEFAULT now();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_workout_participants_input 
  ON workout_participants(user_id, input_timestamp);

-- Create new policies
CREATE POLICY "Members can view their own trainer inputs"
  ON workout_participants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Trainers can manage workout participants"
  ON workout_participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN squads s ON s.id = w.squad_id
      WHERE w.id = workout_participants.workout_id
      AND s.created_by = auth.uid()
    )
  );