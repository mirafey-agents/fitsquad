-- Create progress reminder function
CREATE OR REPLACE FUNCTION get_measurement_reminders()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  email text,
  last_measurement_date date,
  next_measurement_due date,
  days_overdue integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.display_name,
    u.email,
    u.last_measurement_date,
    u.next_measurement_due,
    EXTRACT(DAY FROM CURRENT_DATE - u.next_measurement_due)::integer as days_overdue
  FROM users u
  WHERE u.next_measurement_due <= CURRENT_DATE
  ORDER BY days_overdue DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get progress history
CREATE OR REPLACE FUNCTION get_progress_history(
  p_user_id uuid,
  p_metric text DEFAULT 'weight',
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  date date,
  value numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.date,
    CASE p_metric
      WHEN 'weight' THEN pm.weight
      WHEN 'body_fat' THEN pm.body_fat
      WHEN 'muscle_mass' THEN pm.muscle_mass
      WHEN 'chest' THEN pm.chest
      WHEN 'waist' THEN pm.waist
      WHEN 'hips' THEN pm.hips
      WHEN 'arms' THEN pm.arms
      WHEN 'thighs' THEN pm.thighs
      WHEN 'resting_heart_rate' THEN pm.resting_heart_rate::numeric
      ELSE pm.weight
    END as value
  FROM progress_metrics pm
  WHERE pm.user_id = p_user_id
  AND CASE p_metric
    WHEN 'weight' THEN pm.weight IS NOT NULL
    WHEN 'body_fat' THEN pm.body_fat IS NOT NULL
    WHEN 'muscle_mass' THEN pm.muscle_mass IS NOT NULL
    WHEN 'chest' THEN pm.chest IS NOT NULL
    WHEN 'waist' THEN pm.waist IS NOT NULL
    WHEN 'hips' THEN pm.hips IS NOT NULL
    WHEN 'arms' THEN pm.arms IS NOT NULL
    WHEN 'thighs' THEN pm.thighs IS NOT NULL
    WHEN 'resting_heart_rate' THEN pm.resting_heart_rate IS NOT NULL
    ELSE pm.weight IS NOT NULL
  END
  ORDER BY pm.date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to get latest metrics
CREATE OR REPLACE FUNCTION get_latest_metrics(
  p_user_id uuid
)
RETURNS TABLE (
  metric text,
  value numeric,
  previous_value numeric,
  change numeric,
  change_percentage numeric,
  date date
) AS $$
BEGIN
  RETURN QUERY
  WITH latest AS (
    SELECT * FROM progress_metrics
    WHERE user_id = p_user_id
    ORDER BY date DESC
    LIMIT 1
  ),
  previous AS (
    SELECT * FROM progress_metrics
    WHERE user_id = p_user_id
    AND date < (SELECT date FROM latest)
    ORDER BY date DESC
    LIMIT 1
  )
  SELECT
    m.metric,
    m.current_value,
    m.previous_value,
    m.current_value - m.previous_value as change,
    CASE 
      WHEN m.previous_value = 0 OR m.previous_value IS NULL THEN 0
      ELSE ROUND(((m.current_value - m.previous_value) / m.previous_value * 100)::numeric, 2)
    END as change_percentage,
    l.date
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
      'hips' as metric,
      l.hips as current_value,
      p.hips as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.hips IS NOT NULL
    
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
    
    UNION ALL
    
    SELECT 
      'resting_heart_rate' as metric,
      l.resting_heart_rate::numeric as current_value,
      p.resting_heart_rate::numeric as previous_value
    FROM latest l
    LEFT JOIN previous p ON true
    WHERE l.resting_heart_rate IS NOT NULL
  ) m
  CROSS JOIN latest l
  WHERE m.current_value IS NOT NULL;
END;
$$ LANGUAGE plpgsql;