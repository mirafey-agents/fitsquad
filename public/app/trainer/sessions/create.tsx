import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSquads, getMembers, getExercises, createSessionTrainer } from '@/utils/firebase';
import { getWorkoutPlans } from '@/utils/firebase/workoutPlans';
import FilterableList from '../components/FilterableList';

interface Squad {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface Exercise {
  id: string;
  name: string;
  module_type: string;
  type: string;
  level: string;
  sets?: number;
  reps?: string;
  energy_points?: number;
}

interface WorkoutPlan {
  id: string;
  name: string;
  exercises: Exercise[];
  created_at: { _seconds: number };
}

export default function CreateSession() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    selectedSquads: [] as Squad[],
    selectedUsers: [] as User[],
    selectedExercises: [] as Exercise[],
    workoutPlanId: null as string | null,
    isAdhoc: false,
  });
  const [squads, setSquads] = useState<Squad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState<Exercise | null>(null);
  const [activeTab, setActiveTab] = useState<'squads' | 'members'>('squads');
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  const totalSteps = 5;

  // Function to reset all state variables to initial values
  const resetAllState = () => {
    setCurrentStep(1);
    setFormData({
      title: '',
      date: new Date(),
      selectedSquads: [],
      selectedUsers: [],
      selectedExercises: [],
      workoutPlanId: null,
      isAdhoc: false,
    });
    setShowAddExerciseModal(false);
    setEditingExercise(null);
    setNewExercise(null);
    setActiveTab('squads');
    setShowExerciseDropdown(false);
    setFilteredExercises([]);
  };

  useEffect(() => {
    resetAllState(); // Reset state when component mounts
    fetchSquads();
    fetchUsers();
    fetchExercises();
    fetchWorkoutPlans();
  }, []);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      const { data } = await getSquads(null);
      setSquads(data as Squad[]);
    } catch (error) {
      console.error('Error fetching squads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const {data} = await getMembers(null);
      setUsers(data as User[] || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await getExercises();
      setExercises(data as Exercise[] || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true);
      const data = await getWorkoutPlans();
      setWorkoutPlans(data as WorkoutPlan[] || []);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Session title is required');
      return;
    }

    if (formData.selectedSquads.length === 0 && formData.selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one squad or user');
      return;
    }

    if (formData.selectedExercises.length === 0) {
      Alert.alert('Error', 'Please select at least one exercise');
      return;
    }

    try {
      setLoading(true);
      const result = await createSessionTrainer({
        title: formData.title,
        startTime: formData.date.toISOString(),
        squadId: formData.selectedSquads?.[0]?.id || null,
        userIds: formData.selectedUsers.map(u => u.id),
        exercises: formData.selectedExercises
      });
      if (!result.data || !(result.data as any).success) {
        throw new Error('Failed to create session');
      }
      
      alert('Session created successfully');
      resetAllState(); // Reset all state variables
      router.back();
    } catch (error) {
      console.log('Error creating session:', error);
      alert('Some error occurred while creating the session');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = () => {
    if (!newExercise.name.trim() || !newExercise.sets || !newExercise.reps) {
      alert('Please fill in all fields');
      return;
    }

    const exercise: Exercise = {
      id: newExercise.id, // Temporary ID for new exercises
      name: newExercise.name,
      module_type: newExercise.module_type,
      type: newExercise.type,
      level: newExercise.level,
      sets: newExercise.sets,
      reps: newExercise.reps,
      energy_points: newExercise.energy_points,
    };

    setFormData(prev => ({
      ...prev,
      selectedExercises: [...prev.selectedExercises, exercise]
    }));

    setNewExercise(null);
    setShowAddExerciseModal(false);
    setShowExerciseDropdown(false);
    setFilteredExercises([]);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setNewExercise({
      name: exercise.name,
      sets: exercise.sets || 0,
      reps: exercise.reps || '',
      energy_points: exercise.energy_points || 0,
      type: exercise.type || '',
      module_type: exercise.module_type || '',
      level: exercise.level || '',
      id: exercise.id,
    });
  };

  const handleSaveEdit = () => {
    if (!editingExercise || !newExercise.name.trim() || !newExercise.sets || !newExercise.reps) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.map(ex => 
        ex.id === editingExercise.id 
          ? { 
              ...ex, 
              name: newExercise.name,
              sets: newExercise.sets,
              reps: newExercise.reps
            }
          : ex
      )
    }));

    setEditingExercise(null);
    setNewExercise(null);
    setShowExerciseDropdown(false);
    setFilteredExercises([]);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.filter(e => e.id !== exerciseId)
    }));
  };

  const handleWorkoutPlanSelect = (plan: WorkoutPlan) => {
    const mappedExercises = plan.exercises.map(ex => ({
      id: ex.id,
      name: ex.name,
      module_type: ex.module_type,
      type: ex.type,
      level: ex.level,
      sets: ex.sets,
      reps: ex.reps,
      energy_points: ex.energy_points,
    }));
    
    setFormData(prev => ({
      ...prev,
      workoutPlanId: plan.id,
      isAdhoc: false,
      selectedExercises: mappedExercises
    }));
  };

  const filterExercises = (query: string) => {
    if (!query.trim()) {
      setFilteredExercises([]);
      return;
    }
    
    const filtered = exercises.filter(exercise =>
      exercise.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExercises(filtered);
  };

  const handleExerciseNameChange = (text: string) => {
    setNewExercise(prev => ({ ...prev, name: text }));
    filterExercises(text);
    setShowExerciseDropdown(true);
  };

  const handleExerciseNameFocus = () => {
    if (newExercise?.name.trim()) {
      filterExercises(newExercise.name);
      setShowExerciseDropdown(true);
    } else {
      // Show recent exercises when focusing on empty input
      setFilteredExercises(exercises.slice(0, 3));
      setShowExerciseDropdown(true);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Session Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Session Title"
        value={formData.title}
        onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
        placeholderTextColor="#64748B"
      />
      <View style={styles.datePickerContainer}>
        <input
          type="datetime-local"
          value={formData.date.toLocaleString('sv', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T')}
          onChange={(e) => {
            const date = new Date(e.target.value);
            setFormData(prev => ({ ...prev, date }));
          }}
          style={{
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #21262F',
            fontSize: '16px',
            color: '#FFFFFF',
            backgroundColor: '#21262F',
          }}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Participants</Text>
      <View style={styles.tabContainer}>
        <View style={styles.tabHeader}>
          <Pressable 
            style={[styles.tab, activeTab === 'squads' && styles.tabActive]}
            onPress={() => setActiveTab('squads')}
          >
            <Ionicons name="people" size={20} color={activeTab === 'squads' ? "#4F46E5" : "#64748B"} />
            <Text style={[styles.tabText, activeTab === 'squads' && styles.tabTextActive]}>Squads</Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, activeTab === 'members' && styles.tabActive]}
            onPress={() => setActiveTab('members')}
          >
            <Ionicons name="person" size={20} color={activeTab === 'members' ? "#4F46E5" : "#64748B"} />
            <Text style={[styles.tabText, activeTab === 'members' && styles.tabTextActive]}>Members</Text>
          </Pressable>
        </View>
        
        {activeTab === 'squads' ? (
          <FilterableList
            tabKey="squads"
            placeholder="Search squads"
            items={squads}
            selectedItems={formData.selectedSquads}
            onSelectionChange={(selectedSquads) => setFormData(prev => ({ ...prev, selectedSquads }))}
            getItemId={(squad) => squad.id}
            getItemName={(squad) => squad.name}
            getItemDescription={(squad) => squad.description}
          />
        ) : (
          <FilterableList
            tabKey="members"
            placeholder="Search members"
            items={users}
            selectedItems={formData.selectedUsers}
            onSelectionChange={(selectedUsers) => setFormData(prev => ({ ...prev, selectedUsers }))}
            getItemId={(user) => user.id}
            getItemName={(user) => user.display_name}
            getItemDescription={(user) => user.email}
          />
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Workout Plan</Text>
      <View style={styles.tabContainer}>
        <View style={styles.tabHeader}>
          <Pressable 
            style={[styles.tab, !formData.isAdhoc && styles.tabActive]}
            onPress={() => setFormData(prev => ({ ...prev, isAdhoc: false, workoutPlanId: null }))}
          >
            <Ionicons name="list" size={20} color={!formData.isAdhoc ? "#4F46E5" : "#64748B"} />
            <Text style={[styles.tabText, !formData.isAdhoc && styles.tabTextActive]}>My Plans</Text>
          </Pressable>
          <Pressable 
            style={[styles.tab, formData.isAdhoc && styles.tabActive]}
            onPress={() => setFormData(prev => ({ ...prev, isAdhoc: true, workoutPlanId: null }))}
          >
            <Ionicons name="add-circle" size={20} color={formData.isAdhoc ? "#4F46E5" : "#64748B"} />
            <Text style={[styles.tabText, formData.isAdhoc && styles.tabTextActive]}>Custom</Text>
          </Pressable>
        </View>
        
        {!formData.isAdhoc ? (
          <View style={styles.workoutPlansList}>
            {workoutPlans.map((plan) => (
              <Pressable
                key={plan.id}
                style={[
                  styles.workoutPlanCard,
                  formData.workoutPlanId === plan.id && styles.selectedWorkoutPlan
                ]}
                onPress={() => handleWorkoutPlanSelect(plan)}
              >
                <View style={styles.workoutPlanInfo}>
                  <Text style={styles.workoutPlanName}>{plan.name}</Text>
                  <Text style={styles.workoutPlanDate}>
                    Created {new Date(plan.created_at._seconds * 1000).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                  <View style={styles.workoutPlanStats}>
                    <View style={styles.stat}>
                      <Ionicons name="fitness" size={16} color="#4A90E2" />
                      <Text style={styles.statText}>{plan.exercises.length} Exercises</Text>
                    </View>
                    <View style={styles.stat}>
                      <Ionicons name="flash" size={16} color="#FF9500" />
                      <Text style={styles.statText}>
                        {plan.exercises.reduce((total, ex) => total + ex.energy_points, 0)} Energy Points
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={24} 
                  color={formData.workoutPlanId === plan.id ? "#4F46E5" : "#64748B"} 
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.adhocContainer}>
            <Text style={styles.adhocText}>You'll be able to add exercises in the next step</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderStep4 = () => {
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Review Exercises</Text>
        <View style={styles.exercisesHeader}>
          <Pressable 
            style={styles.addExerciseButton}
            onPress={() => setShowAddExerciseModal(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addExerciseText}>Add Exercise</Text>
          </Pressable>
        </View>
        
        {formData.selectedExercises.length > 0 ? (
        <View style={styles.exercisesList}>
          {formData.selectedExercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets || 0} × {exercise.reps || 0}
                </Text>
              </View>
              <Pressable 
                style={styles.editButton}
                onPress={() => handleEditExercise(exercise)}
              >
                <Ionicons name="create" size={20} color="#64748B" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyExercises}>
          <Text style={styles.emptyExercisesText}>No exercises added yet</Text>
          <Text style={styles.emptyExercisesSubtext}>Tap "Add Exercise" to get started</Text>
        </View>
      )}
    </View>
    );
  };

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Review</Text>
      
      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Session Details</Text>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Title:</Text>
          <Text style={styles.reviewValue}>{formData.title}</Text>
        </View>
        <View style={styles.reviewItem}>
          <Text style={styles.reviewLabel}>Date & Time:</Text>
          <Text style={styles.reviewValue}>
            {formData.date.toLocaleDateString('en-IN', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Participants</Text>
        {formData.selectedSquads.map(squad => (
          <View key={squad.id} style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Squad:</Text>
            <Text style={styles.reviewValue}>{squad.name}</Text>
          </View>
        ))}
        {formData.selectedUsers.map(user => (
          <View key={user.id} style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>Member:</Text>
            <Text style={styles.reviewValue}>{user.display_name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewSectionTitle}>Exercises</Text>
        {formData.selectedExercises.map((exercise, index) => (
          <View key={exercise.id} style={styles.reviewItem}>
            <Text style={styles.reviewLabel}>{index + 1}.</Text>
            <Text style={styles.reviewValue}>
              {exercise.name} ({exercise.sets || 0} × {exercise.reps || 0})
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.title.trim().length > 0;
      case 2: return formData.selectedSquads.length > 0 || formData.selectedUsers.length > 0;
      case 3: return formData.workoutPlanId || formData.isAdhoc;
      case 4: return formData.selectedExercises.length > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
      
      <View style={[styles.header, loading && styles.disabled]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>Create Session</Text>
        <View style={{ width: 80 }} />
      </View>



      <ScrollView style={[styles.content, loading && styles.disabled]}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 ? (
          <Pressable style={styles.backButtonFooter} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : (
          <View style={{ width: 100 }} />
        )}
        
        {currentStep < totalSteps ? (
          <Pressable 
            style={[styles.nextButton, !canProceed() && styles.disabledButton]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable 
            style={styles.createButton}
            onPress={handleCreate}
            disabled={!canProceed()}
          >
            <Text style={styles.createButtonText}>Create Session</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add</Text>
              <Pressable onPress={() => {
                setShowAddExerciseModal(false);
                setShowExerciseDropdown(false);
                setFilteredExercises([]);
              }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Type exercise name..."
              value={newExercise?.name || ''}
              onChangeText={handleExerciseNameChange}
              onFocus={handleExerciseNameFocus}
              placeholderTextColor="#64748B"
            />
            
            {showExerciseDropdown && filteredExercises.length > 0 && (
              <View style={styles.dropdownList}>
                {filteredExercises.slice(0, 3).map((exercise) => (
                  <Pressable
                    key={exercise.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setNewExercise(exercise);
                      setShowExerciseDropdown(false);
                      setFilteredExercises([]);
                    }}
                    android_ripple={{ color: '#4F46E5' }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.dropdownItemText}>{exercise.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf]}
                placeholder="Sets"
                value={newExercise?.sets?.toString() || ''}
                onChangeText={(text) => setNewExercise(prev => ({ ...prev, sets: parseInt(text) }))}
                keyboardType="numeric"
                placeholderTextColor="#64748B"
              />
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf]}
                placeholder="Reps"
                value={newExercise?.reps || ''}
                onChangeText={(text) => setNewExercise(prev => ({ ...prev, reps: text }))}
                placeholderTextColor="#64748B"
              />
            </View>
            <Pressable style={styles.modalButton} onPress={handleAddExercise}>
              <Text style={styles.modalButtonText}>Add</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Edit Exercise Modal */}
      {editingExercise && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Exercise</Text>
              <Pressable onPress={() => {
                setEditingExercise(null);
                setShowExerciseDropdown(false);
                setFilteredExercises([]);
              }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </Pressable>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Type exercise name..."
              value={newExercise.name}
              onChangeText={handleExerciseNameChange}
              onFocus={handleExerciseNameFocus}
              placeholderTextColor="#64748B"
            />
            
            {showExerciseDropdown && filteredExercises.length > 0 && (
              <View style={styles.dropdownList}>
                {filteredExercises.slice(0, 3).map((exercise) => (
                  <Pressable
                    key={exercise.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setNewExercise(prev => ({ ...prev, name: exercise.name }));
                      setShowExerciseDropdown(false);
                      setFilteredExercises([]);
                    }}
                    android_ripple={{ color: '#4F46E5' }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.dropdownItemText}>{exercise.name}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <View style={styles.modalRow}>
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf]}
                placeholder="Sets"
                value={newExercise.sets.toString()}
                onChangeText={(text) => setNewExercise(prev => ({ ...prev, sets: parseInt(text) }))}
                keyboardType="numeric"
                placeholderTextColor="#64748B"
              />
              <TextInput
                style={[styles.modalInput, styles.modalInputHalf]}
                placeholder="Reps"
                value={newExercise.reps}
                onChangeText={(text) => setNewExercise(prev => ({ ...prev, reps: text }))}
                placeholderTextColor="#64748B"
              />
            </View>
            <View style={styles.modalButtonRow}>
              <Pressable 
                style={styles.deleteButton}
                onPress={() => {
                  handleDeleteExercise(editingExercise.id);
                  setEditingExercise(null);
                }}
              >
                <Ionicons name="trash" size={20} color="#FFFFFF" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={handleSaveEdit}>
                <Text style={styles.modalButtonText}>Save</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060712",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#060712",
    borderBottomWidth: 1,
    borderBottomColor: "#21262F",
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: "#FFFFFF",
  },

  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: "#FFFFFF",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#21262F",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#3C4148",
    marginBottom: 12,
  },
  datePickerContainer: {
    marginBottom: 16,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  tabContainer: {
    backgroundColor: "#21262F",
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: "#3C4148",
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#4F46E5",
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: "#64748B",
  },
  tabTextActive: {
    color: "#4F46E5",
  },
  workoutPlansList: {
    padding: 16,
  },
  workoutPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#374151",
  },
  selectedWorkoutPlan: {
    borderColor: "#4F46E5",
  },
  workoutPlanInfo: {
    flex: 1,
  },
  workoutPlanName: {
    fontSize: 18,
    fontWeight: '600',
    color: "#FFFFFF",
    marginBottom: 4,
  },
  workoutPlanDate: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  workoutPlanStats: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: "#64748B",
  },
  adhocContainer: {
    padding: 32,
    alignItems: 'center',
  },
  adhocText: {
    fontSize: 16,
    color: "#64748B",
    textAlign: 'center',
  },
  exercisesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exercisesSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
  },
  addExerciseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: '600',
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: "#FFFFFF",
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: "#64748B",
  },
  editButton: {
    padding: 8,
  },
  emptyExercises: {
    padding: 32,
    alignItems: 'center',
  },
  emptyExercisesText: {
    fontSize: 18,
    color: "#64748B",
    marginBottom: 8,
  },
  emptyExercisesSubtext: {
    fontSize: 14,
    color: "#64748B",
    textAlign: 'center',
  },
  reviewSection: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: "#FFFFFF",
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  reviewLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: '500',
  },
  reviewValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#060712",
    borderTopWidth: 1,
    borderTopColor: "#21262F",
  },
  backButtonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  modalInput: {
    backgroundColor: "#374151",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#4B5563",
    marginBottom: 12,
  },
  dropdownList: {
    backgroundColor: "#374151",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4B5563",
    marginBottom: 12,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#4B5563",
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: "#374151",
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  modalInputHalf: {
    flex: 1,
    marginHorizontal: 4,
    minWidth: 0, // Prevent overflow
  },
  modalRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    width: '100%',
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: "#EF4444",
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
}); 