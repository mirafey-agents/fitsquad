import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useState } from 'react';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
                      <Ionicons name="calendar" size={14} color="#000000" />
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
                  <Ionicons name="flame" size={16} color="#FF3B30" />
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
                  <Ionicons name="close" size={24} color="#000000" />
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
                    <Ionicons name="flame" size={20} color="#FF3B30" />
                    <Text style={styles.exerciseDetailVotesText}>{exercise.votes} squad members found this challenging</Text>
                  </View>
                  
                  <Text style={styles.exerciseDetailDescription}>{exercise.description}</Text>
                  
                  <View style={styles.impactSection}>
                    <Text style={styles.impactTitle}>Impact Areas</Text>
                    {exercise.impact.map((area, index) => (
                      <View key={index} style={styles.impactItem}>
                        <Ionicons name="checkmark-circle" size={20} color="#000000" />
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
                  <Ionicons name="close" size={24} color="#000000" />
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  memberCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  memberStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statText: {
    fontSize: 14,
    color: '#000000',
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  totalScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  achievementsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  achievement: {
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  exerciseType: {
    fontSize: 14,
    color: '#8E8E93',
  },
  difficultyBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  votesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  votesText: {
    fontSize: 14,
    color: '#000000',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
  },
  exerciseDetailCard: {
    borderRadius: 16,
    padding: 20,
  },
  exerciseDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseDetailType: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  exerciseDetailTypeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  exerciseDetailDifficulty: {
    alignItems: 'center',
  },
  exerciseDetailDifficultyLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  exerciseDetailDifficultyValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  exerciseDetailVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  exerciseDetailVotesText: {
    fontSize: 14,
    color: '#000000',
  },
  exerciseDetailDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000000',
    marginBottom: 20,
  },
  impactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  impactTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  impactText: {
    fontSize: 15,
    color: '#000000',
  },
  memberDetailCard: {
    borderRadius: 16,
    padding: 20,
  },
  scoreBreakdownTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  scoreBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  scoreLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  totalScoreItem: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalScoreLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  totalScoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  achievementsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  achievementsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  achievementItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 15,
    color: '#000000',
  },
});