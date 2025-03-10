import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../utils/supabase';

// Update the SESSION_DATA constant to use a valid UUID
const SESSION_DATA = {
  id: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
  title: 'Morning HIIT',
  time: '06:30 AM',
  trainer: 'Sarah Chen',
  participants: [
    {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Mike Ross',
      attendance: 'pending',
      performance: null,
      comments: '',
      bestExercise: null,
      needsImprovement: null,
      media: []
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Alex Wong',
      attendance: 'pending',
      performance: null,
      comments: '',
      bestExercise: null,
      needsImprovement: null,
      media: []
    }
  ],
  exercises: [
    {
      id: 1,
      name: 'Burpees',
      sets: 3,
      reps: 15
    },
    {
      id: 2,
      name: 'Mountain Climbers',
      sets: 3,
      reps: 30
    },
    {
      id: 3,
      name: 'Jump Squats',
      sets: 4,
      reps: 20
    }
  ]
};

export default function WorkoutSession() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState(SESSION_DATA);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id as string)) {
      setError('Invalid session ID format');
      return;
    }

    // Fetch session data
    fetchSessionData();
  }, [id]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('workouts')
        .select(`
          *,
          participants:workout_participants(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (data) {
        setSession(prev => ({
          ...prev,
          ...data,
          participants: data.participants || prev.participants
        }));
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      setError('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendance = (participantId: string, status: 'present' | 'absent') => {
    setSession(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId ? { ...p, attendance: status } : p
      )
    }));
  };

  const handlePerformance = (participantId: string, rating: number) => {
    setSession(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId ? { ...p, performance: rating } : p
      )
    }));
  };

  const handleComments = (participantId: string, comments: string) => {
    setSession(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId ? { ...p, comments } : p
      )
    }));
  };

  const handleExerciseSelection = (participantId: string, exerciseId: string, type: 'best' | 'improvement') => {
    setSession(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId 
          ? { 
              ...p, 
              bestExercise: type === 'best' ? exerciseId : p.bestExercise,
              needsImprovement: type === 'improvement' ? exerciseId : p.needsImprovement
            } 
          : p
      )
    }));
  };

  const handleMediaCapture = async (participantId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSession(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.id === participantId 
              ? { ...p, media: [...p.media, result.assets[0].uri] }
              : p
          )
        }));
      }
    } catch (error) {
      console.error('Error capturing media:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id as string)) {
        throw new Error('Invalid session ID format');
      }

      // Save session data to Supabase
      const { error: saveError } = await supabase
        .from('workout_participants')
        .upsert(session.participants.map(p => ({
          workout_id: id,
          user_id: p.id,
          attendance_status: p.attendance,
          performance_score: p.performance,
          trainer_comments: p.comments,
          best_exercise: p.bestExercise,
          needs_improvement: p.needsImprovement,
          media_urls: p.media
        })));

      if (saveError) throw saveError;
      
      Alert.alert(
        'Success',
        'Session data saved successfully',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error) {
      console.error('Error saving session:', error);
      setError(error.message || 'Failed to save session data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Session Details</Text>
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

      <ScrollView style={styles.content}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionTime}>{session.time}</Text>
          <Text style={styles.sessionTrainer}>Trainer: {session.trainer}</Text>
        </View>

        <View style={styles.instructionsCard}>
          <Ionicons name="information-circle" size={24} color="#4F46E5" />
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsTitle}>How to use this page:</Text>
            <Text style={styles.instructionsText}>
              1. Mark each participant as present or absent
            </Text>
            <Text style={styles.instructionsText}>
              2. Tap on a participant's card to provide detailed feedback
            </Text>
            <Text style={styles.instructionsText}>
              3. Rate performance, add comments, and select best/improvement exercises
            </Text>
            <Text style={styles.instructionsText}>
              4. Click Save when you're done with all participants
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          {session.participants.map((participant, index) => (
            <Animated.View
              key={participant.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <Pressable 
                style={[
                  styles.participantCard,
                  selectedParticipant?.id === participant.id && styles.selectedCard
                ]}
                onPress={() => setSelectedParticipant(participant)}
              >
                <View style={styles.participantHeader}>
                  <View style={styles.participantInfo}>
                    <Text style={styles.participantName}>{participant.name}</Text>
                    {selectedParticipant?.id !== participant.id && (
                      <Text style={styles.tapToRateText}>
                        Tap to provide detailed feedback
                      </Text>
                    )}
                  </View>
                  <View style={styles.attendanceButtons}>
                    <Pressable
                      style={[
                        styles.attendanceButton,
                        participant.attendance === 'present' && styles.presentButton
                      ]}
                      onPress={() => handleAttendance(participant.id, 'present')}
                    >
                      <Ionicons 
                        name={participant.attendance === 'present' ? "checkmark-circle" : "checkmark-circle-outline"} 
                        size={18} 
                        color={participant.attendance === 'present' ? "#FFFFFF" : "#22C55E"} 
                      />
                      <Text style={[
                        styles.attendanceButtonText,
                        participant.attendance === 'present' && styles.attendanceButtonTextActive
                      ]}>Present</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.attendanceButton,
                        participant.attendance === 'absent' && styles.absentButton
                      ]}
                      onPress={() => handleAttendance(participant.id, 'absent')}
                    >
                      <Ionicons 
                        name={participant.attendance === 'absent' ? "close-circle" : "close-circle-outline"} 
                        size={18} 
                        color={participant.attendance === 'absent' ? "#FFFFFF" : "#EF4444"} 
                      />
                      <Text style={[
                        styles.attendanceButtonText,
                        participant.attendance === 'absent' && styles.attendanceButtonTextActive
                      ]}>Absent</Text>
                    </Pressable>
                  </View>
                </View>

                {selectedParticipant?.id === participant.id && (
                  <View style={styles.participantDetails}>
                    <View style={styles.ratingSection}>
                      <Text style={styles.ratingLabel}>Performance Rating</Text>
                      <View style={styles.ratingButtons}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Pressable
                            key={rating}
                            style={[
                              styles.ratingButton,
                              participant.performance === rating && styles.selectedRating
                            ]}
                            onPress={() => handlePerformance(participant.id, rating)}
                          >
                            <Text style={[
                              styles.ratingButtonText,
                              participant.performance === rating && styles.selectedRatingText
                            ]}>
                              {rating}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    <View style={styles.commentsSection}>
                      <Text style={styles.commentsLabel}>Trainer Comments</Text>
                      <TextInput
                        style={styles.commentsInput}
                        multiline
                        numberOfLines={4}
                        value={participant.comments}
                        onChangeText={(text) => handleComments(participant.id, text)}
                        placeholder="Add your comments here..."
                        placeholderTextColor="#64748B"
                      />
                    </View>

                    <View style={styles.exerciseSection}>
                      <Text style={styles.exerciseLabel}>Best Exercise</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.exerciseList}
                      >
                        {session.exercises.map((exercise) => (
                          <Pressable
                            key={exercise.id}
                            style={[
                              styles.exerciseButton,
                              participant.bestExercise === exercise.id && styles.selectedExercise
                            ]}
                            onPress={() => handleExerciseSelection(participant.id, exercise.id, 'best')}
                          >
                            <Text style={[
                              styles.exerciseButtonText,
                              participant.bestExercise === exercise.id && styles.selectedExerciseText
                            ]}>
                              {exercise.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>

                      <Text style={styles.exerciseLabel}>Needs Improvement</Text>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.exerciseList}
                      >
                        {session.exercises.map((exercise) => (
                          <Pressable
                            key={exercise.id}
                            style={[
                              styles.exerciseButton,
                              participant.needsImprovement === exercise.id && styles.selectedImprovement
                            ]}
                            onPress={() => handleExerciseSelection(participant.id, exercise.id, 'improvement')}
                          >
                            <Text style={[
                              styles.exerciseButtonText,
                              participant.needsImprovement === exercise.id && styles.selectedExerciseText
                            ]}>
                              {exercise.name}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>

                    <View style={styles.mediaSection}>
                      <View style={styles.mediaHeader}>
                        <Text style={styles.mediaLabel}>Media</Text>
                        <Pressable
                          style={styles.captureButton}
                          onPress={() => handleMediaCapture(participant.id)}
                        >
                          <Ionicons name="camera" size={20} color="#4F46E5" />
                          <Text style={styles.captureButtonText}>Capture</Text>
                        </Pressable>
                      </View>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.mediaList}
                      >
                        {participant.media.length > 0 ? (
                          participant.media.map((uri, index) => (
                            <Image
                              key={index}
                              source={{ uri }}
                              style={styles.mediaPreview}
                            />
                          ))
                        ) : (
                          <View style={styles.emptyMedia}>
                            <Ionicons name="images-outline" size={24} color="#64748B" />
                            <Text style={styles.emptyMediaText}>No media added</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Pressable 
          style={styles.saveSessionButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Ionicons name="save" size={20} color="#FFFFFF" />
          <Text style={styles.saveSessionText}>
            {loading ? 'Saving...' : 'Save Session Data'}
          </Text>
        </Pressable>
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
  content: {
    padding: 20,
  },
  sessionInfo: {
    marginBottom: 24,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  sessionTrainer: {
    fontSize: 16,
    color: '#64748B',
  },
  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F0FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  instructionsContent: {
    flex: 1,
    marginLeft: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 4,
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
  participantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedCard: {
    borderColor: '#4F46E5',
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  tapToRateText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#4F46E5',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  presentButton: {
    backgroundColor: '#22C55E',
  },
  absentButton: {
    backgroundColor: '#EF4444',
  },
  attendanceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1E293B',
  },
  attendanceButtonTextActive: {
    color: '#FFFFFF',
  },
  participantDetails: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 16,
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRating: {
    backgroundColor: '#4F46E5',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedRatingText: {
    color: '#FFFFFF',
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  commentsInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#1E293B',
  },
  exerciseSection: {
    marginBottom: 16,
  },
  exerciseLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  exerciseList: {
    marginBottom: 16,
  },
  exerciseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  selectedExercise: {
    backgroundColor: '#4F46E5',
  },
  selectedImprovement: {
    backgroundColor: '#EF4444',
  },
  exerciseButtonText: {
    fontSize: 14,
    color: '#1E293B',
  },
  selectedExerciseText: {
    color: '#FFFFFF',
  },
  mediaSection: {
    marginBottom: 16,
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0FF',
    borderRadius: 20,
  },
  captureButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  mediaList: {
    marginTop: 8,
  },
  mediaPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  emptyMedia: {
    width: 160,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMediaText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  saveSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 40,
    gap: 8,
  },
  saveSessionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});