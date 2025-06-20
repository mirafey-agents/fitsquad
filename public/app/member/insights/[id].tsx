import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { useSessions } from '@/app/context/SessionsContext';
import { getMediaThumbnailURL, getProfilePicThumbNailURL } from '@/utils/mediaUtils';
import { getMediaFetchURL } from '@/utils/firebase';
import { LinearGradient } from 'expo-linear-gradient';

const renderFormattedText = (text: string) => {
  if (!text) return null;
  
  // Split by lines to handle bullet points
  const lines = text.split('\n');
  
  return lines.map((line, lineIndex) => {
    // Handle bullet points
    if (line.trim().startsWith('* ')) {
      return (
        <View key={lineIndex} style={styles.bulletPointContainer}>
          <Text style={styles.bulletPoint}>•</Text>
          <Text style={styles.reviewText}>
            {renderFormattedLine(line.slice(2))}
          </Text>
        </View>
      );
    }
    
    // Handle regular lines with bold formatting
    return (
      <Text key={lineIndex} style={styles.reviewText}>
        {renderFormattedLine(line)}
      </Text>
    );
  });
};

const renderFormattedLine = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={index} style={[styles.reviewText, styles.boldText]}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    return <Text key={index}>{part}</Text>;
  });
};

export default function WorkoutSessionDetails() {
  const { id } = useLocalSearchParams();
  const { sessions } = useSessions();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fullMediaUrl, setFullMediaUrl] = useState<string>('');

  useEffect(() => {
    const foundSession = sessions.find(s => s.id === id);
    if (foundSession) {
      const newSession = {
        id: foundSession.id,
        user_id: foundSession.user_id,
        session_id: foundSession.session_id,
        date: foundSession.start_time,
        trainer: {
          name: foundSession.session.trainer.display_name,
          image: getProfilePicThumbNailURL((foundSession.session.trainer as any).id),
          verified: true
        },
        type: 'workout',
        title: foundSession.session.title,
        performance_score: foundSession.performance_score,
        feedback: foundSession.trainer_comments,
        session_media: foundSession.session_media,
        session: {
          title: foundSession.session.title,
          time: foundSession.start_time,
          exercises: foundSession.exercises
        }
      };
      
      setSession(newSession);
      setLoading(false);
      console.log("newSession", newSession);
    }
    
  }, [id, sessions]);

  const renderStars = (score: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= score ? "star" : "star-outline"}
          size={16}
          color={i <= score ? colors.semantic.warning : colors.gray[300]}
        />
      );
    }
    return stars;
  };

  const handleMediaPress = async (media: any) => {
    try {
      setFullMediaUrl(''); // Reset URL to show loading indicator
      setSelectedMedia(media);
      setModalVisible(true);
      
      const url = await getMediaFetchURL(
        session.user_id, 
        'session', 
        session.session_id, 
        media.media_id,
        false // not thumbnail
      );
      setFullMediaUrl(url as string);
    } catch (error) {
      console.error('Error getting full media URL:', error);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedMedia(null);
    setFullMediaUrl('');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading session details...</Text>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Session not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.gray[200]} />
        </Pressable>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.trainerInfo}>
          <Image 
            source={{ uri: session.trainer.image }}
            style={styles.trainerImage}
          />
          <View>
            <View style={styles.trainerNameRow}>
              <Text style={styles.trainerName}>{session.trainer.name}</Text>
              {session.trainer.verified && (
                <BlurView intensity={80} style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.semantic.success} />
                </BlurView>
              )}
            </View>
            <Text style={styles.inputDate}>
              {new Date(session.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
        </View>

        <View style={styles.performance}>
          <Text style={styles.sectionTitle}>Performance Score</Text>
          <LinearGradient
            colors={[colors.gray[900], colors.gray[800]]}
            style={styles.card}
          >
            <View style={styles.starsContainer}>
              {renderStars(session.performance_score)}
            </View>
            <Text style={styles.performanceScore}>
              {session.performance_score}/5
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.feedback}>
          <Text style={styles.sectionTitle}>Trainer's Feedback</Text>
          <LinearGradient
            colors={[colors.gray[900], colors.gray[800]]}
            style={styles.textCard}
          >
            <View style={styles.feedbackTextContainer}>
              {renderFormattedText(session.feedback)}
            </View>
          </LinearGradient>
        </View>

        {session.session.exercises && session.session.exercises.length > 0 && (
          <View style={styles.session}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <LinearGradient
              colors={[colors.gray[900], colors.gray[800]]}
              style={styles.exerciseCard}
            >
              <View style={styles.exerciseList}>
                {session.session.exercises.map((exercise, i) => (
                  <View key={i} style={styles.exerciseItem}>
                    <Text style={styles.exerciseItemName}>{exercise.name}</Text>
                    <Text style={styles.exerciseItemDetails}>
                      {exercise.sets} × {exercise.reps}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>
        )}
  
        <View style={styles.exerciseFeedback}>
          {session.best_exercise && (
            <View style={styles.exerciseHighlight}>
              <BlurView intensity={80} style={[styles.exerciseBadge, styles.bestExercise]}>
                <Ionicons name="star" size={20} color={colors.semantic.success} />
                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseLabel}>Best Performance</Text>
                  <Text style={[styles.exerciseName, styles.bestExerciseText]}>
                    {session.best_exercise}
                  </Text>
                </View>
              </BlurView>
            </View>
          )}
          {session.needs_improvement && (
            <View style={styles.exerciseHighlight}>
              <BlurView intensity={80} style={[styles.exerciseBadge, styles.improvementExercise]}>
                <Ionicons name="fitness" size={20} color={colors.semantic.warning} />
                <View style={styles.exerciseContent}>
                  <Text style={styles.exerciseLabel}>Needs Improvement</Text>
                  <Text style={[styles.exerciseName, styles.improvementExerciseText]}>
                    {session.needs_improvement}
                  </Text>
                </View>
              </BlurView>
            </View>
          )}
        </View>

        {session.session_media && session.session_media.length > 0 && (
          <View style={styles.media}>
            <Text style={styles.sectionTitle}>Analysis</Text>
            <View style={styles.mediaGrid}>
              {session.session_media.map((media, index) => (
                <Pressable 
                  key={`media-${index}`}
                  style={styles.mediaGridItem} 
                  onPress={() => handleMediaPress(media)}
                >
                  <View style={styles.mediaImageContainer}>
                    <Image 
                      source={{ uri: getMediaThumbnailURL(session.user_id, 'session', session.session_id, media.media_id) }}
                      style={styles.mediaGridImage}
                    />
                    <View style={styles.videoIconOverlay}>
                      <Ionicons name="analytics" size={24} color="white" />
                      <Text style={styles.videoIconText}>Analyse</Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Media Modal */}
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Media Analysis</Text>
                <Pressable style={styles.closeButton} onPress={closeModal}>
                  <Ionicons name="close" size={24} color={colors.gray[200]} />
                </Pressable>
              </View>
              
              <ScrollView style={styles.modalBody}>
                {selectedMedia && (
                  <>
                    <View style={styles.modalMediaContainer}>
                      {fullMediaUrl ? (
                        selectedMedia.content_type?.startsWith('video/') ? (
                          <video
                            src={fullMediaUrl}
                            controls
                            autoPlay
                            muted
                            playsInline
                            style={{width: '100%', height: '100%'}}
                          />
                        ) : (
                          <Image
                            source={{ uri: fullMediaUrl }}
                            style={styles.modalImage}
                            resizeMode="contain"
                          />
                        )
                      ) : (
                        <View style={styles.loadingContainer}>
                           <Text>Loading Media...</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.modalAnalysisContainer}>
                      <Text style={styles.modalAnalysisTitle}>Analysis</Text>
                      <View>
                        {renderFormattedText(selectedMedia?.review)}
                      </View>
                    </View>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    paddingTop: spacing.md,
    backgroundColor: colors.gray[800],
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  trainerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  trainerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  trainerName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
  },
  verifiedBadge: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success + '20',
  },
  inputDate: {
    fontSize: typography.size.md,
    color: colors.gray[400],
  },
  performance: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
    marginBottom: spacing.md,
  },
  performanceContent: {
    // This style is now unused, can be removed but leaving for safety
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  textCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    width: '100%',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  performanceScore: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
    color: colors.gray[200],
  },
  feedback: {
    marginBottom: spacing.xl,
  },
  feedbackTextContainer: {
    flex: 1,
    width: '100%',
  },
  feedbackText: {
    fontSize: typography.size.md,
    color: colors.gray[200],
    lineHeight: typography.lineHeight.relaxed,
  },
  exerciseFeedback: {
    marginBottom: spacing.xl,
  },
  exerciseHighlight: {
    marginBottom: spacing.md,
  },
  exerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  bestExercise: {
    backgroundColor: colors.semantic.success + '20',
  },
  improvementExercise: {
    backgroundColor: colors.semantic.warning + '20',
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
    marginBottom: spacing.xs,
  },
  exerciseName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
  },
  bestExerciseText: {
    color: colors.semantic.success,
  },
  improvementExerciseText: {
    color: colors.semantic.warning,
  },
  media: {
    marginBottom: spacing.xl,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mediaGridItem: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: spacing.md,
  },
  mediaImageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  mediaGridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#334155',
  },
  session: {
    marginBottom: spacing.xl,
  },
  sessionTime: {
    fontSize: typography.size.md,
    color: colors.gray[400],
    marginBottom: spacing.md,
  },
  exerciseCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  exerciseList: {
    gap: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[700],
  },
  exerciseItemName: {
    fontSize: typography.size.md,
    color: colors.gray[200],
  },
  exerciseItemDetails: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  reviewContainer: {
    padding: spacing.md,
  },
  reviewText: {
    color: colors.gray[200],
    fontSize: typography.size.md,
    lineHeight: 24,
    fontWeight: typography.weight.regular as any,
    letterSpacing: 0.3,
  },
  boldText: {
    fontWeight: typography.weight.bold as any,
  },
  bulletPointContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
    paddingLeft: spacing.sm,
  },
  bulletPoint: {
    color: colors.gray[200],
    fontSize: typography.size.md,
    marginRight: spacing.sm,
  },
  playButtonOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  videoIconText: {
    color: 'white',
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.primary.dark,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[700],
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
  },
  closeButton: {
    padding: spacing.sm,
  },
  modalBody: {
    flex: 1,
    padding: spacing.md,
  },
  modalMediaContainer: {
    width: '100%',
    height: 300,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.gray[800],
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.md,
  },
  modalAnalysisContainer: {
    flex: 1,
  },
  modalAnalysisTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
    marginBottom: spacing.md,
  },
  modalAnalysisText: {
    color: colors.gray[200],
    fontSize: typography.size.md,
    lineHeight: 24,
    fontWeight: typography.weight.regular as any,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 