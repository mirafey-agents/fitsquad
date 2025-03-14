import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';

// Helper function to validate UUID
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export default function WorkoutPlanDetails() {
  const { id } = useLocalSearchParams();
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [assignedSquads, setAssignedSquads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string' && isValidUUID(id)) {
      fetchWorkoutPlanDetails();
    } else {
      setError('Invalid workout plan ID');
      setLoading(false);
    }
  }, [id]);

  const fetchWorkoutPlanDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch workout plan details
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          exercises:workout_plan_exercises(
            *,
            exercise:exercises(*)
          ),
          squads:squad_workout_plans(
            squad:squads(*)
          )
        `)
        .eq('id', id)
        .single();

      if (planError) throw planError;
      if (!plan) throw new Error('Workout plan not found');

      setWorkoutPlan(plan);
      setExercises(plan.exercises.map((e: any) => ({
        ...e.exercise,
        customSets: e.sets,
        customReps: e.reps,
        notes: e.notes
      })));
      setAssignedSquads(plan.squads.map((s: any) => s.squad));

    } catch (error: any) {
      console.error('Error fetching workout plan:', error);
      setError(error.message || 'Failed to load workout plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (typeof id === 'string' && isValidUUID(id)) {
      router.push(`./assign`, {relativeToDirectory: true});
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading workout plan details...</Text>
      </View>
    );
  }

  if (error || !workoutPlan) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.title}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Workout plan not found'}</Text>
          <Pressable style={styles.backToPlans} onPress={() => router.back()}>
            <Text style={styles.backToPlansText}>Back to Workout Plans</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Workout Plan Details</Text>
        <Pressable 
          style={styles.assignButton}
          onPress={handleAssign}
        >
          <Text style={styles.assignButtonText}>Assign</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{workoutPlan.name}</Text>
          <Text style={styles.planDescription}>{workoutPlan.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assigned Squads</Text>
          {assignedSquads.length > 0 ? (
            <View style={styles.assignedSquads}>
              {assignedSquads.map((squad, index) => (
                <Animated.View
                  key={squad.id}
                  entering={FadeInUp.delay(index * 100)}
                >
                  <BlurView intensity={80} style={styles.squadCard}>
                    <Text style={styles.squadName}>{squad.name}</Text>
                    <Text style={styles.squadDescription}>{squad.description}</Text>
                  </BlurView>
                </Animated.View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Not assigned to any squads yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {exercises.map((exercise, index) => (
            <Animated.View
              key={exercise.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <View style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseType}>
                      {exercise.module_type} • {exercise.level}
                    </Text>
                  </View>
                  <BlurView intensity={80} style={styles.energyBadge}>
                    <Ionicons name="flash" size={16} color="#FF9500" />
                    <Text style={styles.energyText}>{exercise.energy_points} pts</Text>
                  </BlurView>
                </View>

                <View style={styles.exerciseDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Sets</Text>
                    <Text style={styles.detailValue}>{exercise.customSets}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Reps</Text>
                    <Text style={styles.detailValue}>{exercise.customReps}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Weight (M/W)</Text>
                    <Text style={styles.detailValue}>
                      {exercise.men_weight}/{exercise.women_weight}kg
                    </Text>
                  </View>
                </View>

                {exercise.notes && (
                  <View style={styles.notes}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{exercise.notes}</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  assignButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  planHeader: {
    marginBottom: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  assignedSquads: {
    gap: 12,
  },
  squadCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
  },
  squadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  squadDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  exerciseType: {
    fontSize: 14,
    color: '#64748B',
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
  },
  energyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FF9500',
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  notes: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#1E293B',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backToPlans: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  backToPlansText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});