import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { supabase } from '../utils/supabase';

interface DailyWorkout {
  id: string;
  title: string;
  description?: string;
  exercise: string;
  target: string;
  completed: boolean;
  completed_at?: string;
}

export default function DailyChallenges({ preview = false }) {
  const [workouts, setWorkouts] = useState<DailyWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample data for demonstration
  const DEMO_WORKOUTS = [
    {
      id: 'e8fd159b-57c4-4d36-9bd7-a59ca13057bb',
      title: 'Morning Cardio Blast',
      description: 'Start your day with this energizing cardio session',
      exercise: 'Jump Rope + High Knees',
      target: '10 mins jump rope + 100 high knees',
      completed: false,
      completed_at: null
    },
    {
      id: 'f8fd159b-57c4-4d36-9bd7-a59ca13057bc',
      title: 'Core Challenge',
      description: 'Focus on strengthening your core',
      exercise: 'Plank Variations',
      target: '1 min each: standard, side, reverse',
      completed: true,
      completed_at: new Date().toISOString()
    },
    {
      id: 'a8fd159b-57c4-4d36-9bd7-a59ca13057bd',
      title: 'Evening Mobility',
      description: 'End your day with mobility work',
      exercise: 'Dynamic Stretching',
      target: 'Full body mobility routine - 15 mins',
      completed: false,
      completed_at: null
    }
  ];

  useEffect(() => {
    fetchDailyWorkouts();
  }, []);

  const fetchDailyWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('daily_workouts')
        .select('*')
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
        .eq('date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      // Use demo data if no data from backend
      setWorkouts(data?.length ? data : DEMO_WORKOUTS);
    } catch (error) {
      console.error('Error fetching daily workouts:', error);
      setError('Failed to load daily workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutComplete = async (workoutId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('daily_workouts')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', workoutId);

      if (updateError) throw updateError;

      setWorkouts(prev =>
        prev.map(w =>
          w.id === workoutId
            ? { ...w, completed: true, completed_at: new Date().toISOString() }
            : w
        )
      );
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  if (preview) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Today's Challenges</Text>
          <Pressable style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary.dark} />
          </Pressable>
        </View>

        <View style={styles.previewList}>
          {DEMO_WORKOUTS.slice(0, 2).map((workout, index) => (
            <Animated.View
              key={workout.id}
              entering={FadeInUp.delay(index * 100)}
              style={styles.workoutPreviewCard}
            >
              <BlurView intensity={80} style={styles.workoutIcon}>
                <Ionicons
                  name="barbell"
                  size={24}
                  color={workout.completed ? colors.semantic.success : colors.primary.dark}
                />
              </BlurView>
              <View style={styles.workoutPreviewInfo}>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <Text style={styles.workoutTarget}>{workout.target}</Text>
              </View>
              {workout.completed && (
                <BlurView intensity={80} style={styles.completedBadge}>
                  <Ionicons name="checkmark" size={16} color={colors.semantic.success} />
                </BlurView>
              )}
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Challenges</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading challenges...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : workouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="barbell" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyStateText}>No challenges for today</Text>
          <Text style={styles.emptyStateSubtext}>
            Check back later for new challenges from your trainer
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.workoutList}>
          {workouts.map((workout, index) => (
            <Animated.View
              key={workout.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <Pressable
                style={styles.workoutCard}
                onPress={() => !workout.completed && handleWorkoutComplete(workout.id)}
              >
                <View style={styles.workoutHeader}>
                  <BlurView intensity={80} style={styles.workoutIcon}>
                    <Ionicons
                      name="barbell"
                      size={24}
                      color={workout.completed ? colors.semantic.success : colors.primary.dark}
                    />
                  </BlurView>
                  <View style={styles.workoutInfo}>
                    <Text style={styles.workoutTitle}>{workout.title}</Text>
                    {workout.description && (
                      <Text style={styles.workoutDescription}>{workout.description}</Text>
                    )}
                  </View>
                  {workout.completed && (
                    <BlurView intensity={80} style={styles.completedBadge}>
                      <Ionicons name="checkmark" size={16} color={colors.semantic.success} />
                    </BlurView>
                  )}
                </View>

                <View style={styles.workoutDetails}>
                  <View style={styles.workoutExercise}>
                    <Text style={styles.detailLabel}>Exercise:</Text>
                    <Text style={styles.detailText}>{workout.exercise}</Text>
                  </View>
                  <View style={styles.workoutTarget}>
                    <Text style={styles.detailLabel}>Target:</Text>
                    <Text style={styles.detailText}>{workout.target}</Text>
                  </View>
                </View>

                {workout.completed && workout.completed_at && (
                  <Text style={styles.completedTime}>
                    Completed at {new Date(workout.completed_at).toLocaleTimeString()}
                  </Text>
                )}

                {!workout.completed && (
                  <Pressable
                    style={styles.completeButton}
                    onPress={() => handleWorkoutComplete(workout.id)}
                  >
                    <Text style={styles.completeButtonText}>Mark as Complete</Text>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary.light} />
                  </Pressable>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  previewList: {
    gap: spacing.md,
  },
  workoutPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    ...shadows.sm,
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
  },
  workoutPreviewInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  workoutTarget: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  completedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success + '20',
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  emptyStateSubtext: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
  },
  workoutList: {
    marginTop: spacing.md,
  },
  workoutCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  workoutDetails: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  workoutExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
    width: 70,
  },
  detailText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  completedTime: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    textAlign: 'right',
    marginTop: spacing.sm,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.dark,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  completeButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.light,
  },
});