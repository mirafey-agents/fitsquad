import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FilterableList from '../../components/FilterableList';
import { getExercises } from '@/utils/firebase';

interface Exercise {
  id: string;
  name: string;
  module_type: string;
  level: string;
  sets?: number;
  reps?: string;
  energy_points?: number;
  type?: string;
  goal?: string;
  goal_specific?: string;
  muscle_group?: string;
}

interface ExercisePickerProps {
  selectedExercises: Exercise[];
  onDone: (exercises: Exercise[]) => void;
}

export default function ExercisePicker({
  selectedExercises,
  onDone,
}: ExercisePickerProps) {
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [localSelectedExercises, setLocalSelectedExercises] = useState<Exercise[]>(selectedExercises);

  useEffect(() => {
    fetchAvailableExercises();
  }, []);

  const fetchAvailableExercises = async () => {
    try {
      setLoading(true);
      const exercises = await getExercises();
      setAvailableExercises(exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseUpdate = useCallback((exerciseId: string, field: 'sets' | 'reps', value: string) => {
    const updatedExercises = localSelectedExercises.map(ex => 
      ex.id === exerciseId 
        ? { ...ex, [field]: value || "" }
        : ex
    );
    setLocalSelectedExercises(updatedExercises);
  }, [localSelectedExercises]);

  const handleExerciseSelection = useCallback((exercises: Exercise[]) => {
    setLocalSelectedExercises(exercises);
  }, []);

  const removeExercise = useCallback((exerciseId: string) => {
    const updatedExercises = localSelectedExercises.filter(ex => ex.id !== exerciseId);
    setLocalSelectedExercises(updatedExercises);
  }, [localSelectedExercises]);

  const handleDone = useCallback(() => {
    onDone(localSelectedExercises);
  }, [localSelectedExercises, onDone]);

  return (
    <View style={styles.container}>
      {/* Selected Exercises Section */}
      {localSelectedExercises.length > 0 && (
        <View style={styles.selectedSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Selected Exercises</Text>
            <Pressable style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.exercisesTable}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Exercise</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Reps</Text>
              <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Sets</Text>
              <View style={{ width: 20 }} />
            </View>
            <ScrollView style={styles.tableScrollView} showsVerticalScrollIndicator={false}>
              {localSelectedExercises.map(exercise => (
                <View key={exercise.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{exercise.name}</Text>
                  <TextInput
                    style={[styles.tableCell, styles.numberInput, { width: 80 }]}
                    value={exercise.reps?.toString() || ''}
                    onChangeText={(value) => handleExerciseUpdate(exercise.id, 'reps', value)}
                    placeholder="0"
                    placeholderTextColor="#64748B"
                  />
                  <TextInput
                    style={[styles.tableCell, styles.numberInput, { width: 80 }]}
                    value={exercise.sets?.toString() || ''}
                    onChangeText={(value) => handleExerciseUpdate(exercise.id, 'sets', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#64748B"
                  />
                  <Pressable onPress={() => removeExercise(exercise.id)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Exercise Selection Section */}
      <View style={styles.selectionSection}>
        <Text style={styles.sectionTitle}>Select Exercises</Text>
        <View style={styles.filterableListContainer}>
          <FilterableList
            tabKey="exercises"
            placeholder="Search exercises"
            items={availableExercises}
            selectedItems={localSelectedExercises}
            onSelectionChange={handleExerciseSelection}
            getItemId={(exercise) => exercise.id}
            getItemName={(exercise) => exercise.name}
            getItemDescription={(exercise) => exercise.module_type}
          />
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  selectedSection: {
    marginBottom: 24,
  },
  selectionSection: {
    flex: 1,
  },
  filterableListContainer: {
    maxHeight: 300, // Limit height to show ~5-6 rows
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  exercisesTable: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    maxHeight: 300, // Limit height to show ~5-6 rows
  },
  tableScrollView: {
    maxHeight: 240, // Leave space for header
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  numberInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  doneButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 