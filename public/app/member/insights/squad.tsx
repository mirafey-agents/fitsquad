import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';

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

interface SquadInsightsProps {
  timeframe: 'weekly' | 'monthly';
  setTimeframe: (timeframe: 'weekly' | 'monthly') => void;
}

export default function SquadInsights({ timeframe, setTimeframe }: SquadInsightsProps) {
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

  return (
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
}

const styles = StyleSheet.create({
  section: {
    padding: spacing.md,
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.gray[800],
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
    backgroundColor: colors.gray[700],
    ...shadows.sm,
  },
  timeframeText: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
    fontWeight: typography.weight.medium as any,
  },
  activeTimeframeText: {
    color: colors.gray[200],
  },
  overviewCards: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: colors.gray[800],
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
    color: colors.gray[200],
    marginVertical: spacing.xs,
  },
  cardLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
  },
  improvement: {
    fontSize: typography.size.sm,
    color: colors.semantic.success,
    marginTop: spacing.xs,
  },
  cardSubtext: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
    marginTop: spacing.xs,
  },
  toughExercisesSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
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
    backgroundColor: colors.gray[800],
    ...shadows.sm,
  },
  exerciseName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
    marginBottom: spacing.sm,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: colors.gray[700],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[200],
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
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  goldCard: {
    backgroundColor: colors.gray[700],
    borderColor: colors.semantic.warning,
    borderWidth: 1,
  },
  silverCard: {
    backgroundColor: colors.gray[700],
    borderColor: colors.gray[400],
    borderWidth: 1,
  },
  bronzeCard: {
    backgroundColor: colors.gray[700],
    borderColor: colors.semantic.error,
    borderWidth: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold as any,
    color: colors.gray[200],
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
    marginBottom: spacing.xs,
  },
  achievementTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  achievementTag: {
    backgroundColor: colors.gray[700],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  achievementText: {
    fontSize: typography.size.sm,
    color: colors.gray[200],
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
    backgroundColor: colors.gray[700],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.gray[200],
    fontWeight: typography.weight.medium as any,
  },
}); 