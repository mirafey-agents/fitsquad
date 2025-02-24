/*
  # Create achievements table

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text)
      - `icon` (text)
      - `points` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `achievements` table
    - Add policy for authenticated users to read achievements
    - Add policy for trainers to manage achievements
*/

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read achievements"
  ON achievements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow achievement management in demo"
  ON achievements
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert some initial achievements
INSERT INTO achievements (name, description, icon, points) VALUES
  ('First Workout', 'Complete your first workout session', '🎯', 100),
  ('Perfect Week', 'Attend all scheduled workouts in a week', '🌟', 500),
  ('Squad Leader', 'Lead a workout session', '👑', 1000),
  ('Early Bird', 'Complete 5 morning workouts', '🌅', 300),
  ('Consistency King', 'Maintain 90% attendance for a month', '💪', 1000);