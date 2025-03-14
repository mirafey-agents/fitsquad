/*
  # Add Trainer Input Metadata
  
  1. Changes
    - Add metadata columns to workout_participants table
    - Add indexes for faster querying
    - Update RLS policies
  
  2. Security
    - Maintain existing RLS policies
    - Add policies for trainer input access
*/

-- Add metadata columns to workout_participants
ALTER TABLE workout_participants
  ADD COLUMN IF NOT EXISTS trainer_input_type text,
  ADD COLUMN IF NOT EXISTS session_title text,
  ADD COLUMN IF NOT EXISTS session_time text,
  ADD COLUMN IF NOT EXISTS session_exercises jsonb,
  ADD COLUMN IF NOT EXISTS input_timestamp timestamptz DEFAULT now();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workout_participants_user_input 
  ON workout_participants(user_id, input_timestamp);

-- Update RLS policies
CREATE POLICY "Members can view their own trainer inputs"
  ON workout_participants
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Trainers can view inputs for their squad members"
  ON workout_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN squads s ON s.id = w.squad_id
      WHERE w.id = workout_participants.workout_id
      AND s.created_by = auth.uid()
    )
  );