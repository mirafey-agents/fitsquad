import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { useSessions } from '@/app/context/SessionsContext';

// Squad Insights Data
const SQUAD_INSIGHTS = {
  currentMonth: {
    attendance: 92,
    improvement: 7,
    totalWorkouts: 48,
    avgPerformance: 88,
    topPerformer: 'Sarah Chen',
    toughestExercises: [
      { name: 'Burpees', difficulty: 9.2, votes: 28 },
      { name: 'Pistol Squats', difficulty: 8.8, votes: 24 },
      { name: 'Muscle-ups', difficulty: 8.5, votes: 22 },
    ],
    memberHighlights: [
      {
        name: 'Sarah Chen',
        achievements: ['Most Improved', 'Perfect Attendance'],
        performance: 95,
      },
      {
        name: 'Mike Ross',
        achievements: ['High Intensity'],
        performance: 88,
      },
    ],
  },
};

export default function Analytics() {
  const { sessions, refreshSessions } = useSessions();
  const [selectedInput, setSelectedInput] = useState(null);
  const [activeTab, setActiveTab] = useState<'squad' | 'trainer'>('squad');
  const [trainerInputs, setTrainerInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    setLoading(true);
    refreshSessions();
    setLoading(false);
  }, []);

  useEffect(() => {
    getTrainerInputsFromSessions().then(inputs => {
      console.log('inputs: ', inputs);
      setTrainerInputs(inputs);
    });
  }, [sessions]);

  const getTrainerInputsFromSessions = async () => {
    return sessions.map(session => ({
      id: session.id,
      date: session.start_time,
      trainer: {
        name: session.session.trainer.display_name,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop',
        verified: true
      },
      type: 'workout',
      title: session.session.title,
      performance_score: session.performance_score,
      feedback: session.trainer_comments,
      media: [],
      session: {
        title: session.session.title,
        time: session.start_time,
        exercises: session.exercises
      }
    }));
  };

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

  const renderSquadInsights = () => (
    <View style={styles.section}>
      <View style={styles.timeframeSelector}>
        <Pressable
          style={[styles.timeframeButton, timeframe === 'weekly' && styles.activeTimeframe]}
          onPress={() => setTimeframe('weekly')}
        >
          <Text style={[styles.timeframeText, timeframe === 'weekly' && styles.activeTimeframeText]}>
            Weekly
          </Text>
        </Pressable>
        <Pressable
          style={[styles.timeframeButton, timeframe === 'monthly' && styles.activeTimeframe]}
          onPress={() => setTimeframe('monthly')}
        >
          <Text style={[styles.timeframeText, timeframe === 'monthly' && styles.activeTimeframeText]}>
            Monthly
          </Text>
        </Pressable>
      </View>

      <View style={styles.overviewCards}>
        <Animated.View entering={FadeInUp.delay(100)} style={styles.overviewCard}>
          <BlurView intensity={80} style={styles.cardContent}>
            <Ionicons name="trending-up" size={24} color={colors.semantic.success} />
            <Text style={styles.cardValue}>{SQUAD_INSIGHTS.currentMonth.attendance}%</Text>
            <Text style={styles.cardLabel}>Attendance</Text>
            <Text style={styles.improvement}>
              +{SQUAD_INSIGHTS.currentMonth.improvement}% from last {timeframe === 'weekly' ? 'week' : 'month'}
            </Text>
          </BlurView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.overviewCard}>
          <BlurView intensity={80} style={styles.cardContent}>
            <Ionicons name="fitness" size={24} color={colors.accent.coral} />
            <Text style={styles.cardValue}>{SQUAD_INSIGHTS.currentMonth.avgPerformance}</Text>
            <Text style={styles.cardLabel}>Avg Performance</Text>
            <Text style={styles.cardSubtext}>
              {SQUAD_INSIGHTS.currentMonth.totalWorkouts} workouts
            </Text>
          </BlurView>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInUp.delay(300)}>
        <View style={styles.toughExercisesSection}>
          <Text style={styles.sectionTitle}>Toughest Exercises</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.exerciseScroll}
          >
            {SQUAD_INSIGHTS.currentMonth.toughestExercises.map((exercise, index) => (
              <BlurView key={index} intensity={80} style={styles.exerciseCard}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <View style={styles.exerciseStats}>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
                  </View>
                  <View style={styles.votesBadge}>
                    <Ionicons name="flame" size={14} color={colors.semantic.error} />
                    <Text style={styles.votesText}>{exercise.votes}</Text>
                  </View>
                </View>
              </BlurView>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400)}>
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Top 3 Members</Text>
          {SQUAD_INSIGHTS.currentMonth.memberHighlights.map((member, index) => (
            <BlurView key={index} intensity={80} style={[
              styles.leaderboardCard,
              index === 0 && styles.goldCard,
              index === 1 && styles.silverCard,
              index === 2 && styles.bronzeCard,
            ]}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.achievementTags}>
                  {member.achievements.map((achievement, i) => (
                    <View key={i} style={styles.achievementTag}>
                      <Text style={styles.achievementText}>{achievement}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.performanceBadge}>
                <Text style={styles.performanceText}>{member.performance}%</Text>
              </View>
            </BlurView>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500)}>
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Daily Challenge Champions</Text>
          {[
            { name: 'Emma Chen', completed: 15, streak: 7 },
            { name: 'Alex Wong', completed: 12, streak: 5 },
            { name: 'Mike Ross', completed: 10, streak: 4 }
          ].map((member, index) => (
            <BlurView key={index} intensity={80} style={[
              styles.leaderboardCard,
              index === 0 && styles.goldCard,
              index === 1 && styles.silverCard,
              index === 2 && styles.bronzeCard,
            ]}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.challengeStats}>
                  <View style={styles.statBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.semantic.success} />
                    <Text style={styles.statText}>{member.completed} completed</Text>
                  </View>
                  <View style={styles.statBadge}>
                    <Ionicons name="flame" size={14} color={colors.semantic.warning} />
                    <Text style={styles.statText}>{member.streak} day streak</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          ))}
        </View>
      </Animated.View>
    </View>
  );

  const renderTrainerInputs = () => (
    <View style={styles.section}>
      {loading ? (
        <Text style={styles.loadingText}>Loading trainer inputs...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : trainerInputs.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="clipboard" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Trainer Inputs Yet</Text>
          <Text style={styles.emptyDescription}>
            Your trainer's feedback and assessments will appear here after your workouts.
          </Text>
        </View>
      ) : (
        trainerInputs.map((input, index) => (
          <Animated.View
            key={input.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable 
              style={styles.inputCard}
              onPress={() => setSelectedInput(input)}
            >
              <View style={styles.inputHeader}>
                <View style={styles.trainerInfo}>
                  <Image 
                    source={{ uri: input.trainer.image }}
                    style={styles.trainerImage}
                  />
                  <View>
                    <View style={styles.trainerNameRow}>
                      <Text style={styles.trainerName}>{input.trainer.name}</Text>
                      {input.trainer.verified && (
                        <BlurView intensity={80} style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.semantic.success} />
                        </BlurView>
                      )}
                    </View>
                    <Text style={styles.inputDate}>
                      {new Date(input.date).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <BlurView intensity={80} style={styles.typeBadge}>
                  <Text style={styles.typeText}>{input.type}</Text>
                </BlurView>
              </View>

              <Text style={styles.inputTitle}>{input.title}</Text>

              <View style={styles.performanceSection}>
                <Text style={styles.sectionLabel}>Performance Score</Text>
                <View style={styles.performanceContent}>
                  <View style={styles.starsContainer}>
                    {renderStars(input.performance_score)}
                  </View>
                  <Text style={styles.performanceScore}>{input.performance_score}/5</Text>
                </View>
              </View>

              <View style={styles.feedbackSection}>
                <Text style={styles.sectionLabel}>Trainer's Feedback</Text>
                <Text style={styles.feedbackText}>{input.feedback}</Text>
              </View>

              <View style={styles.exerciseFeedback}>
                {input.best_exercise && (
                  <View style={styles.exerciseHighlight}>
                    <BlurView intensity={80} style={[styles.exerciseBadge, styles.bestExercise]}>
                      <Ionicons name="star" size={16} color={colors.semantic.success} />
                      <Text style={[styles.exerciseBadgeText, styles.bestExerciseText]}>
                        Best: {input.best_exercise}
                      </Text>
                    </BlurView>
                  </View>
                )}
                
                {input.needs_improvement && (
                  <View style={styles.exerciseHighlight}>
                    <BlurView intensity={80} style={[styles.exerciseBadge, styles.improvementExercise]}>
                      <Ionicons name="fitness" size={16} color={colors.semantic.warning} />
                      <Text style={[styles.exerciseBadgeText, styles.improvementExerciseText]}>
                        Focus on: {input.needs_improvement}
                      </Text>
                    </BlurView>
                  </View>
                )}
              </View>

              {input.media && input.media.length > 0 && (
                <View style={styles.mediaSection}>
                  <Text style={styles.sectionLabel}>Media</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.mediaScroll}
                  >
                    {input.media.map((url, i) => (
                      <View key={i} style={styles.mediaItem}>
                        <Image 
                          source={{ uri: url }}
                          style={styles.mediaImage}
                        />
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.sessionDetails}>
                <Text style={styles.sectionLabel}>Session Details</Text>
                <Text style={styles.sessionTime}>{input.session.time}</Text>
                {input.session.exercises && input.session.exercises.length > 0 && (
                  <View style={styles.exerciseList}>
                    {input.session.exercises.map((exercise, i) => (
                      <View key={i} style={styles.exerciseItem}>
                        <Text style={styles.exerciseItemName}>{exercise.name}</Text>
                        <Text style={styles.exerciseItemDetails}>
                          {exercise.sets} × {exercise.reps}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </Pressable>
          </Animated.View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === 'squad' && styles.activeTab]}
            onPress={() => setActiveTab('squad')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'squad' ? colors.primary.dark : colors.gray[500]} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'squad' && styles.activeTabText
            ]}>Squad Insights</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'trainer' && styles.activeTab]}
            onPress={() => setActiveTab('trainer')}
          >
            <Ionicons 
              name="clipboard" 
              size={20} 
              color={activeTab === 'trainer' ? colors.primary.dark : colors.gray[500]} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'trainer' && styles.activeTabText
            ]}>Trainer Input</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'squad' ? renderSquadInsights() : renderTrainerInputs()}
      </ScrollView>

      <Modal
        visible={!!selectedInput}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInput(null)}
      >
        {selectedInput && (
          <View style={styles.modalOverlay}>
            <BlurView intensity={80} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedInput.title}</Text>
                <Pressable 
                  style={styles.closeButton}
                  onPress={() => setSelectedInput(null)}
                >
                  <Ionicons name="close" size={24} color={colors.gray[500]} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.modalTrainerInfo}>
                  <Image 
                    source={{ uri: selectedInput.trainer.image }}
                    style={styles.modalTrainerImage}
                  />
                  <View>
                    <View style={styles.modalTrainerNameRow}>
                      <Text style={styles.modalTrainerName}>{selectedInput.trainer.name}</Text>
                      {selectedInput.trainer.verified && (
                        <BlurView intensity={80} style={styles.verifiedBadge}>
                          <Ionicons name="checkmark-circle" size={14} color={colors.semantic.success} />
                        </BlurView>
                      )}
                    </View>
                    <Text style={styles.modalInputDate}>
                      {new Date(selectedInput.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalPerformance}>
                  <Text style={styles.modalSectionTitle}>Performance Score</Text>
                  <View style={styles.modalPerformanceContent}>
                    <View style={styles.starsContainer}>
                      {renderStars(selectedInput.performance_score)}
                    </View>
                    <Text style={styles.modalPerformanceScore}>
                      {selectedInput.performance_score}/5
                    </Text>
                  </View>
                </View>

                <View style={styles.modalFeedback}>
                  <Text style={styles.modalSectionTitle}>Trainer's Feedback</Text>
                  <Text style={styles.modalFeedbackText}>{selectedInput.feedback}</Text>
                </View>

                <View style={styles.modalExerciseFeedback}>
                  <Text style={styles.modalSectionTitle}>Exercise Analysis</Text>
                  {selectedInput.best_exercise && (
                    <View style={styles.modalExerciseHighlight}>
                      <BlurView intensity={80} style={[styles.modalExerciseBadge, styles.bestExercise]}>
                        <Ionicons name="star" size={20} color={colors.semantic.success} />
                        <View style={styles.modalExerciseContent}>
                          <Text style={styles.modalExerciseLabel}>Best Performance</Text>
                          <Text style={[styles.modalExerciseName, styles.bestExerciseText]}>
                            {selectedInput.best_exercise}
                          </Text>
                        </View>
                      </BlurView>
                    </View>
                  )}
                  
                  {selectedInput.needs_improvement && (
                    <View style={styles.modalExerciseHighlight}>
                      <BlurView intensity={80} style={[styles.modalExerciseBadge, styles.improvementExercise]}>
                        <Ionicons name="fitness" size={20} color={colors.semantic.warning} />
                        <View style={styles.modalExerciseContent}>
                          <Text style={styles.modalExerciseLabel}>Needs Improvement</Text>
                          <Text style={[styles.modalExerciseName, styles.improvementExerciseText]}>
                            {selectedInput.needs_improvement}
                          </Text>
                        </View>
                      </BlurView>
                    </View>
                  )}
                </View>

                {selectedInput.media && selectedInput.media.length > 0 && (
                  <View style={styles.modalMedia}>
                    <Text style={styles.modalSectionTitle}>Media</Text>
                    <View style={styles.modalMediaGrid}>
                      {selectedInput.media.map((url, i) => (
                        <View key={i} style={styles.modalMediaItem}>
                          <Image 
                            source={{ uri: url }}
                            style={styles.modalMediaImage}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {selectedInput.session.exercises && selectedInput.session.exercises.length > 0 && (
                  <View style={styles.modalSession}>
                    <Text style={styles.modalSectionTitle}>Session Details</Text>
                    <Text style={styles.modalSessionTime}>{selectedInput.session.time}</Text>
                    <View style={styles.modalExerciseList}>
                      {selectedInput.session.exercises.map((exercise, i) => (
                        <View key={i} style={styles.modalExerciseItem}>
                          <Text style={styles.modalExerciseItemName}>{exercise.name}</Text>
                          <Text style={styles.modalExerciseItemDetails}>
                            {exercise.sets} × {exercise.reps}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            </BlurView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  header: {
    padding: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  activeTab: {
    backgroundColor: colors.primary.light,
    ...shadows.sm,
  },
  tabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
  },
  activeTabText: {
    color: colors.primary.dark,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing.md,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    padding: spacing.xs,
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  timeframeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  activeTimeframe: {
    backgroundColor: colors.primary.light,
    ...shadows.sm,
  },
  timeframeText: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    fontWeight: typography.weight.medium as any,
  },
  activeTimeframeText: {
    color: colors.primary.dark,
  },
  overviewCards: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  cardContent: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cardValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginVertical: spacing.xs,
  },
  cardLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  improvement: {
    fontSize: typography.size.sm,
    color: colors.semantic.success,
    marginTop: spacing.xs,
  },
  cardSubtext: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  toughExercisesSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  exerciseScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  exerciseCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    width: 160,
    backgroundColor: colors.primary.light,
    ...shadows.sm,
  },
  exerciseName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
  votesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.semantic.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  votesText: {
    fontSize: typography.size.sm,
    color: colors.semantic.error,
  },
  leaderboardSection: {
    marginBottom: spacing.xl,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  goldCard: {
    backgroundColor: colors.transparent.warning,
    borderColor: colors.semantic.warning,
    borderWidth: 1,
  },
  silverCard: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[300],
    borderWidth: 1,
  },
  bronzeCard: {
    backgroundColor: colors.transparent.error,
    borderColor: colors.semantic.error,
    borderWidth: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  achievementTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  achievementTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  achievementText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  performanceBadge: {
    backgroundColor: colors.semantic.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  performanceText: {
    fontSize: typography.size.sm,
    color: colors.semantic.success,
    fontWeight: typography.weight.medium as any,
  },
  challengeStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  inputCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  trainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trainerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  trainerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trainerName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  verifiedBadge: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success + '20',
  },
  inputDate: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.coral + '20',
  },
  typeText: {
    fontSize: typography.size.sm,
    color: colors.accent.coral,
    textTransform: 'capitalize',
  },
  inputTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  performanceSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  performanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  performanceScore: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
  feedbackSection: {
    marginBottom: spacing.md,
  },
  feedbackText: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
    lineHeight: typography.lineHeight.relaxed,
  },
  exerciseFeedback: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exerciseHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  bestExercise: {
    backgroundColor: colors.semantic.success + '20',
  },
  improvementExercise: {
    backgroundColor: colors.semantic.warning + '20',
  },
  exerciseBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  bestExerciseText: {
    color: colors.semantic.success,
  },
  improvementExerciseText: {
    color: colors.semantic.warning,
  },
  mediaSection: {
    marginBottom: spacing.md,
  },
  mediaScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  mediaItem: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  sessionDetails: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  sessionTime: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  exerciseList: {
    gap: spacing.xs,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseItemName: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  exerciseItemDetails: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.primary.light,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  closeButton: {
    padding: spacing.sm,
  },
  modalBody: {
    padding: spacing.md,
  },
  modalTrainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  modalTrainerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  modalTrainerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  modalTrainerName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  modalInputDate: {
    fontSize: typography.size.md,
    color: colors.gray[500],
  },
  modalPerformance: {
    marginBottom: spacing.xl,
  },
  modalSectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  modalPerformanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  modalPerformanceScore: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
  },
  modalFeedback: {
    marginBottom: spacing.xl,
  },
  modalFeedbackText: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
    lineHeight: typography.lineHeight.relaxed,
  },
  modalExerciseFeedback: {
    marginBottom: spacing.xl,
  },
  modalExerciseHighlight: {
    marginBottom: spacing.md,
  },
  modalExerciseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  modalExerciseContent: {
    flex: 1,
  },
  modalExerciseLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  modalExerciseName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
  },
  modalMedia: {
    marginBottom: spacing.xl,
  },
  modalMediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  modalMediaItem: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '45%',
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  modalMediaImage: {
    width: '100%',
    height: '100%',
  },
  modalSession: {
    marginBottom: spacing.xl,
  },
  modalSessionTime: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  modalExerciseList: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  modalExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalExerciseItemName: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
  },
  modalExerciseItemDetails: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
  },
});