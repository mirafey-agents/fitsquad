/*
  # Member Management System

  1. New Tables
    - `member_invitations` - Stores invitation data for new members
    - `member_assessments` - Stores assessment data for members
  
  2. Schema Updates
    - Add new columns to `users` table for member profile data
  
  3. Security
    - Enable RLS on new tables
    - Add policies for secure access
*/

-- Add new columns to users table for member management
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS onboarding_status text DEFAULT 'pending' CHECK (onboarding_status IN ('pending', 'invited', 'completed')),
  ADD COLUMN IF NOT EXISTS height numeric,
  ADD COLUMN IF NOT EXISTS weight numeric,
  ADD COLUMN IF NOT EXISTS body_fat numeric,
  ADD COLUMN IF NOT EXISTS medical_conditions text[],
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS lifestyle_habits jsonb,
  ADD COLUMN IF NOT EXISTS fitness_experience text,
  ADD COLUMN IF NOT EXISTS preferred_workout_times text[],
  ADD COLUMN IF NOT EXISTS documents text[],
  ADD COLUMN IF NOT EXISTS performance_score numeric DEFAULT 0;

-- Create member invitations table
CREATE TABLE IF NOT EXISTS member_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  invitation_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'accepted', 'expired')),
  created_at timestamptz DEFAULT now(),
  expiry_date timestamptz NOT NULL,
  reminder_date timestamptz,
  reminded_at timestamptz,
  accepted_at timestamptz
);

-- Create member assessments table
CREATE TABLE IF NOT EXISTS member_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  assessment_date timestamptz NOT NULL,
  height numeric,
  weight numeric,
  body_fat numeric,
  notes text,
  measurements jsonb,
  fitness_scores jsonb,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE member_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for member_invitations
CREATE POLICY "Trainers can manage invitations"
  ON member_invitations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('trainer', 'super_admin')
    )
  );

CREATE POLICY "Members can view their own invitations"
  ON member_invitations
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );

-- Create policies for member_assessments
CREATE POLICY "Trainers can manage assessments"
  ON member_assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role IN ('trainer', 'super_admin')
    )
  );

CREATE POLICY "Members can view their own assessments"
  ON member_assessments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
  );