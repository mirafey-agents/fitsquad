import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

interface Session {
  id: string;
  title: string;
  time: string;
  participants: Array<{
    id: string;
    name: string;
    attendance: string;
    performance: number;
    comments: string;
    bestExercise: string | null;
    needsImprovement: string | null;
    media: string[];
  }>;
  exercises: Array<{
    id: string;
    name: string;
    sets: number;
    reps: string;
  }>;
}

export default function SessionDetails() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState<Session>({
    id: id as string,
    title: 'Morning HIIT',
    time: '06:30 AM',
    participants: [
      {
        id: '1',
        name: 'Sarah Chen',
        attendance: 'present',
        performance: 95,
        comments: 'Excellent form and energy throughout the session.',
        bestExercise: 'Burpees',
        needsImprovement: 'Mountain Climbers',
        media: [
          'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=800&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=800&auto=format&fit=crop'
        ]
      },
      {
        id: '2',
        name: 'Mike Ross',
        attendance: 'present',
        performance: 88,
        comments: 'Good effort, needs to work on pacing.',
        bestExercise: 'Jump Squats',
        needsImprovement: 'Burpees',
        media: [
          'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=800&auto=format&fit=crop'
        ]
      }
    ],
    exercises: [
      {
        id: '1',
        name: 'Burpees',
        sets: 3,
        reps: '15'
      },
      {
        id: '2',
        name: 'Mountain Climbers',
        sets: 3,
        reps: '30'
      },
      {
        id: '3',
        name: 'Jump Squats',
        sets: 4,
        reps: '20'
      }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

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

  const pickImage = async (participantId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
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
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const updateParticipant = (participantId: string, updates: Partial<Session['participants'][0]>) => {
    setSession(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId 
          ? { ...p, ...updates }
          : p
      )
    }));
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

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          <Text style={styles.sessionTime}>{session.time}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {session.exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDetails}>
                {exercise.sets} × {exercise.reps}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants</Text>
          {session.participants.map((participant, index) => (
            <Animated.View
              key={participant.id}
              entering={FadeInUp.delay(index * 100)}
              style={styles.participantCard}
            >
              <View style={styles.participantHeader}>
                <Text style={styles.participantName}>{participant.name}</Text>
                <BlurView intensity={80} style={styles.attendanceBadge}>
                  <Text style={styles.attendanceText}>
                    {participant.attendance === 'present' ? 'Present' : 'Absent'}
                  </Text>
                </BlurView>
              </View>

              <View style={styles.performanceSection}>
                <Text style={styles.performanceLabel}>Performance Score</Text>
                <TextInput
                  style={styles.performanceInput}
                  value={participant.performance.toString()}
                  onChangeText={(text) => {
                    const score = parseInt(text) || 0;
                    updateParticipant(participant.id, { performance: score });
                  }}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>

              <View style={styles.feedbackSection}>
                <Text style={styles.feedbackLabel}>Trainer Comments</Text>
                <TextInput
                  style={styles.feedbackInput}
                  value={participant.comments}
                  onChangeText={(text) => updateParticipant(participant.id, { comments: text })}
                  multiline
                  numberOfLines={3}
                  placeholder="Add your feedback..."
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={styles.exerciseFeedback}>
                <View style={styles.exerciseField}>
                  <Text style={styles.exerciseFieldLabel}>Best Exercise</Text>
                  <TextInput
                    style={styles.exerciseInput}
                    value={participant.bestExercise}
                    onChangeText={(text) => updateParticipant(participant.id, { bestExercise: text })}
                    placeholder="Best performed exercise"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.exerciseField}>
                  <Text style={styles.exerciseFieldLabel}>Needs Improvement</Text>
                  <TextInput
                    style={styles.exerciseInput}
                    value={participant.needsImprovement}
                    onChangeText={(text) => updateParticipant(participant.id, { needsImprovement: text })}
                    placeholder="Exercise to improve"
                    placeholderTextColor="#64748B"
                  />
                </View>
              </View>

              <View style={styles.mediaSection}>
                <View style={styles.mediaSectionHeader}>
                  <Text style={styles.mediaLabel}>Media</Text>
                  <Pressable 
                    style={styles.addMediaButton}
                    onPress={() => pickImage(participant.id)}
                  >
                    <Ionicons name="camera" size={20} color="#4F46E5" />
                    <Text style={styles.addMediaText}>Add Photo</Text>
                  </Pressable>
                </View>

                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.mediaScroll}
                >
                  {participant.media.map((url, index) => (
                    <View key={index} style={styles.mediaPreview}>
                      <Image source={{ uri: url }} style={styles.mediaImage} />
                      <Pressable 
                        style={styles.removeMediaButton}
                        onPress={() => {
                          setSession(prev => ({
                            ...prev,
                            participants: prev.participants.map(p => 
                              p.id === participant.id 
                                ? { ...p, media: p.media.filter((_, i) => i !== index) }
                                : p
                            )
                          }));
                        }}
                      >
                        <Ionicons name="close-circle" size={24} color="#EF4444" />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
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
  sessionInfo: {
    marginBottom: 24,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  sessionTime: {
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
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#64748B',
  },
  participantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  participantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  participantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  attendanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#22C55E',
  },
  performanceSection: {
    marginBottom: 16,
  },
  performanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  performanceInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feedbackSection: {
    marginBottom: 16,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 100,
    textAlignVertical: 'top',
  },
  exerciseFeedback: {
    marginBottom: 16,
  },
  exerciseField: {
    marginBottom: 12,
  },
  exerciseFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  exerciseInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mediaSection: {
    marginTop: 16,
  },
  mediaSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0FF',
    borderRadius: 20,
  },
  addMediaText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  mediaScroll: {
    marginHorizontal: -8,
  },
  mediaPreview: {
    position: 'relative',
    marginHorizontal: 8,
  },
  mediaImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
});