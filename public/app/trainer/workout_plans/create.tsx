import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing } from '@/constants/theme';
import { getExercises, Exercise } from '@/utils/firebase/exercises';
import { createWorkoutPlan } from '@/utils/firebase/workoutPlans';
import FilterableList from '@/app/trainer/components/FilterableList';

interface SelectedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  module_type: string;
  type: string;
  goal: string;
  goal_specific: string;
  energy_points: number;
}

export default function CreateWorkoutPlan() {
  const [planName, setPlanName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercisesForModal, setSelectedExercisesForModal] = useState<Exercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const allExercises = await getExercises();
      setExercises(allExercises);
    } catch (error) {
      console.error('Error loading exercises:', error);
      Alert.alert('Error', 'Failed to load exercises');
    }
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    try {
      setLoading(true);
      await createWorkoutPlan({
        name: planName,
        exercises: selectedExercises,
      });
      alert('Workout plan created successfully');
      router.back();
    } catch (error) {
      console.error('Error creating workout plan:', error);
      Alert.alert('Error', 'Failed to create workout plan');
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Create Workout</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.planDetails}>
          <Text style={styles.sectionTitle}>Plan Details</Text>
          <TextInput
            style={styles.nameInput}
            placeholder="Enter plan name"
            placeholderTextColor={colors.gray[400]}
            value={planName}
            onChangeText={setPlanName}
          />
        </View>

        <View style={styles.exercisesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => setShowExerciseModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {selectedExercises.map((exercise, index) => (
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
              </View>
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveExercise(index)}
              >
                <Ionicons name="trash" size={20} color={colors.semantic.error} />
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Pressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Creating...' : 'Create Workout Plan'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Modal
        visible={showExerciseModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setShowExerciseModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.modalTitle}>Select Exercises</Text>
            <View style={styles.placeholder} />
          </View>

          <FilterableList
            tabKey="exercises"
            placeholder="Search exercises..."
            items={exercises}
            selectedItems={selectedExercisesForModal}
            onSelectionChange={setSelectedExercisesForModal}
            getItemId={(exercise) => exercise.id}
            getItemName={(exercise) => exercise.name}
            getItemDescription={(exercise) => `${exercise.module_type} • ${exercise.muscle_group}`}
            showSetsRepsModal={true}
            onExerciseConfigured={(exercise, sets, reps) => {
              const newExercise: SelectedExercise = {
                id: exercise.id,
                name: exercise.name,
                sets: sets,
                reps: reps,
                module_type: exercise.module_type,
                type: exercise.type,
                goal: exercise.goal || '',
                goal_specific: exercise.goal_specific || '',
                energy_points: exercise.energy_points,
              };
              setSelectedExercises([...selectedExercises, newExercise]);
              // Also add to selectedExercisesForModal to show the green tick
              setSelectedExercisesForModal([...selectedExercisesForModal, exercise]);
            }}
          />
        </View>
      </Modal>
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
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  planDetails: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  nameInput: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3C4148',
  },
  exercisesSection: {
    marginVertical: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  exerciseCard: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  removeButton: {
    padding: spacing.xs,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: typography.size.lg,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#060712',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#3C4148',
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 