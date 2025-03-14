import { supabase } from './supabase';

export interface PointRule {
  id: string;
  name: string;
  points: number;
  daily_cap: number | null;
  description: string;
}

export interface UserLevel {
  id: string;
  name: string;
  required_points: number;
  discount_percentage: number;
  badge_url: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  badge_url: string;
  requirements: Record<string, any>;
}

// Award points to a user
export async function awardPoints(
  userId: string,
  ruleName: string,
  description?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('award_points', {
      p_user_id: userId,
      p_rule_name: ruleName,
      p_description: description
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error awarding points:', error);
    return false;
  }
}

// Get user's current level and progress
export async function getUserLevelProgress(userId: string) {
  try {
    // Get user's current points and level
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('total_points, current_level')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    // Get all levels for progress calculation
    const { data: levels, error: levelsError } = await supabase
      .from('user_levels')
      .select('*')
      .order('required_points', { ascending: true });

    if (levelsError) throw levelsError;

    const currentLevel = levels.find(level => level.id === userData.current_level);
    const nextLevelIndex = levels.findIndex(level => level.id === userData.current_level) + 1;
    const nextLevel = nextLevelIndex < levels.length ? levels[nextLevelIndex] : null;

    return {
      currentPoints: userData.total_points,
      currentLevel,
      nextLevel,
      levels
    };
  } catch (error) {
    console.error('Error getting user level progress:', error);
    return null;
  }
}

// Get user's achievements
export async function getUserAchievements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
}

// Check and award achievements
export async function checkAchievements(userId: string) {
  try {
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (achievementsError) throw achievementsError;

    for (const achievement of achievements) {
      // Check if already earned
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievement.id)
        .maybeSingle();

      if (existing) continue;

      // Check requirements
      const meetsRequirements = await checkAchievementRequirements(userId, achievement);
      
      if (meetsRequirements) {
        await supabase.rpc('award_achievement', {
          p_user_id: userId,
          p_achievement_id: achievement.id,
          p_evidence: meetsRequirements
        });
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// Helper function to check achievement requirements
async function checkAchievementRequirements(
  userId: string, 
  achievement: Achievement
): Promise<Record<string, any> | null> {
  try {
    const requirements = achievement.requirements;
    let evidence: Record<string, any> = {};

    switch (achievement.category) {
      case 'workout':
        if (requirements.workout_count) {
          const { data: workouts } = await supabase
            .from('workout_participants')
            .select('count')
            .eq('user_id', userId)
            .eq('attendance_status', 'present');
          
          evidence.workout_count = workouts?.[0]?.count || 0;
          if (evidence.workout_count < requirements.workout_count) {
            return null;
          }
        }
        break;

      case 'habits':
        if (requirements.streak_days) {
          const { data: habits } = await supabase
            .from('user_habits')
            .select('streak')
            .eq('user_id', userId)
            .gte('streak', requirements.streak_days)
            .limit(1);
          
          if (!habits?.length) {
            return null;
          }
          evidence.streak_days = habits[0].streak;
        }
        break;

      case 'social':
        if (requirements.shares) {
          const { data: shares } = await supabase
            .from('social_shares')
            .select('count')
            .eq('user_id', userId);
          
          evidence.shares = shares?.[0]?.count || 0;
          if (evidence.shares < requirements.shares) {
            return null;
          }
        }
        break;

      case 'goals':
        if (requirements.goals_achieved) {
          const { data: goals } = await supabase
            .from('user_goals')
            .select('count')
            .eq('user_id', userId)
            .eq('status', 'achieved');
          
          evidence.goals_achieved = goals?.[0]?.count || 0;
          if (evidence.goals_achieved < requirements.goals_achieved) {
            return null;
          }
        }
        break;

      default:
        return null;
    }

    return evidence;
  } catch (error) {
    console.error('Error checking achievement requirements:', error);
    return null;
  }
}

// Get point history for a user
export async function getPointHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select(`
        *,
        rule:point_rules(name, description)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting point history:', error);
    return [];
  }
}

// Get leaderboard data
export async function getLeaderboard(timeframe: 'weekly' | 'monthly' = 'weekly') {
  try {
    const timeFilter = timeframe === 'weekly' 
      ? "created_at >= date_trunc('week', now())"
      : "created_at >= date_trunc('month', now())";

    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        display_name,
        total_points,
        current_level:user_levels(name, badge_url)
      `)
      .order('total_points', { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}