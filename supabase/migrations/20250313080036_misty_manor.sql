/*
  # Add Daily Home Workouts Schema

  1. New Tables
    - `daily_workouts`
      - Stores daily workout challenges assigned by trainers
      - Tracks completion status and timestamps
      - Links to users and trainers

  2. Security
    - Enable RLS
    - Add policies for trainers and members
*/

-- Create daily workouts table
CREATE TABLE IF NOT EXISTS daily_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES users(id),
  title text NOT NULL,
  description text,
  exercise text NOT NULL,
  target text NOT NULL,
  date date NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE daily_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Members can view their own daily workouts"
  ON daily_workouts
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Members can update their own daily workouts"
  ON daily_workouts
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Trainers can manage daily workouts"
  ON daily_workouts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'trainer'
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_workouts_user_date 
  ON daily_workouts(user_id, date);

-- Insert sample data
INSERT INTO daily_workouts (
  user_id,
  assigned_by,
  title,
  description,
  exercise,
  target,
  date
) VALUES (
  '00000000-0000-0000-0000-000000000000'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'Morning Challenge',
  'Start your day with this quick workout!',
  'Push-ups',
  '30 reps',
  CURRENT_DATE
);