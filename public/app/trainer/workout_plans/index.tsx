import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing } from '@/constants/theme';
import { getWorkoutPlans, WorkoutPlan } from '@/utils/firebase/workoutPlans';



export default function WorkoutPlansIndex() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true);
      const plans = await getWorkoutPlans();
      console.log('plans', plans);
      setWorkoutPlans(plans);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      Alert.alert('Error', 'Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };



  const getTotalExercises = (plan: WorkoutPlan) => {
    return plan.exercises.length;
  };

  const getTotalEnergyPoints = (plan: WorkoutPlan) => {
    return plan.exercises.reduce((total, exercise) => total + exercise.energy_points, 0);
  };

  const formatDate = (seconds: number) => {
    return new Date(seconds*1000).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#21262F', '#353D45']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.title}>Workout Plans</Text>
                      <Pressable
              style={styles.createButton}
              onPress={() => router.push('./create', {relativeToDirectory: true})}
            >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading workout plans...</Text>
          </View>
        ) : workoutPlans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color={colors.gray[400]} />
            <Text style={styles.emptyTitle}>No Workout Plans</Text>
            <Text style={styles.emptySubtitle}>
              Create your first workout plan to get started
            </Text>
                          <Pressable
                style={styles.createFirstButton}
                onPress={() => router.push('./create', {relativeToDirectory: true})}
              >
              <Text style={styles.createFirstButtonText}>Create Workout Plan</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.plansContainer}>
            {workoutPlans.map((plan, index) => (
              <Animated.View
                key={plan.id}
                entering={FadeInUp.delay(index * 100)}
                style={styles.planCard}
              >
                <Pressable
                  style={styles.planCardPressable}
                  onPress={() => router.push(`./${plan.id}`, {relativeToDirectory: true})}
                >
                  <View style={styles.planHeader}>
                    <View style={styles.planInfo}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planDate}>
                        Created {formatDate(plan.created_at._seconds)}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                  </View>
                </Pressable>

                <View style={styles.planStats}>
                  <View style={styles.stat}>
                    <Ionicons name="fitness" size={16} color={colors.gray[400]} />
                    <Text style={styles.statText}>
                      {getTotalExercises(plan)} exercises
                    </Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="flash" size={16} color={colors.gray[400]} />
                    <Text style={styles.statText}>
                      {getTotalEnergyPoints(plan)} energy points
                    </Text>
                  </View>
                </View>


              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    marginLeft: spacing.xs,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  loadingText: {
    color: colors.gray[400],
    fontSize: typography.size.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.size.md,
    color: colors.gray[400],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  createFirstButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: 'bold',
  },
  plansContainer: {
    paddingVertical: spacing.lg,
  },
  planCard: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardPressable: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  planDate: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
  },

  planStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
  },

});
