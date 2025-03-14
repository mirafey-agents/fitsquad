/*
  # Add Squad Members and Fix Calendar Data

  1. Changes
    - Add members to demo squad
    - Ensure proper squad membership
    - Fix workout participant assignments
  
  2. Security
    - Maintain existing RLS policies
*/

-- First ensure we have demo members
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

-- Add members to demo squad
INSERT INTO squad_members (
  squad_id,
  user_id,
  role,
  joined_at
) VALUES 
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  'member',
  now()
),
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000003',
  'member',
  now()
),
(
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  'member',
  now()
) ON CONFLICT DO NOTHING;

-- Add workout participants for existing workouts
INSERT INTO workout_participants (
  workout_id,
  user_id,
  attendance_status,
  joined_at
)
SELECT 
  w.id,
  sm.user_id,
  'confirmed',
  now()
FROM workouts w
JOIN squad_members sm ON sm.squad_id = w.squad_id
WHERE w.squad_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Add participants for personal training sessions
INSERT INTO workout_participants (
  workout_id,
  user_id,
  attendance_status,
  joined_at
)
SELECT 
  w.id,
  w.client_id,
  'confirmed',
  now()
FROM workouts w
WHERE w.client_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Update past sessions with performance scores
UPDATE workout_participants
SET 
  performance_score = floor(random() * 20 + 80),
  trainer_comments = CASE 
    WHEN random() > 0.5 THEN 'Excellent form and energy throughout the session.'
    ELSE 'Good progress, keep focusing on form and breathing.'
  END
WHERE workout_id IN (
  SELECT id FROM workouts 
  WHERE scheduled_time < now()
);