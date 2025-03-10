/*
  # Add workout tracking features
  
  1. Changes
    - Add trainer comments and performance tracking to workout_participants
    - Add best/needs improvement exercise tracking
    - Add media support
    - Add performance score calculation
  
  2. New Columns
    - trainer_comments: Text field for trainer feedback
    - best_exercise: Reference to exercises table
    - needs_improvement: Reference to exercises table
    - media_urls: Array of media URLs
    - performance_score: Float for overall performance tracking
*/

-- Add new columns to workout_participants table
ALTER TABLE workout_participants
  ADD COLUMN IF NOT EXISTS trainer_comments text,
  ADD COLUMN IF NOT EXISTS best_exercise integer REFERENCES exercises(id),
  ADD COLUMN IF NOT EXISTS needs_improvement integer REFERENCES exercises(id),
  ADD COLUMN IF NOT EXISTS media_urls text[];

-- Create function to calculate member performance score
CREATE OR REPLACE FUNCTION calculate_member_performance()
RETURNS trigger AS $$
BEGIN
  -- Update the member's overall performance score
  -- This is a weighted calculation based on trainer ratings and attendance
  UPDATE users
  SET performance_score = (
    SELECT 
      COALESCE(
        (AVG(performance_score) * 0.7 + 
         (COUNT(*) FILTER (WHERE attendance_status = 'present')::float / NULLIF(COUNT(*), 0) * 100) * 0.3
        ),
        0
      )
    FROM workout_participants
    WHERE user_id = NEW.user_id
    AND performance_score IS NOT NULL
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update performance score
DROP TRIGGER IF EXISTS update_member_performance ON workout_participants;
CREATE TRIGGER update_member_performance
  AFTER INSERT OR UPDATE OF performance_score, attendance_status
  ON workout_participants
  FOR EACH ROW
  EXECUTE FUNCTION calculate_member_performance();

-- Add performance_score column to users if it doesn't exist
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS performance_score float DEFAULT 0;

-- Create index for performance calculations
CREATE INDEX IF NOT EXISTS idx_workout_participants_user_perf 
  ON workout_participants(user_id, performance_score, attendance_status);