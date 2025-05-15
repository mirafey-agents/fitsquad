import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, Alert, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { deleteMedia, deleteSession, getTrainerSessions, listMedia, updateSession, uploadMedia } from '@/utils/firebase';
import ConfirmModal from '@/components/ConfirmModal';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';

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
    media: Array<{
      mediaId: string;
      thumbnail_url: string;
    }>;
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

const StarRating = ({ value, onValueChange }: { value: number, onValueChange: (value: number) => void }) => {
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Pressable
          key={i}
          onPress={() => onValueChange(i)}
          style={styles.starButton}
        >
          <Ionicons
            key={i}
            name={i <= value ? "star" : "star-outline"}
            size={16}
            color={i <= value ? colors.semantic.warning : colors.gray[300]}
        />
        </Pressable>
      );
    }
    return stars;
  };

  return (
    <View style={styles.starRatingContainer}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      <Text style={styles.ratingValue}>{value}/5</Text>
    </View>
  );
};

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
    console.log('Fetched sessions:', sessions);
    const session = sessions[0];
    session.exercises = session.session_users[0].exercises;
    // await setSession(session);
    await Promise.all(session.session_users.map(async (participant) => {
      const media = await listMedia(participant.user_id, 'session', session.id) as string[];
      participant.media = media;
    }));
    await setSession(session);
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
  
  const pickUploadMedia = async (participantId: string) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        await uploadMedia(result.assets[0], participantId, 'session', id as string);
        router.replace('./', {relativeToDirectory: true});
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
                <View style={styles.participantInfo}>
                  <View style={styles.participantAvatar}>
                    <View style={styles.initialsContainer}>
                        <Text style={styles.participantInitials}>
                          {participant.users.display_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </Text>
                    </View>
                    <View style={styles.avatarContainer}>
                      <Image 
                        source={{ uri: `https://storage.googleapis.com/fit-squad-club.firebasestorage.app/media/${participant.users.id}/profilepic/1/1-thumbnail` }}
                        style={styles.avatarImage}
                      />
                    </View>
                  </View>
                  <Text style={styles.participantName}>{participant.users.display_name}</Text>
                </View>
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
                    <StarRating
                      value={participant.performance_score || 0}
                      onValueChange={(score) => {
                        updateParticipant(participant.id, { performance_score: score });
                      }}
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
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.mediaScroll}
                      >
                        {participant.media?.length > 0 && participant.media.map((mediaObj, index) => (
                          <View key={index} style={styles.mediaPreview}>
                            <View style={styles.mediaPlaceholder}>
                              <Image 
                                source={{ uri: mediaObj.thumbnail_url }}
                                style={{ width: 80, height: 80 }}
                              />
                            </View>
                            <Pressable 
                              style={styles.removeMediaButton}
                              onPress={() => {
                                deleteMedia(participant.user_id, 'session', session.id, mediaObj.mediaId);
                                router.replace('./', {relativeToDirectory: true});
                              }}
                            >
                              <Ionicons name="close-circle" size={20} color="#EF4444" />
                            </Pressable>
                          </View>
                        ))}
                      </ScrollView>
                      <Pressable 
                        style={styles.addMediaButton}
                        onPress={() => pickUploadMedia(participant.users.id)}
                      >
                        <Ionicons name="camera" size={20} color="#4F46E5" />
                        <Text style={styles.addMediaText}>Add</Text>
                      </Pressable>
                    </View>
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
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
  },
  participantInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
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
    paddingTop: 8,
    paddingBottom: 8,
  },
  mediaPreview: {
    position: 'relative',
    marginHorizontal: 8,
    width: 80,
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'visible',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeMediaButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
    zIndex: 1,
  },
  starRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
    marginLeft: spacing.md,
  },
  starIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  mediaPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPlaceholderText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});