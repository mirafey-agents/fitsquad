/*
  # Schedule Management System Schema

  1. Changes
    - Add client_id and status to workouts table
    - Add pricing fields
    - Add location and timing fields
    - Create proper constraints and triggers
    - Insert sample data in correct order

  2. Security
    - Maintain existing RLS policies
    - Add proper constraints
*/

-- Add missing columns to workouts table
ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS price_multiplier numeric DEFAULT 1.0;

-- Update workouts table to handle both squad and client sessions
ALTER TABLE workouts
  ALTER COLUMN squad_id DROP NOT NULL;

-- Add constraint to ensure either squad_id or client_id is set
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_session_type_check;
ALTER TABLE workouts
  ADD CONSTRAINT workouts_session_type_check 
  CHECK (
    (squad_id IS NOT NULL AND client_id IS NULL) OR 
    (squad_id IS NULL AND client_id IS NOT NULL)
  );

-- Create index for client lookups
CREATE INDEX IF NOT EXISTS idx_workouts_client 
  ON workouts(client_id, scheduled_time);

-- Create function to calculate session price
CREATE OR REPLACE FUNCTION calculate_session_price(
  p_workout_id uuid
) RETURNS numeric AS $$
DECLARE
  v_base_price numeric;
  v_multiplier numeric := 1.0;
  v_location_premium boolean;
  v_is_prime_time boolean;
BEGIN
  -- Get workout details
  SELECT 
    CASE 
      WHEN squad_id IS NOT NULL THEN 2500 -- Group training base price
      ELSE 5000 -- Personal training base price
    END,
    w.is_prime_time,
    l.premium
  INTO v_base_price, v_is_prime_time, v_location_premium
  FROM workouts w
  LEFT JOIN training_locations l ON l.id = w.location_id
  WHERE w.id = p_workout_id;

  -- Apply prime time multiplier
  IF v_is_prime_time THEN
    v_multiplier := v_multiplier * 1.2;
  END IF;

  -- Apply location premium
  IF v_location_premium THEN
    v_multiplier := v_multiplier * 1.1;
  END IF;

  RETURN v_base_price * v_multiplier;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update price on workout changes
CREATE OR REPLACE FUNCTION update_workout_price()
RETURNS trigger AS $$
BEGIN
  NEW.price := calculate_session_price(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workout_price_trigger
  BEFORE INSERT OR UPDATE OF squad_id, client_id, is_prime_time, location_id
  ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_price();

-- First, create a demo client for personal training sessions
INSERT INTO users (
  id,
  email,
  display_name,
  role,
  service_type
) VALUES (
  'e8fd159b-57c4-4d36-9bd7-a59ca13057bc',
  'client@example.com',
  'Demo Client',
  'member',
  'Personal Training'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample workouts
INSERT INTO workouts (
  squad_id,
  client_id,
  title,
  scheduled_time,
  duration,
  intensity,
  location_id,
  is_prime_time,
  status
) VALUES
(
  (SELECT id FROM squads LIMIT 1),
  NULL,
  'Morning HIIT',
  '2025-03-15 06:30:00'::timestamptz,
  '45 minutes'::interval,
  'High',
  (SELECT id FROM training_locations WHERE name = 'FitSquad Studio'),
  true,
  'confirmed'
),
(
  NULL,
  'e8fd159b-57c4-4d36-9bd7-a59ca13057bc',
  'Personal Training Session',
  '2025-03-15 10:00:00'::timestamptz,
  '60 minutes'::interval,
  'Medium',
  (SELECT id FROM training_locations WHERE name = 'Fitness Hub'),
  false,
  'confirmed'
),
(
  (SELECT id FROM squads LIMIT 1),
  NULL,
  'Evening Strength',
  '2025-03-15 18:00:00'::timestamptz,
  '60 minutes'::interval,
  'High',
  (SELECT id FROM training_locations WHERE name = 'FitSquad Studio'),
  true,
  'confirmed'
);