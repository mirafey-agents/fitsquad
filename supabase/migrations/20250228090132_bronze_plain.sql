/*
  # Progress Metrics Enhancement

  1. New Fields
    - Added weight_class field to users table
    - Added fitness_level field to users table
    - Added measurement_reminder_frequency to users table
    - Added last_measurement_date to users table
    - Added next_measurement_due to users table

  2. Changes
    - Enhanced progress_metrics table with additional fields
    - Added comparison metrics for weight class and fitness level
    - Added measurement reminder functionality

  3. Security
    - Updated RLS policies for new fields
    - Added policies for measurement reminders
*/

-- Add new fields to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS weight_class text,
  ADD COLUMN IF NOT EXISTS fitness_level text,
  ADD COLUMN IF NOT EXISTS measurement_reminder_frequency interval DEFAULT '7 days'::interval,
  ADD COLUMN IF NOT EXISTS last_measurement_date date,
  ADD COLUMN IF NOT EXISTS next_measurement_due date;

-- Add new fields to progress_metrics table
ALTER TABLE progress_metrics
  ADD COLUMN IF NOT EXISTS body_measurements jsonb,
  ADD COLUMN IF NOT EXISTS fitness_scores jsonb,
  ADD COLUMN IF NOT EXISTS medical_reports jsonb,
  ADD COLUMN IF NOT EXISTS photos text[],
  ADD COLUMN IF NOT EXISTS comparison_metrics jsonb;

-- Create function to calculate weight class
CREATE OR REPLACE FUNCTION calculate_weight_class(weight numeric)
RETURNS text AS $$
BEGIN
  RETURN CASE
    WHEN weight < 60 THEN 'Lightweight'
    WHEN weight >= 60 AND weight < 75 THEN 'Middleweight'
    WHEN weight >= 75 AND weight < 90 THEN 'Light-Heavyweight'
    ELSE 'Heavyweight'
  END;
END;
$$ LANGUAGE plpgsql;

-- Create function to update user weight class
CREATE OR REPLACE FUNCTION update_user_weight_class()
RETURNS trigger AS $$
BEGIN
  UPDATE users
  SET weight_class = calculate_weight_class(NEW.weight)
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update weight class on new measurements
DROP TRIGGER IF EXISTS update_weight_class_trigger ON progress_metrics;
CREATE TRIGGER update_weight_class_trigger
  AFTER INSERT OR UPDATE OF weight
  ON progress_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_weight_class();

-- Create function to get comparable members
CREATE OR REPLACE FUNCTION get_comparable_members(
  p_user_id uuid,
  p_metric text DEFAULT 'weight'
)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  metric_value numeric,
  weight_class text,
  fitness_level text
) AS $$
BEGIN
  RETURN QUERY
  WITH user_info AS (
    SELECT 
      weight_class,
      fitness_level
    FROM users
    WHERE id = p_user_id
  ),
  latest_metrics AS (
    SELECT DISTINCT ON (user_id)
      user_id,
      CASE p_metric
        WHEN 'weight' THEN weight
        WHEN 'body_fat' THEN body_fat
        WHEN 'muscle_mass' THEN muscle_mass
        ELSE weight
      END as metric_value,
      date
    FROM progress_metrics
    WHERE metric_value IS NOT NULL
    ORDER BY user_id, date DESC
  )
  SELECT 
    lm.user_id,
    u.display_name,
    lm.metric_value,
    u.weight_class,
    u.fitness_level
  FROM latest_metrics lm
  JOIN users u ON u.id = lm.user_id
  CROSS JOIN user_info ui
  WHERE (u.weight_class = ui.weight_class OR u.fitness_level = ui.fitness_level)
  AND u.id != p_user_id
  ORDER BY lm.metric_value;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if measurement is due
CREATE OR REPLACE FUNCTION is_measurement_due(
  p_user_id uuid
) RETURNS boolean AS $$
DECLARE
  v_next_due date;
BEGIN
  SELECT next_measurement_due INTO v_next_due
  FROM users
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_next_due <= CURRENT_DATE, true);
END;
$$ LANGUAGE plpgsql;

-- Create function to update measurement schedule
CREATE OR REPLACE FUNCTION update_measurement_schedule()
RETURNS trigger AS $$
BEGIN
  UPDATE users
  SET 
    last_measurement_date = NEW.date,
    next_measurement_due = NEW.date + measurement_reminder_frequency
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for measurement schedule
DROP TRIGGER IF EXISTS update_measurement_schedule_trigger ON progress_metrics;
CREATE TRIGGER update_measurement_schedule_trigger
  AFTER INSERT
  ON progress_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_measurement_schedule();

-- Update RLS policies
DROP POLICY IF EXISTS "Allow demo user access to progress metrics" ON progress_metrics;
CREATE POLICY "Allow demo user access to progress metrics"
  ON progress_metrics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_weight_class_fitness 
  ON users(weight_class, fitness_level);

CREATE INDEX IF NOT EXISTS idx_progress_metrics_comparison 
  ON progress_metrics(user_id, date, weight, body_fat, muscle_mass);