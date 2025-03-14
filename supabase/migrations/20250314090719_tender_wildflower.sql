/*
  # Add Calendar Sample Data

  1. Changes
    - Add sample workouts for the next 30 days
    - Include both group and personal training sessions
    - Add realistic scheduling patterns
    - Include prime time and regular slots
*/

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

-- Add sample workouts for the next 30 days
DO $$
DECLARE
  v_date date;
  v_workout_id uuid;
  v_studio_id uuid;
  v_fitness_hub_id uuid;
  v_park_id uuid;
BEGIN
  -- Get location IDs
  SELECT id INTO v_studio_id FROM training_locations WHERE name = 'FitSquad Studio' LIMIT 1;
  SELECT id INTO v_fitness_hub_id FROM training_locations WHERE name = 'Fitness Hub' LIMIT 1;
  SELECT id INTO v_park_id FROM training_locations WHERE name = 'Cubbon Park' LIMIT 1;
  
  -- Generate workouts for next 30 days
  FOR v_date IN SELECT generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', '1 day')::date LOOP
    -- Skip Sundays for group sessions
    IF EXTRACT(DOW FROM v_date) != 0 THEN
      -- Morning HIIT (6:30 AM) - Group Training
      INSERT INTO workouts (
        squad_id,
        title,
        scheduled_time,
        duration,
        intensity,
        location_id,
        is_prime_time,
        status,
        max_participants
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Morning HIIT',
        v_date + time '06:30',
        '45 minutes'::interval,
        'High',
        v_studio_id,
        true,
        'confirmed',
        12
      ) RETURNING id INTO v_workout_id;

      -- Add participants to morning session
      INSERT INTO workout_participants (workout_id, user_id, attendance_status)
      SELECT v_workout_id, user_id, 'confirmed'
      FROM squad_members
      WHERE squad_id = '00000000-0000-0000-0000-000000000001';

      -- Evening Power Squad (6:30 PM) - Group Training
      INSERT INTO workouts (
        squad_id,
        title,
        scheduled_time,
        duration,
        intensity,
        location_id,
        is_prime_time,
        status,
        max_participants
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'Evening Power Squad',
        v_date + time '18:30',
        '45 minutes'::interval,
        'High',
        v_studio_id,
        true,
        'confirmed',
        12
      ) RETURNING id INTO v_workout_id;

      -- Add participants to evening session
      INSERT INTO workout_participants (workout_id, user_id, attendance_status)
      SELECT v_workout_id, user_id, 'confirmed'
      FROM squad_members
      WHERE squad_id = '00000000-0000-0000-0000-000000000001';
    END IF;

    -- Personal Training (9:00 AM)
    INSERT INTO workouts (
      client_id,
      title,
      scheduled_time,
      duration,
      intensity,
      location_id,
      is_prime_time,
      status,
      max_participants
    ) VALUES (
      '00000000-0000-0000-0000-000000000002',
      'Personal Training',
      v_date + time '09:00',
      '60 minutes'::interval,
      'Medium',
      v_fitness_hub_id,
      false,
      'confirmed',
      1
    ) RETURNING id INTO v_workout_id;

    -- Add participant to morning personal session
    INSERT INTO workout_participants (workout_id, user_id, attendance_status)
    VALUES (v_workout_id, '00000000-0000-0000-0000-000000000002', 'confirmed');

    -- Afternoon Session (3:00 PM)
    INSERT INTO workouts (
      client_id,
      title,
      scheduled_time,
      duration,
      intensity,
      location_id,
      is_prime_time,
      status,
      max_participants
    ) VALUES (
      '00000000-0000-0000-0000-000000000004',
      'Strength & Conditioning',
      v_date + time '15:00',
      '60 minutes'::interval,
      'High',
      v_park_id,
      false,
      'confirmed',
      1
    ) RETURNING id INTO v_workout_id;

    -- Add participant to afternoon session
    INSERT INTO workout_participants (workout_id, user_id, attendance_status)
    VALUES (v_workout_id, '00000000-0000-0000-0000-000000000004', 'confirmed');
  END LOOP;

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
END $$;