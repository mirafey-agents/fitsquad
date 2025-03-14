import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';

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
  section?: 'warmup' | 'module' | 'challenge' | 'cooldown';
  customSets?: number;
  customReps?: string;
  customMenWeight?: number;
  customWomenWeight?: number;
  notes?: string;
}

const SECTIONS = ['warmup', 'module', 'challenge', 'cooldown'] as const;

export default function CreateWorkoutPlan() {
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [currentSection, setCurrentSection] = useState<typeof SECTIONS[number]>('warmup');
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError('Failed to load exercises');
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
          section: currentSection,
          customSets: exercise.sets,
          customReps: exercise.reps,
          customMenWeight: exercise.men_weight,
          customWomenWeight: exercise.women_weight,
          notes: ''
        }];
      }
    });
  };

  const updateExerciseDetails = (exercise: Exercise) => {
    setSelectedExercises(prev => 
      prev.map(e => e.id === exercise.id ? exercise : e)
    );
    setEditingExercise(null);
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      setError('Please enter a plan name');
      return;
    }

    if (selectedExercises.length === 0) {
      setError('Please select at least one exercise');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .insert({
          name: planName,
          description: planDescription,
          created_by: '00000000-0000-0000-0000-000000000000'
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
        men_weight: exercise.customMenWeight,
        women_weight: exercise.customWomenWeight,
        notes: exercise.notes,
        section: exercise.section
      }));

      const { error: exercisesError } = await supabase
        .from('workout_plan_exercises')
        .insert(exercisesData);

      if (exercisesError) throw exercisesError;

      Alert.alert('Success', 'Workout plan created successfully');
      router.back();
    } catch (error: any) {
      console.error('Error saving workout plan:', error);
      setError(error.message || 'Failed to save workout plan');
    } finally {
      setLoading(false);
    }
  };

  const getExercisesBySection = (section: typeof SECTIONS[number]) => {
    return selectedExercises.filter(e => e.section === section);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Create Workout Plan</Text>
        <Pressable 
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
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
          <Text style={styles.sectionTitle}>Sections</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.sectionsContainer}
          >
            {SECTIONS.map((section) => (
              <Pressable
                key={section}
                style={[
                  styles.sectionButton,
                  currentSection === section && styles.selectedSection
                ]}
                onPress={() => setCurrentSection(section)}
              >
                <Text style={[
                  styles.sectionButtonText,
                  currentSection === section && styles.selectedSectionText
                ]}>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                  {' '}
                  ({getExercisesBySection(section).length})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Exercises</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {['Kettlebell', 'Body Weight', 'Resistance Band', 'Dumbbell', 'Stretching', 'Mobility'].map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}>
                  {category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

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
                      <Text style={styles.exerciseType}>
                        {exercise.module_type} • {exercise.level}
                      </Text>
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
                      <Text style={styles.detailLabel}>Energy</Text>
                      <Text style={styles.detailValue}>{exercise.energy_points} pts</Text>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))
          )}
        </View>

        {selectedExercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Exercises</Text>
            {SECTIONS.map(section => (
              <View key={section}>
                <Text style={styles.subsectionTitle}>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </Text>
                {getExercisesBySection(section).map((exercise, index) => (
                  <Animated.View
                    key={exercise.id}
                    entering={FadeInUp.delay(index * 100)}
                  >
                    <Pressable 
                      style={styles.selectedExerciseCard}
                      onPress={() => setEditingExercise(exercise)}
                    >
                      <View style={styles.selectedExerciseHeader}>
                        <Text style={styles.selectedExerciseName}>{exercise.name}</Text>
                        <Pressable
                          style={styles.removeButton}
                          onPress={() => toggleExercise(exercise)}
                        >
                          <Ionicons name="close" size={20} color="#EF4444" />
                        </Pressable>
                      </View>

                      <View style={styles.customizationSection}>
                        <View style={styles.customizationRow}>
                          <View style={styles.customizationField}>
                            <Text style={styles.fieldLabel}>Sets</Text>
                            <TextInput
                              style={styles.fieldInput}
                              value={String(exercise.customSets)}
                              onChangeText={(text) => {
                                const value = parseInt(text) || exercise.sets;
                                updateExerciseDetails({
                                  ...exercise,
                                  customSets: value
                                });
                              }}
                              keyboardType="numeric"
                              placeholder={String(exercise.sets)}
                            />
                          </View>
                          <View style={styles.customizationField}>
                            <Text style={styles.fieldLabel}>Reps</Text>
                            <TextInput
                              style={styles.fieldInput}
                              value={exercise.customReps}
                              onChangeText={(text) => {
                                updateExerciseDetails({
                                  ...exercise,
                                  customReps: text
                                });
                              }}
                              placeholder={exercise.reps}
                            />
                          </View>
                        </View>

                        <View style={styles.customizationRow}>
                          <View style={styles.customizationField}>
                            <Text style={styles.fieldLabel}>Men Weight (kg)</Text>
                            <TextInput
                              style={styles.fieldInput}
                              value={exercise.customMenWeight?.toString()}
                              onChangeText={(text) => {
                                const value = parseFloat(text) || exercise.men_weight;
                                updateExerciseDetails({
                                  ...exercise,
                                  customMenWeight: value
                                });
                              }}
                              keyboardType="numeric"
                              placeholder={exercise.men_weight?.toString()}
                            />
                          </View>
                          <View style={styles.customizationField}>
                            <Text style={styles.fieldLabel}>Women Weight (kg)</Text>
                            <TextInput
                              style={styles.fieldInput}
                              value={exercise.customWomenWeight?.toString()}
                              onChangeText={(text) => {
                                const value = parseFloat(text) || exercise.women_weight;
                                updateExerciseDetails({
                                  ...exercise,
                                  customWomenWeight: value
                                });
                              }}
                              keyboardType="numeric"
                              placeholder={exercise.women_weight?.toString()}
                            />
                          </View>
                        </View>

                        <View style={styles.notesField}>
                          <Text style={styles.fieldLabel}>Notes</Text>
                          <TextInput
                            style={[styles.fieldInput, styles.notesInput]}
                            value={exercise.notes}
                            onChangeText={(text) => {
                              updateExerciseDetails({
                                ...exercise,
                                notes: text
                              });
                            }}
                            multiline
                            numberOfLines={2}
                            placeholder="Add notes for this exercise..."
                          />
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
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
    margin: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 12,
    marginBottom: 8,
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
  sectionsContainer: {
    marginBottom: 16,
  },
  sectionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  selectedSection: {
    backgroundColor: '#4F46E5',
  },
  sectionButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedSectionText: {
    color: '#FFFFFF',
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#4F46E5',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748B',
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
  selectedExerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedExerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedExerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  removeButton: {
    padding: 4,
  },
  customizationSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  customizationRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  customizationField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 14,
    color: '#1E293B',
  },
  notesField: {
    marginTop: 8,
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});