/*
  # Squad Schedule Management

  1. Changes
    - Add schedule_slots table for managing squad training slots
    - Add functions for schedule management
    - Add sample data for demo squad
  
  2. Security
    - Enable RLS
    - Add policies for schedule access
*/

-- Create schedule_slots table
CREATE TABLE IF NOT EXISTS schedule_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  squad_id uuid REFERENCES squads(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  location_id uuid REFERENCES training_locations(id),
  is_prime_time boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(squad_id, day_of_week, start_time)
);

-- Enable RLS
ALTER TABLE schedule_slots ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow demo access to schedule slots"
  ON schedule_slots
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to check for schedule conflicts
CREATE OR REPLACE FUNCTION check_schedule_conflict(
  p_squad_id uuid,
  p_day_of_week integer,
  p_start_time time,
  p_end_time time
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM schedule_slots
    WHERE squad_id = p_squad_id
      AND day_of_week = p_day_of_week
      AND (
        (start_time <= p_start_time AND end_time > p_start_time) OR
        (start_time < p_end_time AND end_time >= p_end_time) OR
        (start_time >= p_start_time AND end_time <= p_end_time)
      )
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to add schedule slot
CREATE OR REPLACE FUNCTION add_schedule_slot(
  p_squad_id uuid,
  p_day_of_week integer,
  p_start_time time,
  p_end_time time,
  p_location_id uuid
) RETURNS uuid AS $$
DECLARE
  v_slot_id uuid;
BEGIN
  -- Check for conflicts
  IF check_schedule_conflict(p_squad_id, p_day_of_week, p_start_time, p_end_time) THEN
    RAISE EXCEPTION 'Schedule conflict detected';
  END IF;

  -- Check if slot is during prime time
  INSERT INTO schedule_slots (
    squad_id,
    day_of_week,
    start_time,
    end_time,
    location_id,
    is_prime_time
  ) VALUES (
    p_squad_id,
    p_day_of_week,
    p_start_time,
    p_end_time,
    p_location_id,
    EXISTS (
      SELECT 1 FROM location_availability
      WHERE location_id = p_location_id
        AND day_of_week = p_day_of_week
        AND start_time <= p_start_time
        AND end_time >= p_end_time
        AND is_prime_time = true
    )
  ) RETURNING id INTO v_slot_id;

  RETURN v_slot_id;
END;
$$ LANGUAGE plpgsql;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_schedule_slots_lookup 
  ON schedule_slots(squad_id, day_of_week);

-- Insert sample schedule slots for demo squad
DO $$
DECLARE
  v_squad_id uuid := '00000000-0000-0000-0000-000000000001';
  v_studio_id uuid;
BEGIN
  -- Get studio location ID
  SELECT id INTO v_studio_id 
  FROM training_locations 
  WHERE name = 'FitSquad Studio' 
  LIMIT 1;

  -- Add weekday evening slots (Monday-Friday)
  FOR i IN 1..5 LOOP
    PERFORM add_schedule_slot(
      v_squad_id,
      i,  -- Monday = 1, Friday = 5
      '18:00'::time,
      '20:00'::time,
      v_studio_id
    );
  END LOOP;

  -- Add Saturday morning slot
  PERFORM add_schedule_slot(
    v_squad_id,
    6,  -- Saturday
    '09:00'::time,
    '11:00'::time,
    v_studio_id
  );
END $$;