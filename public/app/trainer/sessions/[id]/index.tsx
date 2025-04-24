import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, Alert, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { deleteSession, getTrainerSessions, updateSession } from '@/utils/firebase';
import ConfirmModal from '@/components/ConfirmModal';

const dateFormatOption = {
  weekday: 'short', month: 'short', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: true
};

interface Session {
  id: string;
  title: string;
  start_time: string;
  session_users: Array<{
    id: string;
    user_id: string;
    users:{
      id: string;
      display_name: string;
      email: string;
    }
    status: string;
    performance_score: number;
    trainer_comments: string;
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
  status: string;
}

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function SessionDetails() {
  const { id } = useLocalSearchParams();
  const [session, setSession] = useState<Session>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchSession();
    }
  }, [id]);
  const fetchSession = async () => {
    const sessions = await getTrainerSessions(null, null, id as string, true);
    console.log(sessions);
    const session = sessions[0];
    session.exercises = session.session_users[0].exercises;
    setSession(sessions[0]);
  }
  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      for (const participant of session.session_users) {
        participant.status = (session.status == 'completed') ?
          ((participant.status == 'completed') ? participant.status : 'absent') : session.status;
      }
      const {data} = await updateSession(id as string, session.status, session.session_users);
      alert('Session Saved!');
      router.back();
    } catch (error) {
      console.error('Error saving session:', error);
      setError(error.message || 'Failed to save session data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const {data} = await deleteSession(id as string);
      if (!data?.success) {
        throw new Error('Failed to delete session');
      }
      alert('Session deleted.');
      router.back();
    } catch (error) {
      console.error('Error deleting session:', error);
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
          session_users: prev.session_users.map(p => 
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

  const updateParticipant = (participantId: string, updates: Partial<Session['session_users'][0]>) => {
    setSession(prev => ({
      ...prev,
      session_users: prev.session_users.map(p => 
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{session?.title}</Text>
          <Text style={styles.headerTime}>{new Date(session?.start_time).toLocaleString('en-US', dateFormatOption)}</Text>
        </View>
        <View style={styles.headerButtons}>
          <Pressable 
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSave}
            disabled={loading}
          >
            <Ionicons name="save-outline" size={20} color="#FFFFFF" />
          </Pressable>
          <Pressable 
            style={[styles.saveButton, loading && styles.disabledButton, { backgroundColor: '#EF4444' }]}
            onPress={() => setShowDeleteModal(true)}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {showDeleteModal && (
        <ConfirmModal
          displayText="Are you sure you want to delete this session? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        <View style={styles.sessionInfo}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusOptions}>
              {STATUS_OPTIONS.map((option) => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.statusOption,
                    session?.status === option.value && option.value === 'cancelled' 
                      ? styles.statusOptionCancelledActive 
                      : session?.status === option.value 
                        ? styles.statusOptionActive 
                        : null
                  ]}
                  onPress={() => setSession(prev => ({ ...prev, status: option.value }))}
                >
                  <Text style={[
                    styles.statusOptionText,
                    session?.status === option.value && styles.statusOptionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercises</Text>
          {session?.exercises.map((exercise, index) => (
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
          {session?.session_users?.map((participant, index) => (
            <Animated.View
              key={participant.users.id}
              entering={FadeInUp.delay(index * 100)}
              style={styles.participantCard}
            >
              <View style={styles.participantHeader}>
                <Text style={styles.participantName}>{participant.users.display_name}</Text>
                <View style={styles.attendanceContainer}>
                  <Text style={[
                    styles.attendanceText,
                    { color: participant.status === 'completed' ? '#22C55E' : '#DC2626' }
                  ]}>
                    {participant.status === 'completed' ? 'Present' : 'Absent'}
                  </Text>
                  <Switch
                    value={participant.status === 'completed'}
                    onValueChange={(value) => {
                      updateParticipant(participant.id, {
                        status: value ? 'completed' : 'absent'
                      });
                    }}
                    trackColor={{ false: '#DC2626', true: '#22C55E' }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {participant.status === 'completed' && (
                <>
                  <View style={styles.performanceSection}>
                    <Text style={styles.performanceLabel}>Performance Score</Text>
                    <TextInput
                      style={styles.performanceInput}
                      value={participant.performance_score?.toString()}
                      onChangeText={(text) => {
                        const score = parseInt(text) || 0;
                        updateParticipant(participant.id, { performance_score: score });
                      }}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>

                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackLabel}>Trainer Comments</Text>
                    <TextInput
                      style={styles.feedbackInput}
                      value={participant?.trainer_comments}
                      onChangeText={(text) => updateParticipant(participant.id, { trainer_comments: text })}
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
                        value={participant?.bestExercise}
                        onChangeText={(text) => updateParticipant(participant.id, { bestExercise: text })}
                        placeholder="Best performed exercise"
                        placeholderTextColor="#64748B"
                      />
                    </View>

                    <View style={styles.exerciseField}>
                      <Text style={styles.exerciseFieldLabel}>Needs Improvement</Text>
                      <TextInput
                        style={styles.exerciseInput}
                        value={participant?.needsImprovement}
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
                      {participant.media?.map((url, index) => (
                        <View key={index} style={styles.mediaPreview}>
                          <Image source={{ uri: url }} style={styles.mediaImage} />
                          <Pressable 
                            style={styles.removeMediaButton}
                            onPress={() => {
                              setSession(prev => ({
                                ...prev,
                                participants: prev.session_users.map(p => 
                                  p.id === participant.user_id 
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
                </>
              )}
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
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  headerTime: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#6366F1',
    borderRadius: 6,
    marginLeft: 8,
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
  statusContainer: {
    marginVertical: 16,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusOptionActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  statusOptionCancelled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  statusOptionTextActive: {
    color: '#FFFFFF',
  },
  statusOptionCancelledActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
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
  attendanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attendanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
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