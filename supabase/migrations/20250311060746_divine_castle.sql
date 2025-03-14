/*
  # Gamification System Schema

  1. New Tables
    - `user_points`
      - Tracks point transactions and history
      - Records point source, amount, and timestamp
    - `user_levels` 
      - Stores level thresholds and benefits
      - Defines requirements for each level
    - `achievements`
      - Defines available achievements/badges
      - Tracks completion criteria
    - `user_achievements`
      - Links users to completed achievements
      - Records completion date and points awarded
    - `point_rules`
      - Defines point allocation rules
      - Stores caps and restrictions

  2. Security
    - Enable RLS on all tables
    - Add policies for secure point management
    - Prevent point manipulation

  3. Changes
    - Add level and points columns to users table
    - Add triggers for point calculations
*/

-- Point Rules Table
CREATE TABLE point_rules (
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

-- Insert default point rules
INSERT INTO point_rules (name, description, points, daily_cap) VALUES
  ('habit_completion', 'Points for completing daily habits', 10, 100),
  ('onboarding_completion', 'One-time points for completing onboarding', 100, NULL),
  ('goal_setting', 'Points for setting initial goals', 50, NULL),
  ('goal_update', 'Points for updating goals', 25, 25),
  ('accountability_interaction', 'Points for meaningful partner interactions', 15, 45),
  ('workout_checkin', 'Points for daily workout check-ins', 20, 20),
  ('workout_feedback', 'Points for post-workout feedback', 25, 75),
  ('insights_visit', 'Points for checking insights/leaderboards', 10, 10),
  ('progress_tracking', 'Points for weekly progress updates', 30, 30),
  ('social_share', 'Points for sharing achievements', 40, 120),
  ('challenge_completion', 'Points for completing challenges', 100, 300);

-- User Levels Table
CREATE TABLE user_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  required_points integer NOT NULL,
  discount_percentage integer NOT NULL,
  badge_url text,
  created_at timestamptz DEFAULT now()
);

-- Insert default levels
INSERT INTO user_levels (name, required_points, discount_percentage, badge_url) VALUES
  ('Bronze', 0, 0, 'https://example.com/badges/bronze.png'),
  ('Silver', 1000, 5, 'https://example.com/badges/silver.png'),
  ('Gold', 2500, 10, 'https://example.com/badges/gold.png'),
  ('Platinum', 5000, 15, 'https://example.com/badges/platinum.png'),
  ('Diamond', 10000, 20, 'https://example.com/badges/diamond.png');

-- Achievements Table
CREATE TABLE achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  points integer NOT NULL,
  badge_url text,
  requirements jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Insert some default achievements
INSERT INTO achievements (name, description, category, points, requirements) VALUES
  ('Early Bird', 'Complete 5 morning workouts', 'workout', 50, '{"workout_count": 5, "time_before": "09:00"}'),
  ('Consistency King', 'Log habits for 7 days straight', 'habits', 100, '{"streak_days": 7}'),
  ('Social Butterfly', 'Share 10 workouts', 'social', 75, '{"shares": 10}'),
  ('Goal Crusher', 'Achieve first fitness goal', 'goals', 150, '{"goals_achieved": 1}'),
  ('Squad Leader', 'Lead a group challenge', 'challenges', 200, '{"challenges_led": 1}');

-- User Points Table
CREATE TABLE user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES point_rules(id),
  points integer NOT NULL,
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_points CHECK (points >= 0)
);

-- User Achievements Table
CREATE TABLE user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id),
  completed_at timestamptz DEFAULT now(),
  points_awarded integer NOT NULL,
  evidence jsonb
);

-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_points integer DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level uuid REFERENCES user_levels(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS points_history jsonb DEFAULT '[]';

-- Enable RLS
ALTER TABLE point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view point rules"
  ON point_rules FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view user levels"
  ON user_levels FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can view achievements"
  ON achievements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can view their own points"
  ON user_points FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to calculate user level
CREATE OR REPLACE FUNCTION calculate_user_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the appropriate level based on total points
  WITH user_total AS (
    SELECT SUM(points) as total
    FROM user_points
    WHERE user_id = NEW.user_id
    AND (expires_at IS NULL OR expires_at > NOW())
  )
  UPDATE users
  SET 
    total_points = user_total.total,
    current_level = (
      SELECT id 
      FROM user_levels 
      WHERE required_points <= user_total.total 
      ORDER BY required_points DESC 
      LIMIT 1
    )
  FROM user_total
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user level when points change
CREATE TRIGGER update_user_level
  AFTER INSERT OR UPDATE ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION calculate_user_level();

-- Function to award achievement
CREATE OR REPLACE FUNCTION award_achievement(
  p_user_id uuid,
  p_achievement_id uuid,
  p_evidence jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
DECLARE
  v_points integer;
BEGIN
  -- Get points for achievement
  SELECT points INTO v_points
  FROM achievements
  WHERE id = p_achievement_id;

  -- Insert achievement record
  INSERT INTO user_achievements (
    user_id,
    achievement_id,
    points_awarded,
    evidence
  ) VALUES (
    p_user_id,
    p_achievement_id,
    v_points,
    p_evidence
  );

  -- Award points
  INSERT INTO user_points (
    user_id,
    rule_id,
    points,
    description
  ) VALUES (
    p_user_id,
    (SELECT id FROM point_rules WHERE name = 'achievement_completion' LIMIT 1),
    v_points,
    'Achievement completion bonus'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check daily point caps
CREATE OR REPLACE FUNCTION check_point_cap(
  p_user_id uuid,
  p_rule_id uuid,
  p_points integer
) RETURNS boolean AS $$
DECLARE
  v_daily_points integer;
  v_daily_cap integer;
BEGIN
  -- Get daily cap for rule
  SELECT daily_cap INTO v_daily_cap
  FROM point_rules
  WHERE id = p_rule_id;

  -- If no cap, return true
  IF v_daily_cap IS NULL THEN
    RETURN true;
  END IF;

  -- Get points awarded today for this rule
  SELECT COALESCE(SUM(points), 0) INTO v_daily_points
  FROM user_points
  WHERE user_id = p_user_id
    AND rule_id = p_rule_id
    AND created_at >= CURRENT_DATE;

  -- Check if adding these points would exceed cap
  RETURN (v_daily_points + p_points) <= v_daily_cap;
END;
$$ LANGUAGE plpgsql;

-- Function to award points
CREATE OR REPLACE FUNCTION award_points(
  p_user_id uuid,
  p_rule_name text,
  p_description text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_rule_id uuid;
  v_points integer;
BEGIN
  -- Get rule details
  SELECT id, points INTO v_rule_id, v_points
  FROM point_rules
  WHERE name = p_rule_name
    AND is_active = true;

  -- Check if under daily cap
  IF check_point_cap(p_user_id, v_rule_id, v_points) THEN
    -- Award points
    INSERT INTO user_points (
      user_id,
      rule_id,
      points,
      description
    ) VALUES (
      p_user_id,
      v_rule_id,
      v_points,
      COALESCE(p_description, (SELECT description FROM point_rules WHERE id = v_rule_id))
    );
  END IF;
END;
$$ LANGUAGE plpgsql;