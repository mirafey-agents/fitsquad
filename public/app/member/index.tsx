import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRootNavigationState } from 'expo-router';
import Logo from '../../components/Logo';
import { getLoggedInUser } from '../../utils/supabase';
import {getUserWorkouts} from '../../utils/firebase';

import {
  colors,
  shadows,
  spacing,
  borderRadius,
  typography,
} from '../../constants/theme';
import HabitTracker from '../../components/HabitTracker';
import DailyChallenges from '../../components/DailyChallenges';
import {
  format,
  isSameDay,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from 'date-fns';

const WORKOUT_DATA = {
  '2025-03-06': {
    id: '1',
    title: 'Morning HIIT',
    time: '06:30 AM',
    trainer: 'Sarah Chen',
    completed: true,
    energyPoints: 450,
    votingPending: true,
    exercises: [
      { name: 'Burpees', sets: 3, reps: 15, energyPoints: 150 },
      { name: 'Mountain Climbers', sets: 3, reps: 30, energyPoints: 120 },
      { name: 'Jump Squats', sets: 4, reps: 20, energyPoints: 180 },
    ],
    participants: [
      {
        id: '1',
        name: 'Mike Ross',
        mvpVotes: 3,
        hasVoted: false,
      },
      {
        id: '2',
        name: 'Alex Wong',
        mvpVotes: 5,
        hasVoted: true,
      },
      {
        id: '3',
        name: 'Emma Chen',
        mvpVotes: 4,
        hasVoted: false,
      },
    ],
    toughestExercises: [
      { id: '1', name: 'Burpees', votes: 8, difficulty: 9.2, hasVoted: false },
      {
        id: '2',
        name: 'Mountain Climbers',
        votes: 5,
        difficulty: 8.5,
        hasVoted: false,
      },
      {
        id: '3',
        name: 'Jump Squats',
        votes: 6,
        difficulty: 8.8,
        hasVoted: false,
      },
    ],
  },
  '2025-03-07': {
    id: '2',
    title: 'Strength Training',
    time: '07:00 AM',
    trainer: 'Mike Ross',
    completed: false,
    energyPoints: 500,
    exercises: [
      { name: 'Deadlifts', sets: 4, reps: 10, energyPoints: 200 },
      { name: 'Bench Press', sets: 4, reps: 12, energyPoints: 180 },
      { name: 'Squats', sets: 4, reps: 15, energyPoints: 220 },
    ],
    participants: [],
    toughestExercises: [],
  },
};

export default function Home() {

  const rootNavigationState = useRootNavigationState()
  const navigatorReady = rootNavigationState?.key != null

  useEffect(() => {
    if (!navigatorReady) return;
    const userData = getLoggedInUser();
    console.log('member dashboard', userData);

    if (!userData.user) {
      router.push('/login');
    } else if (userData.profile?.onboarding_status != "completed") {
      router.push('./onboarding', {relativeToDirectory: true});
    }
    
    setUserData(userData);
    getUserWorkouts(new Date(2024,1,1), new Date(2025,12,1)).then(
      (workouts) => {
        console.log('workouts: ', workouts);
      }
    );
  }, [navigatorReady])

  const CURRENT_DATE = new Date();
  const [selectedDate, setSelectedDate] = useState(CURRENT_DATE);
  const [userData, setUserData] = useState({profile: {display_name: 'Guest'}});
  const [userVotes, setUserVotes] = useState<{
    mvp: string | null;
    toughest: string | null;
  }>({
    mvp: null,
    toughest: null,
  });

  const selectedWorkout = WORKOUT_DATA[format(selectedDate, 'yyyy-MM-dd')];
  const isPastDate = isBefore(
    selectedDate,
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const isFutureDate = isAfter(
    selectedDate,
    new Date(new Date().setHours(23, 59, 59, 999))
  );

  const handleVote = (type: 'mvp' | 'toughest', id: string) => {
    setUserVotes((prev) => {
      const newVotes = { ...prev };
      if (prev[type] === id) {
        newVotes[type] = null;
      } else {
        newVotes[type] = id;
      }
      return newVotes;
    });
  };

  const getCalendarDays = () => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  };

  const getWorkoutIndicator = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const workout = WORKOUT_DATA[dateStr];
  
    if (!workout) return null;

    if (
      isBefore(date, new Date()) &&
      workout.completed &&
      workout.votingPending
    ) {
      return 'votingPending';
    } else if (workout.completed) {
      return 'completed';
    } else {
      return 'planned';
    }
  };

  const getEnergyPoints = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return WORKOUT_DATA[dateStr]?.energyPoints || 0;
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.accent.coral, colors.accent.mint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Logo size="large" />
          <Text style={styles.greeting}>
            Hello {userData?.profile?.display_name || 'Guest'}
          </Text>
          <Text style={styles.subtitle}>Let's crush today's goals! 💪</Text>
        </View>
      </LinearGradient>

      <View style={styles.calendarContainer}>
        <View style={styles.monthHeader}>
          <Text style={styles.monthText}>
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendar}
        >
          {getCalendarDays().map((date) => {
            const isToday = isSameDay(date, CURRENT_DATE);
            const isSelected = isSameDay(date, selectedDate);
            const workoutIndicator = getWorkoutIndicator(date);
            const energyPoints = getEnergyPoints(date);

            return (
              <Pressable
                key={date.toISOString()}
                style={[
                  styles.calendarDay,
                  isSelected && styles.selectedDay,
                  isToday && styles.today,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[styles.dayName, isSelected && styles.selectedDayText]}
                >
                  {format(date, 'EEE')}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {format(date, 'd')}
                </Text>

                {workoutIndicator && (
                  <View
                    style={[
                      styles.workoutIndicator,
                      workoutIndicator === 'completed' &&
                        styles.completedWorkout,
                      workoutIndicator === 'planned' && styles.plannedWorkout,
                      workoutIndicator === 'votingPending' &&
                        styles.votingPendingWorkout,
                    ]}
                  >
                    {energyPoints > 0 && (
                      <Text style={styles.energyPoints}>{energyPoints}⚡</Text>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {/* Daily Habits */}
        <Animated.View entering={FadeInUp.delay(200)}>
          <Pressable
            style={[styles.card, { backgroundColor: colors.transparent.coral }]}
            onPress={() => router.push('/habits')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="list" size={24} color={colors.primary.dark} />
                <Text style={styles.cardTitle}>Daily Check-in</Text>
              </View>
              <BlurView intensity={80} style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>Important</Text>
              </BlurView>
            </View>

            <HabitTracker preview={true} />
            <DailyChallenges preview={true} />

            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>View full details</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.primary.dark}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Workout Review */}
        <Animated.View entering={FadeInUp.delay(300)}>
          <View
            style={[styles.card, { backgroundColor: colors.transparent.mint }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons
                  name="fitness"
                  size={24}
                  color={colors.primary.dark}
                />
                <Text style={styles.cardTitle}>
                  {isFutureDate ? 'Upcoming Workout' : 'Workout Review'}
                </Text>
              </View>
              {selectedWorkout?.completed && (
                <BlurView
                  intensity={80}
                  style={[
                    styles.cardBadge,
                    { backgroundColor: `${colors.semantic.success}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.cardBadgeText,
                      { color: colors.semantic.success },
                    ]}
                  >
                    Completed
                  </Text>
                </BlurView>
              )}
            </View>

            {selectedWorkout ? (
              <>
                <View style={styles.workoutSummary}>
                  <Text style={styles.workoutTitle}>
                    {selectedWorkout.title}
                  </Text>
                  <Text style={styles.workoutTime}>
                    {selectedWorkout.time} with {selectedWorkout.trainer}
                  </Text>
                  {selectedWorkout.completed && (
                    <View style={styles.energyPoints}>
                      <Ionicons
                        name="flash"
                        size={20}
                        color={colors.semantic.warning}
                      />
                      <Text style={styles.energyPointsText}>
                        {selectedWorkout.energyPoints} Energy Points Earned
                      </Text>
                    </View>
                  )}
                </View>

                {selectedWorkout.completed && (
                  <>
                    <View style={styles.exercisesList}>
                      <Text style={styles.exercisesTitle}>Workout Summary</Text>
                      {selectedWorkout.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exerciseItem}>
                          <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>
                              {exercise.name}
                            </Text>
                            <Text style={styles.exerciseDetails}>
                              {exercise.sets} × {exercise.reps}
                            </Text>
                          </View>
                          <View style={styles.exercisePoints}>
                            <Ionicons
                              name="flash"
                              size={16}
                              color={colors.semantic.warning}
                            />
                            <Text style={styles.pointsText}>
                              {exercise.energyPoints}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.votingSection}>
                      <Text style={styles.votingTitle}>Cast Your Votes</Text>

                      {/* MVP Voting */}
                      <View style={styles.votingCategory}>
                        <Text style={styles.votingCategoryTitle}>
                          MVP of the Session
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.votingOptions}
                        >
                          {selectedWorkout.participants.map((participant) => (
                            <Pressable
                              key={participant.id}
                              style={[
                                styles.participantCard,
                                userVotes.mvp === participant.id &&
                                  styles.selectedVoteCard,
                                participant.hasVoted && styles.votedCard,
                              ]}
                              onPress={() =>
                                !participant.hasVoted &&
                                handleVote('mvp', participant.id)
                              }
                              disabled={participant.hasVoted}
                            >
                              <View style={styles.participantAvatar}>
                                <Text style={styles.participantInitials}>
                                  {participant.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </Text>
                              </View>
                              <Text style={styles.participantName}>
                                {participant.name}
                              </Text>
                              <View style={styles.voteCount}>
                                <Ionicons
                                  name="trophy"
                                  size={16}
                                  color={colors.accent.coral}
                                />
                                <Text style={styles.voteCountText}>
                                  {participant.mvpVotes}
                                </Text>
                              </View>
                              {participant.hasVoted && (
                                <BlurView
                                  intensity={80}
                                  style={styles.votedBadge}
                                >
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={colors.semantic.success}
                                  />
                                  <Text style={styles.votedText}>Voted</Text>
                                </BlurView>
                              )}
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Toughest Exercise Voting */}
                      <View style={styles.votingCategory}>
                        <Text style={styles.votingCategoryTitle}>
                          Toughest Exercise
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.votingOptions}
                        >
                          {selectedWorkout.toughestExercises.map((exercise) => (
                            <Pressable
                              key={exercise.id}
                              style={[
                                styles.exerciseCard,
                                userVotes.toughest === exercise.id &&
                                  styles.selectedVoteCard,
                                exercise.hasVoted && styles.votedCard,
                              ]}
                              onPress={() =>
                                !exercise.hasVoted &&
                                handleVote('toughest', exercise.id)
                              }
                              disabled={exercise.hasVoted}
                            >
                              <Text style={styles.exerciseName}>
                                {exercise.name}
                              </Text>
                              <View style={styles.exerciseStats}>
                                <View style={styles.statItem}>
                                  <Ionicons
                                    name="flame"
                                    size={16}
                                    color={colors.semantic.error}
                                  />
                                  <Text style={styles.statText}>
                                    {exercise.votes}
                                  </Text>
                                </View>
                                <View style={styles.statItem}>
                                  <Text style={styles.difficultyText}>
                                    {exercise.difficulty}
                                  </Text>
                                </View>
                              </View>
                              {exercise.hasVoted && (
                                <BlurView
                                  intensity={80}
                                  style={styles.votedBadge}
                                >
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={colors.semantic.success}
                                  />
                                  <Text style={styles.votedText}>Voted</Text>
                                </BlurView>
                              )}
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>

                    </View>
                  </>
                )}

                {isFutureDate && (
                  <View style={styles.upcomingWorkout}>
                    <Text style={styles.upcomingTitle}>Workout Plan</Text>
                    {selectedWorkout.exercises.map((exercise, index) => (
                      <View key={index} style={styles.upcomingExercise}>
                        <Text style={styles.upcomingExerciseName}>
                          {exercise.name}
                        </Text>
                        <Text style={styles.upcomingExerciseDetails}>
                          {exercise.sets} × {exercise.reps}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <View style={styles.noWorkout}>
                <Ionicons name="calendar" size={48} color={colors.gray[300]} />
                <Text style={styles.noWorkoutText}>No workout scheduled</Text>
                <Text style={styles.noWorkoutSubtext}>
                  Take a rest day or join an available session
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContent: {
    padding: 20,
  },
  greeting: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginTop: 20,
  },
  subtitle: {
    fontSize: typography.size.lg,
    color: colors.primary.dark,
    opacity: 0.8,
    marginTop: 4,
  },
  calendarContainer: {
    backgroundColor: colors.primary.light,
    paddingVertical: spacing.md,
    marginTop: -spacing.xl,
    ...shadows.md,
  },
  monthHeader: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  monthText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  calendar: {
    paddingHorizontal: spacing.md,
  },
  calendarDay: {
    width: 64,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
  },
  selectedDay: {
    backgroundColor: colors.primary.dark,
  },
  today: {
    borderWidth: 2,
    borderColor: colors.primary.dark,
  },
  dayName: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  dayNumber: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  selectedDayText: {
    color: colors.primary.light,
  },
  workoutIndicator: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    marginTop: spacing.xs,
  },
  completedWorkout: {
    backgroundColor: colors.semantic.success,
  },
  plannedWorkout: {
    backgroundColor: colors.primary.dark,
  },
  votingPendingWorkout: {
    backgroundColor: colors.semantic.warning,
  },
  energyPoints: {
    fontSize: typography.size.xs,
    color: colors.semantic.warning,
    marginTop: 2,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  cardBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.dark + '20',
  },
  cardBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primary.dark + '20',
  },
  cardFooterText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  workoutSummary: {
    marginBottom: spacing.md,
  },
  workoutTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  workoutTime: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  energyPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.semantic.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  energyPointsText: {
    fontSize: typography.size.sm,
    color: colors.semantic.warning,
    fontWeight: typography.weight.medium as any,
  },
  exercisesList: {
    marginBottom: spacing.md,
  },
  exercisesTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  exerciseDetails: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  exercisePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsText: {
    fontSize: typography.size.sm,
    color: colors.semantic.warning,
    fontWeight: typography.weight.medium as any,
  },
  votingSection: {
    gap: spacing.md,
  },
  votingTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  votingCategory: {
    marginBottom: spacing.md,
  },
  votingCategoryTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  votingOptions: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  participantCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    width: 100,
    position: 'relative',
  },
  selectedVoteCard: {
    borderWidth: 2,
    borderColor: colors.primary.dark,
  },
  votedCard: {
    opacity: 0.7,
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  participantInitials: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
  },
  participantName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  voteCountText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
  exerciseCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginRight: spacing.sm,
    width: 150,
    position: 'relative',
  },
  exerciseStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.size.sm,
    color: colors.semantic.error,
    fontWeight: typography.weight.medium as any,
  },
  difficultyText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    fontWeight: typography.weight.semibold as any,
  },
  votedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success + '20',
  },
  votedText: {
    fontSize: typography.size.xs,
    color: colors.semantic.success,
    fontWeight: typography.weight.medium as any,
  },
  upcomingWorkout: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  upcomingTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  upcomingExercise: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  upcomingExerciseName: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  upcomingExerciseDetails: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  noWorkout: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noWorkoutText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginTop: spacing.sm,
  },
  noWorkoutSubtext: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});