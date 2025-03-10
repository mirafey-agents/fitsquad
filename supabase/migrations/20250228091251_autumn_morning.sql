-- Add sample progress metrics for demo user
INSERT INTO progress_metrics (
  user_id,
  date,
  weight,
  body_fat,
  muscle_mass,
  chest,
  waist,
  hips,
  arms,
  thighs,
  resting_heart_rate,
  notes
)
VALUES
  -- Initial baseline (3 months ago)
  ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '90 days', 85.5, 22.0, 65.0, 102.0, 88.0, 105.0, 36.0, 60.0, 72, 'Initial measurements'),
  
  -- 2 months ago
  ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '60 days', 83.2, 21.0, 65.5, 101.0, 86.5, 104.0, 36.5, 59.5, 70, 'Making progress'),
  
  -- 1 month ago
  ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '30 days', 81.0, 20.0, 66.0, 100.0, 85.0, 103.0, 37.0, 59.0, 68, 'Consistent improvement'),
  
  -- 2 weeks ago
  ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '14 days', 80.2, 19.5, 66.5, 99.5, 84.0, 102.5, 37.5, 58.5, 66, 'Good progress'),
  
  -- Current
  ('00000000-0000-0000-0000-000000000000', CURRENT_DATE - INTERVAL '1 day', 79.5, 19.0, 67.0, 99.0, 83.0, 102.0, 38.0, 58.0, 65, 'Latest measurements');

-- Update user weight class and measurement schedule
UPDATE users
SET 
  weight_class = calculate_weight_class(79.5),
  fitness_level = 'Intermediate',
  last_measurement_date = CURRENT_DATE - INTERVAL '1 day',
  next_measurement_due = CURRENT_DATE - INTERVAL '1 day' + INTERVAL '7 days'
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Create function to generate shareable progress card
CREATE OR REPLACE FUNCTION generate_progress_card(
  p_user_id uuid,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT CURRENT_DATE
)
RETURNS jsonb AS $$
DECLARE
  v_result jsonb;
  v_start_date date;
BEGIN
  -- If start date is not provided, use the earliest available date
  IF p_start_date IS NULL THEN
    SELECT MIN(date) INTO v_start_date
    FROM progress_metrics
    WHERE user_id = p_user_id;
  ELSE
    v_start_date := p_start_date;
  END IF;
  
  -- Get user info
  WITH user_info AS (
    SELECT 
      display_name,
      weight_class,
      fitness_level
    FROM users
    WHERE id = p_user_id
  ),
  -- Get progress changes
  progress_changes AS (
    SELECT 
      metric,
      start_value,
      end_value,
      change,
      change_percentage
    FROM calculate_progress_changes(p_user_id, v_start_date, p_end_date)
  ),
  -- Get squad ranking
  rankings AS (
    SELECT
      get_squad_ranking(p_user_id, 'weight') as weight_rank,
      get_squad_ranking(p_user_id, 'body_fat') as body_fat_rank
  )
  -- Combine all data into a JSON object
  SELECT 
    jsonb_build_object(
      'user', (SELECT row_to_json(user_info) FROM user_info),
      'period', jsonb_build_object(
        'start_date', v_start_date,
        'end_date', p_end_date,
        'days', p_end_date - v_start_date
      ),
      'changes', (SELECT jsonb_agg(row_to_json(progress_changes)) FROM progress_changes),
      'rankings', (SELECT row_to_json(rankings) FROM rankings),
      'generated_at', CURRENT_TIMESTAMP
    )
  INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;