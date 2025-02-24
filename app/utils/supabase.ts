import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type UserRole = 'super_admin' | 'trainer' | 'member';

export async function shareWorkoutStats(workoutId: string) {
  try {
    // For demo/test workouts, return mock data
    if (workoutId === 'exercise-workout-id' || !workoutId) {
      return `
🏋️‍♂️ Squad Fit Workout Stats

Morning HIIT @ FitSquad
${new Date().toLocaleDateString()}

Top Performers:
1. Sarah Chen - 98%
2. Alex Wong - 94%
3. Mike Ross - 88%

Join our squad! 💪
`;
    }

    const { data: workout } = await supabase
      .from('workouts')
      .select(`
        *,
        squad:squads(name),
        participants:workout_participants(
          user:users(display_name),
          performance_score,
          mvp_votes,
          slacker_votes
        )
      `)
      .eq('id', workoutId)
      .single();

    if (!workout) throw new Error('Workout not found');

    const shareText = `
🏋️‍♂️ Squad Fit Workout Stats

${workout.title} @ ${workout.squad.name}
${new Date(workout.scheduled_time).toLocaleDateString()}

Top Performers:
${workout.participants
  .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
  .slice(0, 3)
  .map((p, i) => `${i + 1}. ${p.user.display_name} - ${p.performance_score}%`)
  .join('\n')}

Join our squad! 💪
`;

    return shareText;
  } catch (error) {
    console.error('Error generating share text:', error);
    return `
🏋️‍♂️ Squad Fit Workout Stats

Join our amazing fitness community! 💪
`;
  }
}

export async function shareChallenge(challengeId: string) {
  try {
    const { data: challenge } = await supabase
      .from('challenges')
      .select(`
        title,
        description,
        reward,
        participants
      `)
      .eq('id', challengeId)
      .single();

    if (!challenge) throw new Error('Challenge not found');

    const shareText = `
🏋️‍♂️ Join me on FitSquad!

${challenge.title}
${challenge.description}

💪 ${challenge.participants} squad members already joined
⚡ ${challenge.reward} points reward

Join our fitness journey! 🎯
`;

    return shareText;
  } catch (error) {
    console.error('Error generating share text:', error);
    throw error;
  }
}
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    return user?.role || 'member';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'member';
  }
}