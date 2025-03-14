-- First, let's create sample workouts
INSERT INTO daily_workouts (
  user_id,
  assigned_by,
  title,
  description,
  exercise,
  target,
  date
) VALUES 
-- Today's challenges
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'Morning Cardio Blast',
  'Start your day with this energizing cardio session',
  'Jump Rope + High Knees',
  '10 mins jump rope + 100 high knees',
  CURRENT_DATE
),
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'Core Challenge',
  'Focus on strengthening your core',
  'Plank Variations',
  '1 min each: standard, side, reverse',
  CURRENT_DATE
),
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'Evening Mobility',
  'End your day with mobility work',
  'Dynamic Stretching',
  'Full body mobility routine - 15 mins',
  CURRENT_DATE
),
-- Tomorrow's challenges
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'Push-up Challenge',
  'Test your upper body strength',
  'Push-ups',
  '50 push-ups throughout the day',
  CURRENT_DATE + INTERVAL '1 day'
),
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'Squat Series',
  'Lower body focus day',
  'Bodyweight Squats',
  '100 squats (4 sets of 25)',
  CURRENT_DATE + INTERVAL '1 day'
),
-- Day after tomorrow
(
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'Endurance Test',
  'Build your stamina',
  'Burpees',
  '50 burpees for time',
  CURRENT_DATE + INTERVAL '2 days'
);