/*
  # Schedule Management Schema

  1. New Tables
    - `training_locations`
      - Stores training venue information
      - Tracks location metrics and ratings
    - `location_availability`
      - Manages venue availability windows
      - Handles booking restrictions
    - `travel_times`
      - Records travel times between locations
      - Stores traffic pattern data

  2. Changes
    - Add location fields to workouts table
    - Add travel time tracking
    - Add prime time slot management
*/

-- Create training locations table
CREATE TABLE training_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  coordinates jsonb NOT NULL,
  type text NOT NULL CHECK (type IN ('studio', 'gym', 'outdoor', 'client')),
  premium boolean DEFAULT false,
  amenities jsonb,
  operating_hours jsonb,
  pricing jsonb,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create location availability table
CREATE TABLE location_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid REFERENCES training_locations(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_prime_time boolean DEFAULT false,
  price_multiplier numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now()
);

-- Create travel times table
CREATE TABLE travel_times (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_location_id uuid REFERENCES training_locations(id) ON DELETE CASCADE,
  to_location_id uuid REFERENCES training_locations(id) ON DELETE CASCADE,
  time_of_day text NOT NULL CHECK (time_of_day IN ('morning', 'afternoon', 'evening')),
  duration_minutes integer NOT NULL,
  traffic_factor numeric DEFAULT 1.0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(from_location_id, to_location_id, time_of_day)
);

-- Add location fields to workouts table
ALTER TABLE workouts
  ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES training_locations(id),
  ADD COLUMN IF NOT EXISTS is_prime_time boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS travel_time_minutes integer,
  ADD COLUMN IF NOT EXISTS buffer_time_minutes integer DEFAULT 15;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_location_time 
  ON workouts(location_id, scheduled_time);

CREATE INDEX IF NOT EXISTS idx_location_availability_lookup 
  ON location_availability(location_id, day_of_week);

CREATE INDEX IF NOT EXISTS idx_travel_times_locations 
  ON travel_times(from_location_id, to_location_id);

-- Enable RLS
ALTER TABLE training_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_times ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow demo access to training locations"
  ON training_locations
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow demo access to location availability"
  ON location_availability
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow demo access to travel times"
  ON travel_times
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample data
INSERT INTO training_locations (
  name,
  address,
  coordinates,
  type,
  premium,
  amenities,
  operating_hours,
  pricing
) VALUES
(
  'FitSquad Studio',
  'Indiranagar, Bangalore',
  '{"latitude": 12.9784, "longitude": 77.6408}'::jsonb,
  'studio',
  true,
  '["AC", "Changing Room", "Lockers", "Shower", "Parking"]'::jsonb,
  '{
    "monday": {"open": "06:00", "close": "22:00"},
    "tuesday": {"open": "06:00", "close": "22:00"},
    "wednesday": {"open": "06:00", "close": "22:00"},
    "thursday": {"open": "06:00", "close": "22:00"},
    "friday": {"open": "06:00", "close": "22:00"},
    "saturday": {"open": "07:00", "close": "20:00"},
    "sunday": {"open": "07:00", "close": "20:00"}
  }'::jsonb,
  '{
    "base_rate": 1000,
    "prime_time_multiplier": 1.2,
    "minimum_hours": 1
  }'::jsonb
),
(
  'Fitness Hub',
  'Koramangala, Bangalore',
  '{"latitude": 12.9279, "longitude": 77.6271}'::jsonb,
  'gym',
  false,
  '["AC", "Changing Room", "Parking"]'::jsonb,
  '{
    "monday": {"open": "05:00", "close": "23:00"},
    "tuesday": {"open": "05:00", "close": "23:00"},
    "wednesday": {"open": "05:00", "close": "23:00"},
    "thursday": {"open": "05:00", "close": "23:00"},
    "friday": {"open": "05:00", "close": "23:00"},
    "saturday": {"open": "06:00", "close": "22:00"},
    "sunday": {"open": "06:00", "close": "22:00"}
  }'::jsonb,
  '{
    "base_rate": 800,
    "prime_time_multiplier": 1.2,
    "minimum_hours": 1
  }'::jsonb
),
(
  'Cubbon Park',
  'Cubbon Park, Bangalore',
  '{"latitude": 12.9763, "longitude": 77.5929}'::jsonb,
  'outdoor',
  false,
  '["Parking", "Running Track", "Exercise Stations"]'::jsonb,
  '{
    "monday": {"open": "05:00", "close": "19:00"},
    "tuesday": {"open": "05:00", "close": "19:00"},
    "wednesday": {"open": "05:00", "close": "19:00"},
    "thursday": {"open": "05:00", "close": "19:00"},
    "friday": {"open": "05:00", "close": "19:00"},
    "saturday": {"open": "05:00", "close": "19:00"},
    "sunday": {"open": "05:00", "close": "19:00"}
  }'::jsonb,
  '{
    "base_rate": 500,
    "prime_time_multiplier": 1.2,
    "minimum_hours": 1
  }'::jsonb
);

-- Insert sample availability data
INSERT INTO location_availability (
  location_id,
  day_of_week,
  start_time,
  end_time,
  is_prime_time,
  price_multiplier
)
SELECT
  l.id,
  d.day,
  '06:00'::time,
  '09:00'::time,
  true,
  1.2
FROM training_locations l
CROSS JOIN (SELECT generate_series(0, 6) as day) d
UNION ALL
SELECT
  l.id,
  d.day,
  '09:00'::time,
  '17:00'::time,
  false,
  1.0
FROM training_locations l
CROSS JOIN (SELECT generate_series(0, 6) as day) d
UNION ALL
SELECT
  l.id,
  d.day,
  '17:00'::time,
  '20:00'::time,
  true,
  1.2
FROM training_locations l
CROSS JOIN (SELECT generate_series(0, 6) as day) d;

-- Insert sample travel times
INSERT INTO travel_times (
  from_location_id,
  to_location_id,
  time_of_day,
  duration_minutes,
  traffic_factor
)
SELECT 
  l1.id as from_location_id,
  l2.id as to_location_id,
  t.time_of_day,
  CASE 
    WHEN t.time_of_day = 'morning' THEN 45
    WHEN t.time_of_day = 'afternoon' THEN 30
    ELSE 40
  END as duration_minutes,
  CASE 
    WHEN t.time_of_day = 'morning' THEN 1.5
    WHEN t.time_of_day = 'afternoon' THEN 1.0
    ELSE 1.3
  END as traffic_factor
FROM training_locations l1
CROSS JOIN training_locations l2
CROSS JOIN (
  SELECT unnest(ARRAY['morning', 'afternoon', 'evening']) as time_of_day
) t
WHERE l1.id != l2.id;