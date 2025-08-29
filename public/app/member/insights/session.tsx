import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { useSessions } from '@/app/context/SessionsContext';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { getProfilePicThumbNailURL } from '@/utils/mediaUtils';
import { getUserProfile } from '@/utils/storage';

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
      setTrainerInputs(inputs.filter(input => input.session));
    });
  }, [sessions]);

  const getTrainerInputsFromSessions = async () => {
    const profile = await getUserProfile();
    const defaultTrainer = {
      name: profile.display_name,
      image: getProfilePicThumbNailURL(profile.id),
      verified: true
    }
    return sessions
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()) // Sort by date descending
      .map(session => ({
        id: session.id,
        date: session.start_time,
        trainer: session.session? {
          name: session.session.trainer.display_name,
          image: getProfilePicThumbNailURL((session.session.trainer as any).id),
          verified: true
        }: defaultTrainer,
        type: session.type,
        module_type: session.module_type,
        level: session.level,
        total_energy_points: session.total_energy_points,
        title: session.session?.title || session.exercises[0].name,
        performance_score: session.performance_score,
        feedback: session.trainer_comments,
        media: session.session_media,
        session: session.session ? {
          title: session.session.title,
          time: session.start_time,
          exercises: session.exercises
        }: null,
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
            <View style={[styles.inputCard, { marginBottom: spacing.md, borderRadius: borderRadius.lg, ...shadows.sm }]}>
              {/* Trainer Info Row */}
              <View style={styles.inputHeader}>
                <View style={styles.trainerInfo}>
                  <Image 
                    source={{ uri: input.trainer?.image }}
                    style={styles.trainerImage}
                  />
                  <View>
                    <View style={styles.trainerNameRow}>
                      <Text style={styles.trainerName}>{input.trainer?.name}</Text>
                    </View>
                    <Text style={styles.inputDate}>
                      {new Date(input.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' })} at {new Date(input.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                {/* Arrow */}
                <Pressable 
                  style={styles.arrowButton}
                  onPress={() => router.push(`./${input.id}`, {relativeToDirectory: true})}
                >
                  <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
                </Pressable>
              </View>

              {/* Session Title with Status Badge */}
              <View style={styles.titleRow}>
                <Text style={styles.inputTitle}>{input.title}</Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(input.session?.status)]}>
                  <Text style={[styles.statusBadgeText, getStatusBadgeTextStyle(input.session?.status)]}>{getStatusText(input.session?.status)}</Text>
                </View>
              </View>

              {/* Session Badges Grid */}
              <View style={styles.sessionTypeGrid}>
                {/* Module */}
                <View style={styles.gridItem}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.sessionTypeBadge, { backgroundColor: '#1DCB6B20' }]}>
                      <Ionicons name="barbell" size={20} color="#1DCB6B" />
                    </View>
                    <View style={styles.badgeTextContainer}>
                      <Text style={styles.badgeLabel}>Module</Text>
                      <Text style={styles.badgeValue}>{input.module_type || '-'}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Level */}
                <View style={styles.gridItem}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.sessionTypeBadge, { backgroundColor: '#FFD60020' }]}>
                      <Text style={styles.sessionTypeBadgeTextYellow}>{2}</Text>
                    </View>
                    <View style={styles.badgeTextContainer}>
                      <Text style={styles.badgeLabel}>Level</Text>
                      <Text style={styles.badgeValue}>{input.level || '-'}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Type */}
                <View style={styles.gridItem}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.sessionTypeBadge, { backgroundColor: '#A259FF20' }]}>
                      <Ionicons name="body" size={20} color="#A259FF" />
                    </View>
                    <View style={styles.badgeTextContainer}>
                      <Text style={styles.badgeLabel}>Type</Text>
                      <Text style={styles.badgeValue}>{input.type || '-'}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Energy Points */}
                <View style={styles.gridItem}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.sessionTypeBadge, { backgroundColor: '#00C2FF20' }]}>
                      <Ionicons name="flash" size={20} color="#00C2FF" />
                    </View>
                    <View style={styles.badgeTextContainer}>
                      <Text style={styles.badgeLabel}>Energy Points</Text>
                      <Text style={styles.badgeValue}>{input.total_energy_points || '-'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Performance Score */}
              <View style={styles.performanceSection}>
                <Text style={styles.sectionLabel}>Performance Score</Text>
                <View style={styles.performanceContent}>
                  <View style={styles.starsContainer}>
                    {renderStars(input.performance_score)}
                  </View>
                  <Text style={styles.performanceScore}>{input.performance_score}/5</Text>
                </View>
              </View>
            </View>
        </Animated.View>
      ))}
    </View>
  );
}

function getStatusText(status) {
  if (!status) return 'Completed';
  if (status.toLowerCase() === 'skipped') return 'Skipped';
  if (status.toLowerCase() === 'incomplete') return 'Incomplete';
  return 'Completed';
}
function getStatusBadgeStyle(status) {
  if (!status) return { backgroundColor: '#14532D' };
  if (status.toLowerCase() === 'skipped') return { backgroundColor: '#7C2D12' };
  if (status.toLowerCase() === 'incomplete') return { backgroundColor: '#78350F' };
  return { backgroundColor: '#14532D' };
}
function getStatusBadgeTextStyle(status) {
  if (!status) return { color: '#A7F3D0' };
  if (status.toLowerCase() === 'skipped') return { color: '#FECACA' };
  if (status.toLowerCase() === 'incomplete') return { color: '#FDE68A' };
  return { color: '#A7F3D0' };
}

const styles = StyleSheet.create({
  section: {
    padding: spacing.md,
  },
  inputCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: '#22262F',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },

  arrowButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.full,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: spacing.md,
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
    fontSize: typography.size.xs,
    color: colors.gray[500],
  },
  inputTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.regular as any,
    color: colors.gray[200],
    marginBottom: spacing.sm,
  },
  performanceSection: {
    marginBottom: spacing.sm,
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
    backgroundColor: '#FFD60020',
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
    marginBottom: spacing.sm,
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
  mediaCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gray[700],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  mediaCountText: {
    fontSize: typography.size.sm,
    color: colors.gray[300],
    fontWeight: typography.weight.medium as any,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginLeft: 8,
    minWidth: 80,
    marginTop: 2,
  },
  statusBadgeText: {
    fontWeight: '600',
    fontSize: 13,
    fontFamily: 'System',
    textAlign: 'center',
  },
  sessionTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    marginTop: 8,
  },
  gridItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%', // Two columns
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  badgeTextContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  sessionTypeBadge: {
    width: 60, // Smaller badges since labels are outside
    height: 60, // Smaller badges since labels are outside
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
  badgeLabel: {
    fontSize: 10,
    color: '#B0B0B0',
    fontWeight: '400',
    marginTop: 1,
    textAlign: 'center',
    fontFamily: 'System',
  },
  badgeValue: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '400',
    textAlign: 'center',
    fontFamily: 'System',
    marginTop: 1,
  },

}); 