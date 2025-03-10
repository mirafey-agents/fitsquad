/*
  # Progress Metrics Schema

  1. New Tables
    - `progress_metrics`
      - Stores user progress measurements and metrics
      - Includes body measurements, fitness scores, and health data
      - Supports tracking changes over time

  2. Security
    - Enable RLS
    - Add policies for user access
    - Add policies for trainer access
*/

-- Create progress metrics table
CREATE TABLE IF NOT EXISTS progress_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  weight numeric,
  body_fat numeric,
  muscle_mass numeric,
  chest numeric,
  waist numeric,
  hips numeric,
  arms numeric,
  thighs numeric,
  resting_heart_rate integer,
  blood_pressure text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own progress metrics"
  ON progress_metrics
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Trainers can view client progress metrics"
  ON progress_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users trainer
      WHERE trainer.id = auth.uid()
      AND trainer.role = 'trainer'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progress_metrics_user_date 
  ON progress_metrics(user_id, date);

-- Create function to calculate progress changes
CREATE OR REPLACE FUNCTION calculate_progress_changes(
  user_id uuid,
  start_date date,
  end_date date
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
    WHERE progress_metrics.user_id = calculate_progress_changes.user_id
    AND date >= start_date
    ORDER BY date ASC
    LIMIT 1
  ),
  end_metrics AS (
    SELECT * FROM progress_metrics
    WHERE progress_metrics.user_id = calculate_progress_changes.user_id
    AND date <= end_date
    ORDER BY date DESC
    LIMIT 1
  )
  SELECT
    m.metric,
    m.start_value,
    m.end_value,
    m.end_value - m.start_value as change,
    CASE 
      WHEN m.start_value = 0 THEN 0
      ELSE ((m.end_value - m.start_value) / m.start_value * 100)
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

-- Create function to get user ranking in squad
CREATE OR REPLACE FUNCTION get_squad_ranking(
  user_id uuid,
  metric text DEFAULT 'weight'
) RETURNS integer AS $$
DECLARE
  user_rank integer;
BEGIN
  WITH latest_metrics AS (
    SELECT 
      pm.user_id,
      pm.weight,
      pm.body_fat,
      ROW_NUMBER() OVER (
        PARTITION BY pm.user_id 
        ORDER BY pm.date DESC
      ) as rn
    FROM progress_metrics pm
  ),
  user_metrics AS (
    SELECT *
    FROM latest_metrics
    WHERE rn = 1
  )
  SELECT 
    rank
  INTO user_rank
  FROM (
    SELECT 
      user_id,
      RANK() OVER (
        ORDER BY 
          CASE 
            WHEN metric = 'weight' THEN weight
            WHEN metric = 'body_fat' THEN body_fat
            ELSE weight
          END ASC
      ) as rank
    FROM user_metrics
  ) rankings
  WHERE user_id = get_squad_ranking.user_id;

  RETURN user_rank;
END;
$$ LANGUAGE plpgsql;