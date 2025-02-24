/*
  # Initial Schema Setup for Squad Fit

  1. Tables
    - `users`
      - Core user information and role management
    - `squads`
      - Workout groups/squads
    - `squad_members`
      - Squad membership and roles
    - `workouts`
      - Scheduled workout sessions
    - `workout_participants`
      - Workout attendance and performance tracking

  2. Security
    - Enable RLS on all tables
    - Policies for different user roles
    - Role-based access control
*/

-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('super_admin', 'trainer', 'member');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  display_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  experience_level text,
  goals text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create squads table
CREATE TABLE IF NOT EXISTS squads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES users(id) NOT NULL,
  is_private boolean DEFAULT false,
  schedule jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create squad members table
CREATE TABLE IF NOT EXISTS squad_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id uuid REFERENCES squads(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(squad_id, user_id)
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id uuid REFERENCES squads(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  scheduled_time timestamptz NOT NULL,
  duration interval NOT NULL,
  intensity text NOT NULL,
  max_participants int,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create workout participants table
CREATE TABLE IF NOT EXISTS workout_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  attendance_status text NOT NULL DEFAULT 'pending',
  performance_score int,
  mvp_votes int DEFAULT 0,
  slacker_votes int DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(workout_id, user_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_participants ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Super admins can manage all users"
  ON users
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Squads policies
CREATE POLICY "Anyone can view public squads"
  ON squads
  FOR SELECT
  TO authenticated
  USING (NOT is_private);

CREATE POLICY "Members can view their private squads"
  ON squads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squad_members
      WHERE squad_id = squads.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage their squads"
  ON squads
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Squad members policies
CREATE POLICY "Members can view squad members"
  ON squad_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squad_members sm
      WHERE sm.squad_id = squad_members.squad_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage squad members"
  ON squad_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squads
      WHERE id = squad_members.squad_id
      AND created_by = auth.uid()
    )
  );

-- Workouts policies
CREATE POLICY "Squad members can view workouts"
  ON workouts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squad_members
      WHERE squad_id = workouts.squad_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Trainers can manage workouts"
  ON workouts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squads
      WHERE id = workouts.squad_id
      AND created_by = auth.uid()
    )
  );

-- Workout participants policies
CREATE POLICY "Participants can view workout participation"
  ON workout_participants
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM squad_members sm
      JOIN workouts w ON w.squad_id = sm.squad_id
      WHERE w.id = workout_participants.workout_id
      AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own participation"
  ON workout_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Functions for user management
CREATE OR REPLACE FUNCTION create_super_admin(
  email text,
  display_name text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  INSERT INTO users (email, display_name, role)
  VALUES (email, display_name, 'super_admin')
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$;