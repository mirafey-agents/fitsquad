-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_latest_metrics;

-- Create improved get_latest_metrics function
CREATE OR REPLACE FUNCTION get_latest_metrics(
  p_user_id uuid
)
RETURNS TABLE (
  metric text,
  value numeric,
  change numeric,
  change_percentage numeric,
  measurement_date date
) AS $$
BEGIN
  RETURN QUERY
  WITH latest AS (
    SELECT * FROM progress_metrics
    WHERE user_id = p_user_id
    ORDER BY progress_metrics.date DESC
    LIMIT 1
  ),
  previous AS (
    SELECT * FROM progress_metrics
    WHERE user_id = p_user_id
    AND progress_metrics.date < (SELECT progress_metrics.date FROM latest)
    ORDER BY progress_metrics.date DESC
    LIMIT 1
  )
  SELECT
    m.metric,
    m.current_value as value,
    COALESCE(m.current_value - m.previous_value, 0) as change,
    CASE 
      WHEN m.previous_value = 0 OR m.previous_value IS NULL THEN 0
      ELSE ROUND(((m.current_value - m.previous_value) / m.previous_value * 100)::numeric, 2)
    END as change_percentage,
    l.date as measurement_date
  FROM (
    SELECT 
      'weight' as metric,
      l.weight as current_value,
      p.weight as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.weight IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'body_fat' as metric,
      l.body_fat as current_value,
      p.body_fat as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.body_fat IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'muscle_mass' as metric,
      l.muscle_mass as current_value,
      p.muscle_mass as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.muscle_mass IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'chest' as metric,
      l.chest as current_value,
      p.chest as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.chest IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'waist' as metric,
      l.waist as current_value,
      p.waist as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.waist IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'arms' as metric,
      l.arms as current_value,
      p.arms as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.arms IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'thighs' as metric,
      l.thighs as current_value,
      p.thighs as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.thighs IS NOT NULL
  ) m
  CROSS JOIN latest l
  WHERE m.current_value IS NOT NULL;
END;
$$ LANGUAGE plpgsql;