-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_squad_ranking(uuid, text);
DROP FUNCTION IF EXISTS calculate_progress_changes(uuid, date, date);

-- Create or replace the get_squad_ranking function with better error handling
CREATE OR REPLACE FUNCTION get_squad_ranking(
  p_user_id uuid,
  p_metric text DEFAULT 'weight'
) RETURNS integer AS $$
DECLARE
  v_user_rank integer;
BEGIN
  -- Validate metric parameter
  IF p_metric NOT IN ('weight', 'body_fat', 'muscle_mass', 'waist') THEN
    RAISE EXCEPTION 'Invalid metric: %', p_metric;
  END IF;

  -- Get user's rank based on their latest metrics
  WITH latest_metrics AS (
    SELECT 
      user_id,
      CASE p_metric
        WHEN 'weight' THEN weight
        WHEN 'body_fat' THEN body_fat
        WHEN 'muscle_mass' THEN muscle_mass
        WHEN 'waist' THEN waist
      END as metric_value,
      ROW_NUMBER() OVER (
        PARTITION BY user_id 
        ORDER BY date DESC
      ) as rn
    FROM progress_metrics
    WHERE metric_value IS NOT NULL
  ),
  user_metrics AS (
    SELECT *
    FROM latest_metrics
    WHERE rn = 1
  )
  SELECT 
    RANK() OVER (
      ORDER BY 
        CASE 
          WHEN p_metric IN ('weight', 'body_fat', 'waist') THEN metric_value
          ELSE -metric_value -- For metrics where higher is better
        END ASC
    )
  INTO v_user_rank
  FROM user_metrics
  WHERE user_id = p_user_id;

  RETURN COALESCE(v_user_rank, 1);
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return null
    RAISE NOTICE 'Error in get_squad_ranking: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the calculate_progress_changes function with better error handling
CREATE OR REPLACE FUNCTION calculate_progress_changes(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
) RETURNS TABLE (
  metric text,
  start_value numeric,
  end_value numeric,
  change numeric,
  change_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  WITH start_metrics AS (
    SELECT * FROM progress_metrics
    WHERE user_id = p_user_id
    AND date >= p_start_date
    ORDER BY date ASC
    LIMIT 1
  ),
  end_metrics AS (
    SELECT * FROM progress_metrics
    WHERE user_id = p_user_id
    AND date <= p_end_date
    ORDER BY date DESC
    LIMIT 1
  )
  SELECT
    m.metric,
    m.start_value,
    m.end_value,
    COALESCE(m.end_value - m.start_value, 0) as change,
    CASE 
      WHEN m.start_value = 0 OR m.start_value IS NULL THEN 0
      ELSE ROUND(((m.end_value - m.start_value) / m.start_value * 100)::numeric, 2)
    END as change_percentage
  FROM (
    SELECT 
      'weight' as metric,
      COALESCE(s.weight, 0) as start_value,
      COALESCE(e.weight, 0) as end_value
    FROM start_metrics s
    CROSS JOIN end_metrics e
    UNION ALL
    SELECT 
      'body_fat',
      COALESCE(s.body_fat, 0),
      COALESCE(e.body_fat, 0)
    FROM start_metrics s
    CROSS JOIN end_metrics e
    UNION ALL
    SELECT 
      'muscle_mass',
      COALESCE(s.muscle_mass, 0),
      COALESCE(e.muscle_mass, 0)
    FROM start_metrics s
    CROSS JOIN end_metrics e
    UNION ALL
    SELECT 
      'waist',
      COALESCE(s.waist, 0),
      COALESCE(e.waist, 0)
    FROM start_metrics s
    CROSS JOIN end_metrics e
  ) m
  WHERE m.start_value > 0 OR m.end_value > 0;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_progress_metrics_user_metric 
  ON progress_metrics(user_id, weight, body_fat, muscle_mass, waist);

CREATE INDEX IF NOT EXISTS idx_progress_metrics_date 
  ON progress_metrics(date);

-- Update RLS policies to allow demo user access
CREATE POLICY "Allow demo user access to progress metrics"
  ON progress_metrics
  FOR ALL
  USING (true)
  WITH CHECK (true);