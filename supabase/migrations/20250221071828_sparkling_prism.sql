/*
  # Add exercises table and data

  1. New Tables
    - `exercises`
      - `id` (serial, primary key)
      - `module_type` (text)
      - `name` (text)
      - `level` (text)
      - `men_weight` (numeric)
      - `women_weight` (numeric)
      - `reps` (text)
      - `sets` (integer)
      - `energy_points` (integer)

  2. Security
    - Enable RLS on exercises table
    - Add policy for authenticated users to read exercises
*/

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id serial PRIMARY KEY,
  module_type text NOT NULL,
  name text NOT NULL,
  level text NOT NULL,
  men_weight numeric,
  women_weight numeric,
  reps text NOT NULL,
  sets integer,
  energy_points integer NOT NULL
);

-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read exercises
CREATE POLICY "Authenticated users can read exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert exercise data
INSERT INTO exercises (module_type, name, level, men_weight, women_weight, reps, sets, energy_points) VALUES
  ('Kettlebell', 'Kettlebell Swings', 'Beginner', 12, 8, '10', 2, 2),
  ('Kettlebell', 'Goblet Squats', 'Beginner', 12, 8, '10', 2, 2),
  ('Kettlebell', 'Kettlebell Deadlifts', 'Beginner', 12, 8, '10', 2, 2),
  ('Kettlebell', 'Single Arm Kettlebell Press', 'Beginner', 8, 4, '8 per arm', 2, 3),
  ('Kettlebell', 'Kettlebell Russian Twists', 'Beginner', 8, 4, '15', 2, 3),
  -- Add all exercises from the CSV here
  ('Warm-up', 'Standing Side Stretch', 'Advanced', NULL, NULL, '30 sec', 2, 4);