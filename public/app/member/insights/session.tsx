import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { useSessions } from '@/app/context/SessionsContext';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface TrainerInputsProps {
  loading: boolean;
  error: string | null;
}

export default function TrainerInputs({ loading, error }: TrainerInputsProps) {
  const { sessions } = useSessions();
  const [trainerInputs, setTrainerInputs] = useState([]);

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
        image: `https://storage.googleapis.com/fit-squad-club.firebasestorage.app/media/${session.session.trainer.id}/profilepic/1/1-thumbnail`,
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

  if (loading) {
    return (
      <View style={styles.section}>
        <Text style={styles.loadingText}>Loading trainer inputs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.section}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (trainerInputs.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.emptyState}>
          <Ionicons name="clipboard" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyTitle}>No Trainer Inputs Yet</Text>
          <Text style={styles.emptyDescription}>
            Your trainer's feedback and assessments will appear here after your workouts.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {trainerInputs.map((input, index) => (
        <Animated.View
          key={input.id}
          entering={FadeInUp.delay(index * 100)}
        >
          <Pressable 
            style={{ marginBottom: spacing.md, borderRadius: borderRadius.lg, ...shadows.sm }}
            onPress={() => router.push(`./${input.id}`, {relativeToDirectory: true})}
          >
            <LinearGradient colors={["#21262F", "#353D45"]} style={styles.inputCard}>
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
            </LinearGradient>
          </Pressable>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: spacing.md,
  },
  inputCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
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
    color: colors.gray[200],
  },
  verifiedBadge: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success + '20',
  },
  inputDate: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
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
    color: colors.gray[200],
    marginBottom: spacing.md,
  },
  performanceSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[400],
    marginBottom: spacing.xs,
  },
  performanceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[700],
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
    color: colors.gray[200],
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.size.md,
    color: colors.gray[400],
    textAlign: 'center',
  },
}); 