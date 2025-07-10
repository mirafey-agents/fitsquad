import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { useSessions } from '@/app/context/SessionsContext';
import { getMediaThumbnailURL, getProfilePicThumbNailURL } from '@/utils/mediaUtils';
import { getMediaFetchURL } from '@/utils/firebase';

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
      const trainer = {name: null, image: null, verified: false};
      if (foundSession.session?.trainer) {
        trainer.name = foundSession.session?.trainer.display_name;
        trainer.image = getProfilePicThumbNailURL((foundSession.session?.trainer as any).id);
        trainer.verified = true;
      }
      const newSession = {
        id: foundSession.id,
        user_id: foundSession.user_id,
        session_trainers_id: foundSession.session_trainers_id,
        date: foundSession.start_time,
        trainer: trainer,
        type: 'workout',
        title: foundSession.session?.title || foundSession.exercises[0]?.name,
        performance_score: foundSession.performance_score,
        feedback: foundSession.trainer_comments,
        session_media: foundSession.session_media,
        start_time: foundSession.start_time,
        exercises: foundSession.exercises,
        status: foundSession.status,
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
        session.session_trainers_id, 
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
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Pressable style={styles.backButton} onPress={() => router.replace('/member/insights')}>
          <Ionicons name="arrow-back" size={24} color={colors.gray[200]} />
        </Pressable>
        <Text style={styles.headerTitleSmall}>Workout Insights</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Add more vertical space below title */}
        <View style={{ marginBottom: 16, alignItems: 'center' }}>
          <Text style={[styles.sessionSubtitle, { textAlign: 'center' }]}>{session.title || 'Complex Movements'}</Text>
          <Text style={[styles.sessionDate, { textAlign: 'center' }]}> 
            {new Date(session.date).toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: '2-digit',
            })} at {new Date(session.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} with {session.trainer.name || 'Trainer'}
          </Text>
          <View style={styles.completedBadgeRow}>
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>{session.status ? session.status.charAt(0).toUpperCase() + session.status.slice(1) : 'Completed'}</Text>
            </View>
          </View>
        </View>
        {/* Session Type Badges */}
        <View style={styles.sessionTypeRow}>
          <View style={[styles.sessionTypeBadge, { backgroundColor: '#1DCB6B20' }]}> {/* Green */}
            <Ionicons name="barbell" size={20} color="#1DCB6B" />
          </View>
          <View style={[styles.sessionTypeBadge, { backgroundColor: '#FFD60020' }]}> {/* Yellow */}
            <Text style={styles.sessionTypeBadgeTextYellow}>2</Text>
          </View>
          <View style={[styles.sessionTypeBadge, { backgroundColor: '#A259FF20' }]}> {/* Purple */}
            <Ionicons name="body" size={20} color="#A259FF" />
          </View>
          <View style={[styles.sessionTypeBadge, { backgroundColor: '#00C2FF20' }]}> {/* Blue */}
            <Ionicons name="flash" size={20} color="#00C2FF" />
          </View>
        </View>
        {/* Performance Score */}
        <View style={styles.performanceScoreSection}>
          <Text style={styles.sectionTitle}>Performance Score</Text>
          <View style={styles.performanceScoreBar}>
            <View style={styles.starsContainerBig}>
              {renderStars(session.performance_score)}
            </View>
            <Text style={styles.performanceScoreText}>{session.performance_score}/5</Text>
          </View>
        </View>
        {/* Trainer's Feedback */}
        <View style={styles.feedbackSection}>
          <Text style={styles.sectionTitle}>Trainer's Feedback</Text>
          <View style={styles.feedbackCard}>
            <Text style={styles.feedbackTextBig}>{session.feedback}</Text>
          </View>
        </View>
        {/* Exercises Section */}
        {session.exercises && session.exercises.length > 0 && (
          <View style={styles.exercisesSection}>
            <Text style={styles.sectionTitle}>Exercises</Text>
            <View style={styles.exerciseCardGrid}>
              {session.exercises.map((exercise, i) => (
                <View key={i} style={styles.exerciseCardItem}>
                  <View style={styles.exerciseImagePlaceholder}>
                    <Ionicons name="barbell" size={24} color="#FFD600" />
                  </View>
                  <View style={styles.exerciseCardTextCol}>
                    <Text style={styles.exerciseCardName}>{exercise.name}</Text>
                    <Text style={styles.exerciseCardSetsReps}>{exercise.sets} x {exercise.reps}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        {/* Analysis Section */}
        {session.session_media && session.session_media.length > 0 && (
          <View style={styles.media}>
            <Text style={styles.sectionTitle}>Analysis</Text>
            <View style={{backgroundColor: '#22262F', borderRadius: 16, padding: 12, marginTop: 6}}>
              <View style={styles.mediaGrid}>
                {session.session_media.map((media, index) => (
                  <Pressable 
                    key={`media-${index}`}
                    style={styles.mediaGridItem} 
                    onPress={() => handleMediaPress(media)}
                  >
                    <View style={styles.mediaImageContainer}>
                      <Image 
                        source={{ uri: getMediaThumbnailURL(session.user_id, 'session', session.session_trainers_id, media.media_id) }}
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
          </View>
        )}
        {/* Media Modal (unchanged) */}
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
    backgroundColor: '#070713',
  },
  headerSection: {
    backgroundColor: '#070713',
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 0,
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  headerTitleBig: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 0,
    fontFamily: 'System',
  },
  headerTitleSmall: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    fontFamily: 'System',
  },
  sessionSubtitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  sessionDate: {
    fontSize: 13,
    color: '#B0B0B0',
    fontWeight: '400',
    marginBottom: 6,
    fontFamily: 'System',
  },
  completedBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 2,
  },
  completedBadge: {
    backgroundColor: '#14532D', // darker green
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  completedBadgeText: {
    color: '#A7F3D0', // light green text
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'System',
  },
  sessionTypeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: 8,
    gap: 16, // more horizontal gap
  },
  sessionTypeBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTypeBadgeTextYellow: {
    color: '#FFD600',
    fontWeight: '700',
    fontSize: 20,
    fontFamily: 'System',
  },
  performanceScoreSection: {
    marginBottom: spacing.xl,
  },
  performanceScoreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD60020',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 6,
    justifyContent: 'space-between',
  },
  starsContainerBig: {
    flexDirection: 'row',
    gap: 2,
  },
  performanceScoreText: {
    color: '#fff',
    fontWeight: '400', // less bold
    fontSize: 14, // smaller
    marginLeft: 8,
    fontFamily: 'System',
  },
  feedbackSection: {
    marginBottom: spacing.xl,
  },
  feedbackCard: {
    backgroundColor: '#22262F',
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
  },
  feedbackTextBig: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '400',
    fontFamily: 'System',
    lineHeight: 22,
  },
  exercisesSection: {
    marginBottom: spacing.xl,
  },
  exerciseCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#22262F',
    borderRadius: 16,
    padding: 12,
    marginTop: 6,
    justifyContent: 'space-between',
  },
  exerciseCardItem: {
    width: '47%',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 8,
    gap: 10,
    backgroundColor: 'transparent', // remove separate background
  },
  exerciseImagePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#23232A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  exerciseCardTextCol: {
    flex: 1,
  },
  exerciseCardName: {
    color: '#fff',
    fontWeight: '500', // less bold
    fontSize: 13, // smaller
    fontFamily: 'System',
    marginBottom: 2,
  },
  exerciseCardSetsReps: {
    color: '#B0B0B0', // light gray
    fontWeight: '400',
    fontSize: 11, // smaller
    fontFamily: 'System',
  },
  backButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.md, // slightly smaller
    fontWeight: '400', // not bold
    color: colors.gray[200],
    marginBottom: spacing.md,
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