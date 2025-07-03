import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getExercisesByModuleType, Exercise } from '@/utils/firebase/exercises';
import { createSessionUser } from '@/utils/firebase/sessions';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function AddSession() {
  const [sportsExercises, setSportsExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);

  useEffect(() => {
    loadSportsExercises();
  }, []);

  const loadSportsExercises = async () => {
    try {
      const exercises = await getExercisesByModuleType("Sports");
      console.log(exercises);
      setSportsExercises(exercises);
    } catch (error) {
      console.error('Error loading sports exercises:', error);
      Alert.alert('Error', 'Failed to load sports activities');
    }
  };

  const handleAddSession = async () => {
    if (!selectedExercise || !duration) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await createSessionUser(
        [{
          id: selectedExercise.id,
          name: selectedExercise.name,
          reps: duration,
          energy_points: selectedExercise.energy_points
        }],
        startDateTime // exercises array
      );
        
      alert('Session created successfully');
      // Reset form
      setSelectedExercise(null);
      setStartDateTime(new Date());
      setDuration('');
      router.back();

    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Log your workout</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        
        <View style={styles.content}>
          {/* Activity Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose Activity</Text>
            <TouchableOpacity 
              style={styles.pickerContainer}
              onPress={() => setShowExerciseModal(true)}
            >
              <Text style={styles.pickerText}>
                {selectedExercise ? selectedExercise.name : 'select activity...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Exercise Selection Modal */}
          <Modal
            visible={showExerciseModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowExerciseModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Activity</Text>
                  <TouchableOpacity onPress={() => setShowExerciseModal(false)}>
                    <Ionicons name="close" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalScrollView}>
                  {sportsExercises.map((exercise) => (
                    <TouchableOpacity
                      key={exercise.id}
                      style={styles.exerciseItem}
                      onPress={() => {
                        setSelectedExercise(exercise);
                        setShowExerciseModal(false);
                      }}
                    >
                      <Text style={styles.exerciseItemText}>{exercise.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Start Date & Time */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Start Date & Time</Text>
            <View style={styles.datePickerContainer}>
              <input
                type="datetime-local"
                value={startDateTime.toLocaleString('sv', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  setStartDateTime(date);
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

          {/* Duration */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter duration in minutes"
              placeholderTextColor="#666"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>

          {/* Add Button */}
          <TouchableOpacity 
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddSession}
            disabled={loading}
          >
            <LinearGradient
              colors={['#4F46E5', '#4F46E5']}
              style={styles.buttonGradient}
            >
              <Text style={styles.addButtonText}>
                {loading ? 'Creating...' : 'Add Session'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060712",
  },
  scrollView: {
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
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: "#FFFFFF",
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: "#21262F",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3C4148",
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerText: {
    color: "#FFFFFF",
    fontSize: 16,
    flex: 1,
  },
  datePickerContainer: {
    marginBottom: 16,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: "#21262F",
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3C4148",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  modalScrollView: {
    maxHeight: 400,
  },
  exerciseItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#3C4148",
  },
  exerciseItemText: {
    color: "#FFFFFF",
    fontSize: 16,
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
  addButton: {
    marginTop: 24,
    borderRadius: 20,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: '600',
  },
}); 