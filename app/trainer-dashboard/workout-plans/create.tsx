import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../utils/supabase';

// Demo user UUID - using a fixed UUID for demo purposes
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

interface Exercise {
  id: number;
  name: string;
  module_type: string;
  level: string;
  men_weight: number | null;
  women_weight: number | null;
  reps: string;
  sets: number;
  energy_points: number;
}

interface SelectedExercise extends Exercise {
  customSets?: number;
  customReps?: string;
  notes?: string;
}

const EXERCISE_CATEGORIES = [
  'Kettlebell',
  'Body Weight',
  'Resistance Band',
  'Dumbbell',
  'Stretching',
  'Mobility',
  'Barbell',
  'Isometric',
  'Cardio',
  'Warm-up',
];

export default function CreateWorkoutPlan() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>([]);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDraft, setShowDraft] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, [selectedCategory]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase.from('exercises').select('*');
      
      if (selectedCategory) {
        query = query.eq('module_type', selectedCategory);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setExercises(data || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      setError('Failed to load exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) {
        return prev.filter(e => e.id !== exercise.id);
      } else {
        return [...prev, { 
          ...exercise,
          customSets: exercise.sets,
          customReps: exercise.reps,
          notes: ''
        }];
      }
    });
  };

  const updateExerciseDetails = (exerciseId: number, updates: Partial<SelectedExercise>) => {
    setSelectedExercises(prev => 
      prev.map(exercise => 
        exercise.id === exerciseId 
          ? { ...exercise, ...updates }
          : exercise
      )
    );
  };

  const handleSave = async () => {
    try {
      setError(null);

      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          name: planName,
          description: planDescription,
          created_by: DEMO_USER_ID
        })
        .select()
        .single();

      if (planError) throw planError;

      const exercisesData = selectedExercises.map((exercise, index) => ({
        workout_plan_id: plan.id,
        exercise_id: exercise.id,
        order: index + 1,
        sets: exercise.customSets,
        reps: exercise.customReps,
        notes: exercise.notes
      }));

      const { error: exercisesError } = await supabase
        .from('workout_plan_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      router.back();
    } catch (error: any) {
      console.error('Error saving workout plan:', error);
      setError(error.message || 'Failed to save workout plan. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Create Workout Plan</Text>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.draftButton}
            onPress={() => setShowDraft(!showDraft)}
          >
            <Ionicons name="list" size={20} color="#4F46E5" />
          </Pressable>
          <Pressable 
            style={[styles.saveButton, (!planName || selectedExercises.length === 0) && styles.disabledButton]}
            onPress={handleSave}
            disabled={!planName || selectedExercises.length === 0}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        <ScrollView style={styles.mainContent}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plan Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Plan Name"
              value={planName}
              onChangeText={setPlanName}
              placeholderTextColor="#64748B"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={planDescription}
              onChangeText={setPlanDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercise Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {EXERCISE_CATEGORIES.map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.selectedCategory
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text 
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.selectedCategoryText
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading exercises...</Text>
            ) : exercises.length === 0 ? (
              <Text style={styles.emptyText}>No exercises found</Text>
            ) : (
              exercises.map((exercise, index) => (
                <Animated.View
                  key={exercise.id}
                  entering={FadeInUp.delay(index * 100)}
                >
                  <Pressable
                    style={[
                      styles.exerciseCard,
                      selectedExercises.some(e => e.id === exercise.id) && styles.selectedExercise
                    ]}
                    onPress={() => toggleExercise(exercise)}
                  >
                    <View style={styles.exerciseHeader}>
                      <View>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseType}>{exercise.module_type} • {exercise.level}</Text>
                      </View>
                      {selectedExercises.some(e => e.id === exercise.id) && (
                        <BlurView intensity={80} style={styles.selectedBadge}>
                          <Ionicons name="checkmark" size={20} color="#22C55E" />
                        </BlurView>
                      )}
                    </View>

                    <View style={styles.exerciseDetails}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Sets</Text>
                        <Text style={styles.detailValue}>{exercise.sets}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Reps</Text>
                        <Text style={styles.detailValue}>{exercise.reps}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Weight (M/W)</Text>
                        <Text style={styles.detailValue}>
                          {exercise.men_weight}/{exercise.women_weight}kg
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Energy</Text>
                        <Text style={styles.detailValue}>{exercise.energy_points} pts</Text>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              ))
            )}
          </View>
        </ScrollView>

        {showDraft && (
          <Animated.View 
            entering={FadeInUp}
            style={styles.draftPanel}
          >
            <View style={styles.draftHeader}>
              <Text style={styles.draftTitle}>Draft Plan</Text>
              <Pressable onPress={() => setShowDraft(false)}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </Pressable>
            </View>
            <ScrollView style={styles.draftContent}>
              {selectedExercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.draftExercise}>
                  <Text style={styles.draftExerciseName}>
                    {index + 1}. {exercise.name}
                  </Text>
                  <View style={styles.draftExerciseInputs}>
                    <View style={styles.draftInputGroup}>
                      <Text style={styles.draftInputLabel}>Sets</Text>
                      <TextInput
                        style={styles.draftInput}
                        value={String(exercise.customSets)}
                        onChangeText={(text) => 
                          updateExerciseDetails(exercise.id, { 
                            customSets: parseInt(text) || exercise.sets 
                          })
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.draftInputGroup}>
                      <Text style={styles.draftInputLabel}>Reps</Text>
                      <TextInput
                        style={styles.draftInput}
                        value={exercise.customReps}
                        onChangeText={(text) => 
                          updateExerciseDetails(exercise.id, { customReps: text })
                        }
                      />
                    </View>
                  </View>
                  <TextInput
                    style={styles.draftNotes}
                    placeholder="Add notes..."
                    value={exercise.notes}
                    onChangeText={(text) => 
                      updateExerciseDetails(exercise.id, { notes: text })
                    }
                    multiline
                  />
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}
      </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  draftButton: {
    padding: 8,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoriesContainer: {
    paddingVertical: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedCategory: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  categoryText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedExercise: {
    borderColor: '#4F46E5',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
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
  draftPanel: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  draftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  draftTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  draftContent: {
    padding: 20,
  },
  draftExercise: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
  },
  draftExerciseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  draftExerciseInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  draftInputGroup: {
    flex: 1,
  },
  draftInputLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  draftInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  draftNotes: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 60,
    textAlignVertical: 'top',
  },
});