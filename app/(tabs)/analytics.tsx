import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useState } from 'react';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, shadows, typography, spacing, borderRadius } from '../constants/theme';

const SQUAD_MEMBERS = [
  {
    id: '1',
    name: 'Sarah Chen',
    attendance: 95,
    mvpVotes: 28,
    slackerVotes: 2,
    totalScore: 121,
    color: '#FFE1E1',
    recentAchievements: ['🎯 Perfect Week', '💪 Most MVP Votes'],
  },
  {
    id: '2',
    name: 'Mike Ross',
    attendance: 88,
    mvpVotes: 15,
    slackerVotes: 5,
    totalScore: 98,
    color: '#E1F5FF',
    recentAchievements: ['🔥 Workout Streak', '👊 Consistency King'],
  },
  {
    id: '3',
    name: 'Alex Wong',
    attendance: 92,
    mvpVotes: 18,
    slackerVotes: 3,
    totalScore: 107,
    color: '#FFE8D9',
    recentAchievements: ['⚡ High Energy', '🌟 Rising Star'],
  },
];

const TOUGH_EXERCISES = [
  {
    id: '1',
    name: 'Burpees',
    type: 'Compound',
    votes: 28,
    difficulty: 9.2,
    description: 'Full-body exercise that combines a squat, push-up, and jump. Targets multiple muscle groups while providing intense cardiovascular benefits.',
    impact: ['Cardiovascular endurance', 'Full body strength', 'Explosive power'],
    color: '#FFE1E1',
  },
  {
    id: '2',
    name: 'Pistol Squats',
    type: 'Unilateral',
    votes: 24,
    difficulty: 8.8,
    description: 'Single-leg squat that requires exceptional balance and leg strength. Builds lower body strength while improving stability and coordination.',
    impact: ['Lower body strength', 'Balance', 'Core stability'],
    color: '#E1F5FF',
  },
  {
    id: '3',
    name: 'Muscle-ups',
    type: 'Calisthenics',
    votes: 22,
    difficulty: 8.5,
    description: 'Advanced pull-up variation that transitions into a dip. Develops upper body strength and explosive power.',
    impact: ['Upper body strength', 'Explosive power', 'Coordination'],
    color: '#FFE8D9',
  },
];

