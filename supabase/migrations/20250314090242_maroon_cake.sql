/*
  # Add Session Type Support to Workouts

  1. Changes
    - Add client_id and status columns
    - Add price tracking
    - Add session type constraint
    - Add pricing calculation function
    
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

-- Drop existing constraint if it exists
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_session_type_check;

-- Add constraint to ensure either squad_id or client_id is set, but not both
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS workout_price_trigger ON workouts;

-- Create trigger for price updates
CREATE TRIGGER workout_price_trigger
  BEFORE INSERT OR UPDATE OF squad_id, client_id, is_prime_time, location_id
  ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_workout_price();

-- First ensure we have demo users
INSERT INTO users (
  id,
  email,
  display_name,
  role,
  service_type
) VALUES 
(
  '00000000-0000-0000-0000-000000000002',
  'sarah@example.com',
  'Sarah Chen',
  'member',
  'Personal Training'
),
(
  '00000000-0000-0000-0000-000000000003',
  'mike@example.com',
  'Mike Ross',
  'member',
  'Group Training'
),
(
  '00000000-0000-0000-0000-000000000004',
  'emma@example.com',
  'Emma Wilson',
  'member',
  'Personal Training'
) ON CONFLICT (id) DO NOTHING;

-- First ensure we have a demo squad
INSERT INTO squads (
  id,
  name,
  description,
  created_by,
  is_private
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Morning Warriors',
  'Early morning high-intensity group',
  '00000000-0000-0000-0000-000000000000',
  false
) ON CONFLICT DO NOTHING;

-- Insert sample workouts
INSERT INTO workouts (
  squad_id,
  title,
  scheduled_time,
  duration,
  intensity,
  location_id,
  is_prime_time,
  status
) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'Morning HIIT',
  '2025-03-15 06:30:00'::timestamptz,
  '45 minutes'::interval,
  'High',
  (SELECT id FROM training_locations WHERE name = 'FitSquad Studio' LIMIT 1),
  true,
  'confirmed'
);

-- Insert a personal training session
INSERT INTO workouts (
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
  '00000000-0000-0000-0000-000000000002',
  'Personal Training Session',
  '2025-03-15 10:00:00'::timestamptz,
  '60 minutes'::interval,
  'Medium',
  (SELECT id FROM training_locations WHERE name = 'Fitness Hub' LIMIT 1),
  false,
  'confirmed'
);