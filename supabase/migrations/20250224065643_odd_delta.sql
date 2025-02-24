/*
  # Update Trainer Dashboard Features

  1. Changes
    - Add service_type to users table
    - Add upvotes to workout_plans table
    - Add currency_type to workout_plans table
    - Update existing policies
  
  2. Security
    - Maintain demo environment access
    - Enable workout plan management
*/

-- Add service_type to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS service_type text CHECK (service_type IN ('Personal Training', 'Group Training'));

-- Add upvotes and currency to workout_plans
ALTER TABLE workout_plans 
  ADD COLUMN IF NOT EXISTS upvotes integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS currency_type text DEFAULT 'INR';

-- Create workout plan upvotes table
CREATE TABLE IF NOT EXISTS workout_plan_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_plan_id uuid REFERENCES workout_plans(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(workout_plan_id, user_id)
);

-- Enable RLS
ALTER TABLE workout_plan_upvotes ENABLE ROW LEVEL SECURITY;

-- Create policies for workout plan upvotes
CREATE POLICY "Allow workout plan upvote management in demo"
  ON workout_plan_upvotes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Update existing data to use INR
UPDATE workout_plans SET currency_type = 'INR' WHERE currency_type IS NULL;