export default function Analytics() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  
  const exercise = TOUGH_EXERCISES.find(e => e.id === selectedExercise);
  const member = SQUAD_MEMBERS.find(m => m.id === selectedMember);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Squad Insights</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Overview</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#FFE1E1' }]}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#E1F5FF' }]}>
            <Text style={styles.statValue}>92%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFE8D9' }]}>
            <Text style={styles.statValue}>12.4k</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Squad Leaderboard</Text>
        <Text style={styles.sectionSubtitle}>Based on attendance and performance</Text>
        {SQUAD_MEMBERS.sort((a, b) => b.totalScore - a.totalScore).map((member, index) => (
          <Animated.View
            key={member.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[styles.memberCard, { backgroundColor: member.color }]}
              onPress={() => setSelectedMember(member.id)}
            >
              <View style={styles.memberHeader}>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <View style={styles.memberStats}>
                    <View style={styles.statBadge}>
                      <Ionicons name="calendar" size={14} color={colors.primary.dark} />
                      <Text style={styles.statText}>{member.attendance}%</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={styles.statText}>🏆 {member.mvpVotes}</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Text style={styles.statText}>😴 {member.slackerVotes}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.totalScore}>{member.totalScore}</Text>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
              </View>
              <View style={styles.achievementsRow}>
                {member.recentAchievements.map((achievement, i) => (
                  <Text key={i} style={styles.achievement}>{achievement}</Text>
                ))}
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Toughest Exercises</Text>
        <Text style={styles.sectionSubtitle}>As voted by the squad</Text>
        {TOUGH_EXERCISES.map((exercise, index) => (
          <Animated.View
            key={exercise.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[styles.exerciseCard, { backgroundColor: exercise.color }]}
              onPress={() => setSelectedExercise(exercise.id)}
            >
              <View style={styles.exerciseHeader}>
                <View>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseType}>{exercise.type}</Text>
                </View>
                <View style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{exercise.difficulty}</Text>
                </View>
              </View>
              <View style={styles.exerciseStats}>
                <View style={styles.votesContainer}>
                  <Ionicons name="flame" size={16} color={colors.semantic.error} />
                  <Text style={styles.votesText}>{exercise.votes} votes</Text>
                </View>
                <BlurView intensity={80} style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </BlurView>
              </View>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      {/* Exercise Details Modal */}
      <Modal
        visible={!!selectedExercise}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedExercise(null)}
      >
        {exercise && (
          <View style={styles.modalOverlay}>
            <BlurView intensity={80} tint="light" style={[styles.modalContent, { height: '70%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{exercise.name}</Text>
                <Pressable 
                  onPress={() => setSelectedExercise(null)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.primary.dark} />
                </Pressable>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <View style={[styles.exerciseDetailCard, { backgroundColor: exercise.color }]}>
                  <View style={styles.exerciseDetailHeader}>
                    <View style={styles.exerciseDetailType}>
                      <Text style={styles.exerciseDetailTypeText}>{exercise.type}</Text>
                    </View>
                    <View style={styles.exerciseDetailDifficulty}>
                      <Text style={styles.exerciseDetailDifficultyLabel}>Difficulty</Text>
                      <Text style={styles.exerciseDetailDifficultyValue}>{exercise.difficulty}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.exerciseDetailVotes}>
                    <Ionicons name="flame" size={20} color={colors.semantic.error} />
                    <Text style={styles.exerciseDetailVotesText}>{exercise.votes} squad members found this challenging</Text>
                  </View>
                  
                  <Text style={styles.exerciseDetailDescription}>{exercise.description}</Text>
                  
                  <View style={styles.impactSection}>
                    <Text style={styles.impactTitle}>Impact Areas</Text>
                    {exercise.impact.map((area, index) => (
                      <View key={index} style={styles.impactItem}>
                        <Ionicons name="checkmark-circle" size={20} color={colors.primary.dark} />
                        <Text style={styles.impactText}>{area}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        )}
      </Modal>

      {/* Member Details Modal */}
      <Modal
        visible={!!selectedMember}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMember(null)}
      >
        {member && (
          <View style={styles.modalOverlay}>
            <BlurView intensity={80} tint="light" style={[styles.modalContent, { height: '60%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{member.name}</Text>
                <Pressable 
                  onPress={() => setSelectedMember(null)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.primary.dark} />
                </Pressable>
              </View>
              
              <ScrollView style={styles.modalBody}>
                <View style={[styles.memberDetailCard, { backgroundColor: member.color }]}>
                  <Text style={styles.scoreBreakdownTitle}>Score Breakdown</Text>
                  
                  <View style={styles.scoreBreakdown}>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>Attendance (×1)</Text>
                      <Text style={styles.scoreValue}>+{member.attendance}</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>MVP Votes (×1)</Text>
                      <Text style={styles.scoreValue}>+{member.mvpVotes}</Text>
                    </View>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreLabel}>Slacker Votes (×-1)</Text>
                      <Text style={styles.scoreValue}>-{member.slackerVotes}</Text>
                    </View>
                    <View style={[styles.scoreItem, styles.totalScoreItem]}>
                      <Text style={styles.totalScoreLabel}>Total Score</Text>
                      <Text style={styles.totalScoreValue}>{member.totalScore}</Text>
                    </View>
                  </View>

                  <View style={styles.achievementsSection}>
                    <Text style={styles.achievementsTitle}>Recent Achievements</Text>
                    {member.recentAchievements.map((achievement, index) => (
                      <View key={index} style={styles.achievementItem}>
                        <Text style={styles.achievementText}>{achievement}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  memberCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  memberStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  totalScore: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
  },
  rankText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  achievementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  achievement: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  exerciseCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  exerciseName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  exerciseType: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  difficultyBadge: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  difficultyText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  votesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  votesText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  rankBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.primary.light,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
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
  exerciseDetailCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  exerciseDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseDetailType: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  exerciseDetailTypeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
  exerciseDetailDifficulty: {
    alignItems: 'center',
  },
  exerciseDetailDifficultyLabel: {
    fontSize: typography.size.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  exerciseDetailDifficultyValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
  },
  exerciseDetailVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.light,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  exerciseDetailVotesText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  exerciseDetailDescription: {
    fontSize: typography.size.sm,
    lineHeight: 22,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  impactSection: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  impactTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  impactText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  memberDetailCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  scoreBreakdownTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  scoreBreakdown: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  scoreLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  scoreValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  totalScoreItem: {
    borderBottomWidth: 0,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  totalScoreLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  totalScoreValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
  },
  achievementsSection: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  achievementsTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  achievementItem: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  achievementText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
});