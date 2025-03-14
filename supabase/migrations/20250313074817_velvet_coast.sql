-- First, let's create sample workouts
INSERT INTO workouts (
  id,
  squad_id,
  title,
  scheduled_time,
  duration,
  intensity,
  created_by
) VALUES 
(
  'e8fd159b-57c4-4d36-9bd7-a59ca13057bb'::uuid,
  (SELECT id FROM squads LIMIT 1),
  'Morning HIIT Session',
  '2025-03-06 06:30:00'::timestamptz,
  '45 minutes'::interval,
  'High',
  '00000000-0000-0000-0000-000000000000'::uuid
),
(
  'f8fd159b-57c4-4d36-9bd7-a59ca13057bc'::uuid,
  (SELECT id FROM squads LIMIT 1),
  'Strength Training',
  '2025-03-05 17:30:00'::timestamptz,
  '60 minutes'::interval,
  'Medium',
  '00000000-0000-0000-0000-000000000000'::uuid
),
(
  'a8fd159b-57c4-4d36-9bd7-a59ca13057bd'::uuid,
  (SELECT id FROM squads LIMIT 1),
  'Mobility Assessment',
  '2025-03-04 09:00:00'::timestamptz,
  '45 minutes'::interval,
  'Low',
  '00000000-0000-0000-0000-000000000000'::uuid
);

-- Insert workout participants with trainer feedback
INSERT INTO workout_participants (
  workout_id,
  user_id,
  attendance_status,
  performance_score,
  trainer_comments,
  best_exercise,
  needs_improvement,
  media_urls,
  trainer_input_type,
  session_title,
  session_time,
  session_exercises,
  input_timestamp
) VALUES
(
  'e8fd159b-57c4-4d36-9bd7-a59ca13057bb'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'present',
  92,
  'Excellent form and intensity throughout the session. Your burpee technique has improved significantly. Keep focusing on maintaining proper form during high-intensity intervals.',
  (SELECT id FROM exercises WHERE name = 'Burpees' LIMIT 1),
  (SELECT id FROM exercises WHERE name = 'Mountain Climbers' LIMIT 1),
  ARRAY[
    'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop'
  ],
  'performance',
  'Morning HIIT',
  '6:30 AM',
  '[
    {"name": "Burpees", "sets": 3, "reps": "15"},
    {"name": "Mountain Climbers", "sets": 3, "reps": "30"},
    {"name": "Jump Squats", "sets": 4, "reps": "20"}
  ]'::jsonb,
  '2025-03-06 07:30:00'::timestamptz
),
(
  'f8fd159b-57c4-4d36-9bd7-a59ca13057bc'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'present',
  88,
  'Good progress on strength exercises. Your squat form is improving, but let''s work on maintaining depth throughout the set. Remember to keep your core engaged during all movements.',
  (SELECT id FROM exercises WHERE name = 'Squats' LIMIT 1),
  (SELECT id FROM exercises WHERE name = 'Planks' LIMIT 1),
  ARRAY[
    'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop'
  ],
  'technique',
  'Strength Training',
  '5:30 PM',
  '[
    {"name": "Squats", "sets": 4, "reps": "12"},
    {"name": "Deadlifts", "sets": 4, "reps": "10"},
    {"name": "Bench Press", "sets": 3, "reps": "12"}
  ]'::jsonb,
  '2025-03-05 18:30:00'::timestamptz
),
(
  'a8fd159b-57c4-4d36-9bd7-a59ca13057bd'::uuid,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'present',
  95,
  'Outstanding progress in your mobility work! Your dynamic stretching routine is showing great results. The improvement in your hip mobility is particularly noteworthy.',
  (SELECT id FROM exercises WHERE name = 'Dynamic Pigeon Pose' LIMIT 1),
  (SELECT id FROM exercises WHERE name = 'Wall Slides' LIMIT 1),
  ARRAY[
    'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=800&auto=format&fit=crop'
  ],
  'assessment',
  'Mobility Assessment',
  '9:00 AM',
  '[
    {"name": "Dynamic Pigeon Pose", "sets": 3, "reps": "30 sec each side"},
    {"name": "Wall Slides", "sets": 3, "reps": "12"},
    {"name": "Thoracic Spine Windmills", "sets": 3, "reps": "10 each side"}
  ]'::jsonb,
  '2025-03-04 10:00:00'::timestamptz
);