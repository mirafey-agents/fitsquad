import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing } from '@/constants/theme';
import { getWorkoutPlans, deleteWorkoutPlan, WorkoutPlan } from '@/utils/firebase/workoutPlans';
import ConfirmModal from '@/components/ConfirmModal';

export default function ViewWorkoutPlan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkoutPlan();
    }
  }, [id]);

  const loadWorkoutPlan = async () => {
    try {
      setLoading(true);
      const plan = (await getWorkoutPlans([id]))[0];
      if (plan) {
        setWorkoutPlan(plan);
      } else {
        Alert.alert('Error', 'Workout plan not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading workout plan:', error);
      Alert.alert('Error', 'Failed to load workout plan');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!workoutPlan) return;

    try {
      await deleteWorkoutPlan(workoutPlan.id);
      alert('Workout plan deleted successfully');
      router.push('/trainer/workout_plans');
    } catch (error) {
      console.error('Error deleting workout plan:', error);
      Alert.alert('Error', 'Failed to delete workout plan');
    }
  };

  const getTotalEnergyPoints = () => {
    if (!workoutPlan) return 0;
    return workoutPlan.exercises.reduce((total, exercise) => total + exercise.energy_points, 0);
  };

  const formatDate = (seconds: number) => {
    return new Date(seconds * 1000).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading workout plan...</Text>
      </View>
    );
  }

  if (!workoutPlan) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Workout plan not found</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>{workoutPlan.name}</Text>
          <Pressable
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Ionicons name="trash" size={24} color="#FF3B30" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.planStats}>
          <View style={styles.stat}>
            <Ionicons name="fitness" size={20} color="#4A90E2" />
            <Text style={styles.statText}>{workoutPlan.exercises.length} Exercises</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="flash" size={20} color="#FF9500" />
            <Text style={styles.statText}>{getTotalEnergyPoints()} Energy Points</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="calendar" size={20} color="#34C759" />
            <Text style={styles.statText}>{formatDate(workoutPlan.created_at._seconds)}</Text>
          </View>
        </View>

        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {workoutPlan.exercises.map((exercise, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(index * 100)}
              style={styles.exerciseCard}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} sets × {exercise.reps} reps • {exercise.module_type}
                </Text>
                <Text style={styles.exerciseType}>
                  {exercise.type} • {exercise.energy_points} energy points
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      {showDeleteModal && (
        <ConfirmModal
          displayText={`Are you sure you want to delete "${workoutPlan.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#060712',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.gray[400],
    fontSize: typography.size.lg,
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
  title: {
    fontSize: typography.size.xl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  planStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#21262F',
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.lg,
  },
  stat: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
    textAlign: 'center',
  },
  exercisesSection: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  exerciseCard: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.size.md,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  exerciseDetails: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
    marginBottom: spacing.xs,
  },
  exerciseType: {
    fontSize: typography.size.sm,
    color: '#4A90E2',
  },
}); 