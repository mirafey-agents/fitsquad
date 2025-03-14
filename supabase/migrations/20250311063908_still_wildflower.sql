/*
  # Gamification System Tables

  1. New Tables
    - point_rules: Defines point earning rules
    - user_points: Tracks point transactions
    - user_levels: Defines user levels and benefits
    - achievements: Defines available achievements
    - user_achievements: Tracks earned achievements

  2. Changes
    - Add total_points and current_level to users table
    
  3. Functions
    - award_points: Awards points to users
    - calculate_user_level: Updates user level based on points
    - award_achievement: Awards achievements to users
*/

-- Point Rules Table
CREATE TABLE IF NOT EXISTS point_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  points integer NOT NULL,
  daily_cap integer,
  weekly_cap integer,
  monthly_cap integer,
  cooldown_minutes integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User Points Table
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES point_rules(id),
  points integer NOT NULL CHECK (points >= 0),
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- User Levels Table
CREATE TABLE IF NOT EXISTS user_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  required_points integer NOT NULL,
  discount_percentage integer NOT NULL,
  badge_url text,
  created_at timestamptz DEFAULT now()
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  points integer NOT NULL,
  badge_url text,
  requirements jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User Achievements Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id),
  completed_at timestamptz DEFAULT now(),
  points_awarded integer NOT NULL,
  evidence jsonb
);

-- Add columns to users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'total_points') THEN
    ALTER TABLE users ADD COLUMN total_points integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_level') THEN
    ALTER TABLE users ADD COLUMN current_level uuid REFERENCES user_levels(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'points_history') THEN
    ALTER TABLE users ADD COLUMN points_history jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(
  p_user_id uuid,
  p_rule_name text,
  p_description text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_rule point_rules%ROWTYPE;
  v_points integer;
BEGIN
  -- Get the rule
  SELECT * INTO v_rule FROM point_rules WHERE name = p_rule_name AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Point rule not found';
  END IF;

  -- Check caps
  IF v_rule.daily_cap IS NOT NULL THEN
    SELECT COALESCE(SUM(points), 0) INTO v_points
    FROM user_points
    WHERE user_id = p_user_id 
      AND rule_id = v_rule.id
      AND created_at >= date_trunc('day', now());
    
    IF v_points >= v_rule.daily_cap THEN
      RETURN;
    END IF;
  END IF;

  -- Insert points
  INSERT INTO user_points (
    user_id,
    rule_id,
    points,
    description
  ) VALUES (
    p_user_id,
    v_rule.id,
    v_rule.points,
    COALESCE(p_description, v_rule.description)
  );

  -- Update user's total points
  UPDATE users 
  SET total_points = total_points + v_rule.points,
      points_history = points_history || jsonb_build_object(
        'points', v_rule.points,
        'description', COALESCE(p_description, v_rule.description),
        'timestamp', now()
      )
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate and update user level
CREATE OR REPLACE FUNCTION calculate_user_level() RETURNS trigger AS $$
BEGIN
  UPDATE users
  SET current_level = (
    SELECT id 
    FROM user_levels 
    WHERE required_points <= NEW.total_points 
    ORDER BY required_points DESC 
    LIMIT 1
  )
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_level ON users;

-- Create trigger to update user level when points change
CREATE TRIGGER update_user_level
  AFTER INSERT OR UPDATE OF total_points ON users
  FOR EACH ROW
  EXECUTE FUNCTION calculate_user_level();

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id uuid,
  p_achievement_id uuid,
  p_evidence jsonb DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_achievement achievements%ROWTYPE;
BEGIN
  -- Get the achievement
  SELECT * INTO v_achievement FROM achievements WHERE id = p_achievement_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Achievement not found';
  END IF;

  -- Award the achievement
  INSERT INTO user_achievements (
    user_id,
    achievement_id,
    points_awarded,
    evidence
  ) VALUES (
    p_user_id,
    p_achievement_id,
    v_achievement.points,
    p_evidence
  );

  -- Award points
  PERFORM award_points(
    p_user_id, 
    'achievement_completed',
    'Completed achievement: ' || v_achievement.name
  );
END;
$$ LANGUAGE plpgsql;

-- Insert default point rules
INSERT INTO point_rules (name, description, points, daily_cap) VALUES
  ('daily_habit', 'Complete a daily habit', 10, 50),
  ('onboarding_complete', 'Complete profile setup', 100, NULL),
  ('goal_set', 'Set a new goal', 50, 100),
  ('accountability_interaction', 'Interact with accountability partner', 15, 45),
  ('workout_checkin', 'Check in to a workout', 20, 60),
  ('workout_feedback', 'Provide workout feedback', 25, 75),
  ('view_insights', 'View progress insights', 10, 10),
  ('progress_update', 'Update progress metrics', 30, 30),
  ('social_share', 'Share achievement', 40, 120),
  ('challenge_complete', 'Complete a challenge', 100, 300),
  ('achievement_completed', 'Complete an achievement', 0, NULL)
ON CONFLICT DO NOTHING;

-- Insert default user levels
INSERT INTO user_levels (name, required_points, discount_percentage, badge_url) VALUES
  ('Bronze', 0, 0, 'https://example.com/badges/bronze.png'),
  ('Silver', 1000, 5, 'https://example.com/badges/silver.png'),
  ('Gold', 2500, 10, 'https://example.com/badges/gold.png'),
  ('Platinum', 5000, 15, 'https://example.com/badges/platinum.png'),
  ('Diamond', 10000, 20, 'https://example.com/badges/diamond.png')
ON CONFLICT DO NOTHING;

-- Enable RLS
DO $$ 
BEGIN
  ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
  ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
EXCEPTION 
  WHEN others THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view point rules" ON point_rules;
  DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
  DROP POLICY IF EXISTS "Public can view user levels" ON user_levels;
  DROP POLICY IF EXISTS "Public can view achievements" ON achievements;
  DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
EXCEPTION 
  WHEN others THEN NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Public can view point rules"
  ON point_rules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their own points"
  ON user_points FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Public can view user levels"
  ON user_levels FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view achievements"
  ON achievements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());