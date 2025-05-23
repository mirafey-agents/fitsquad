import React, { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRootNavigationState } from 'expo-router';
import Logo from '@/components/Logo';
import { getLoggedInUser } from '@/utils/supabase';
import { voteSession } from '@/utils/firebase';
import { Dimensions } from 'react-native';
import ConfirmModal from '@/components/ConfirmModal';
import { useSessions } from '@/app/context/SessionsContext';

import {
  colors,
  shadows,
  spacing,
  borderRadius,
  typography,
} from '@/constants/theme';
import HabitTracker from '@/components/HabitTracker';
import DailyChallenges from '@/components/DailyChallenges';
import {
  format,
  isSameDay,
  isAfter,
  addDays,
  eachDayOfInterval,
} from 'date-fns';

const dateFormatOption = {
  weekday: 'short' as const,
  month: 'short' as const,
  day: '2-digit' as const,
  hour: '2-digit' as const,
  minute: '2-digit' as const,
  hour12: true
};

const renderDailyHabits = () => (
  <Animated.View entering={FadeInUp.delay(200)}>
    <Pressable
      style={[styles.card, { backgroundColor: colors.gray[800] }]}
      onPress={() => router.push('./habits', {relativeToDirectory: true})}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Ionicons name="list" size={24} color={colors.primary.light} />
          <Text style={styles.cardTitle}>Daily Habits</Text>
        </View>
      </View>

      <HabitTracker preview={true} />
    </Pressable>
  </Animated.View>
);

const renderChallenges = () => (
  <Animated.View entering={FadeInUp.delay(200)}>
    <View style={[styles.card]}>
      <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Ionicons name="trophy" size={24} color={colors.primary.light} />
            <Text style={styles.cardTitle}>Challenges</Text>
          </View>
      </View>
      <DailyChallenges preview={true} />
    </View>
  </Animated.View>
);

const renderWorkoutReview = ({
  selectedWorkout,
  isFutureDate,
  handleVote
}: {
  selectedWorkout: any;
  isFutureDate: boolean;
  handleVote: (type: 'mvp' | 'toughest', sessionId: string, id: string) => void;
}) => (
  <Animated.View entering={FadeInUp.delay(300)}>
    <View
      style={[styles.card]}
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
        {selectedWorkout?.status === 'completed' && (
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
              {selectedWorkout?.session.title}
            </Text>
            <Text style={styles.workoutTime}>
              {new Date(selectedWorkout.start_time).toLocaleString('en-US', dateFormatOption)} with {selectedWorkout?.session.trainer.display_name}
            </Text>
            {/* {selectedWorkout.status === 'completed' && (
              <View style={styles.energyPointsContainer}>
                <Ionicons
                  name="flash"
                  size={20}
                  color={colors.semantic.warning}
                />
                <Text style={styles.energyPointsText}>
                  {selectedWorkout?.energyPoints} Energy Points Earned
                </Text>
              </View>
            )} */}
          </View>

          {selectedWorkout.session.status === 'completed' && (
            <>
              <View style={styles.exercisesList}>
                <Text style={styles.exercisesTitle}>Workout Summary</Text>
                {selectedWorkout?.exercises.map((exercise, index) => (
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
                {/* MVP Voting */}
                <View style={styles.votingCategory}>
                  <Text style={styles.votingCategoryTitle}>
                    MVP (Click to vote)
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.votingOptions}
                  >
                    {selectedWorkout.participants.map((participant) => (
                      <Pressable
                        key={participant.id}
                        style={[styles.participantCard]}
                        onPress={() =>
                          handleVote('mvp', selectedWorkout.session.id, participant.id)
                        }
                      >
                        {selectedWorkout.mvpUserId === participant.id && (
                            <View style={styles.crownContainer}>
                              <Ionicons name="trophy" size={20} color={colors.accent.coral} />
                            </View>
                        )}
                        <View style={styles.participantAvatar}>
                            <View style={styles.initialsContainer}>
                              <Text style={styles.participantInitials}>
                                {participant.display_name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </Text>
                            </View>
                          <View style={styles.avatarContainer}>
                            <Image 
                              source={{ uri: `https://storage.googleapis.com/fit-squad-club.firebasestorage.app/media/${participant.id}/profilepic/1/1-thumbnail` }}
                              style={styles.avatarImage}
                            />
                          </View>
                        </View>
                        <Text style={styles.participantName}>
                          {participant.display_name}
                        </Text>
                        <View style={styles.voteCount}>
                          <Ionicons
                            name="bookmark"
                            size={16}
                            color={colors.accent.coral}
                          />
                          <Text style={styles.voteCountText}>
                            {participant.votesFor}
                          </Text>
                        </View>
                        {selectedWorkout.vote_mvp_user_id === participant.id && (
                          <BlurView
                            intensity={80}
                            style={styles.votedBadge}
                          >
                            <Ionicons
                              name="bookmark"
                              size={16}
                              color={colors.semantic.success}
                            />
                          </BlurView>
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Toughest Exercise Voting */}
                {/* <View style={styles.votingCategory}>
                  <Text style={styles.votingCategoryTitle}>
                    Toughest Exercise
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.votingOptions}
                  >
                    {selectedWorkout.toughestExercises?.map((exercise) => (
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
                          handleVote('toughest', selectedWorkout.id, exercise.id)
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
                </View> */}
              </View>
            </>
          )}

          {selectedWorkout.status === "scheduled" && (
            <View style={styles.upcomingWorkout}>
              <Text style={styles.upcomingTitle}>Workout Plan</Text>
              {selectedWorkout?.exercises.map((exercise, index) => (
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
);

export default function Home() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingVote, setPendingVote] = useState<{
    type: 'mvp' | 'toughest';
    sessionId: string;
    id: string;
  } | null>(null);

  const rootNavigationState = useRootNavigationState()
  const navigatorReady = rootNavigationState?.key != null
  const { sessions, refreshSessions } = useSessions();

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
    refreshSessions();
    console.log('sessions: ', sessions);
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

  const selectedWorkout = sessions.find((session: any) => 
    new Date(session.start_time).toDateString() === selectedDate.toDateString());
  
  const isFutureDate = isAfter(
    selectedDate,
    new Date(new Date().setHours(23, 59, 59, 999))
  );

  const handleVote = async (type: 'mvp' | 'toughest', sessionId: string, id: string) => {
    setPendingVote({ type, sessionId, id });
    setShowConfirmModal(true);
  };

  const handleConfirmVote = async () => {
    if (!pendingVote) return;
    
    const result = await voteSession(pendingVote.sessionId, pendingVote.id);
    console.log('vote result: ', result);

    await refreshSessions();
    setShowConfirmModal(false);
    setPendingVote(null);
  };

  const handleCancelVote = () => {
    setShowConfirmModal(false);
    setPendingVote(null);
  };

  const getCalendarDays = () => {
    const start = addDays(CURRENT_DATE, -15);
    const end = addDays(CURRENT_DATE, 15);
    return eachDayOfInterval({ start, end });
  };

  const getWorkoutIndicator = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const workout = sessions.find((session: any) => 
      new Date(session.start_time).toDateString() === date.toDateString());
    if (workout) {
      return workout.status;
    }
    return null;
    // if (
    //   isBefore(date, new Date()) &&
    //   workout.completed &&
    //   workout.votingPending
    // ) {
    //   return 'votingPending';
    // } else if (workout.completed) {
    //   return 'completed';
    // } else {
    //   return 'planned';
    // }
  };

  const getEnergyPoints = (date: Date) => {
    return 0;
  };

  const scrollToSelectedDate = (date: Date) => {
    if (scrollViewRef.current) {
      const dayWidth = 64 + spacing.sm; // width of each day + margin
      const screenWidth = Dimensions.get('window').width;
      const days = getCalendarDays();
      const selectedIndex = days.findIndex(d => isSameDay(d, date));
      
      if (selectedIndex !== -1) {
        const offset = (selectedIndex * dayWidth) - (screenWidth / 2) + (dayWidth / 2);
        scrollViewRef.current.scrollTo({ x: offset, animated: true });
      }
    }
  };

  useEffect(() => {
    scrollToSelectedDate(selectedDate);
  }, [selectedDate]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.headerProfileRow}>
          <Image
            source={{ uri: `https://storage.googleapis.com/fit-squad-club.firebasestorage.app/media/${userData?.user?.id}/profilepic/1/1-thumbnail` }}
            style={styles.profileImage}
          />
          <View style={styles.headerTextGroup}>
            <Text style={styles.greeting} numberOfLines={1}>
              Hello {userData?.profile?.display_name || 'Guest'}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Let's crush today's goals!
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.monthHeaderRow}>
          <Text style={styles.monthText}>
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
        </View>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendar}
        >
          {getCalendarDays().map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const workout = sessions.find((session: any) => new Date(session.start_time).toDateString() === date.toDateString());
            let indicatorColor = null;
            if (workout) {
              if (workout.status === 'completed') {
                indicatorColor = colors.semantic.success;
              } else if (workout.status === 'scheduled' || workout.status === 'planned') {
                indicatorColor = colors.accent.coral;
              }
            }
            return (
              <Pressable
                key={date.toISOString()}
                style={[styles.calendarDayPill, isSelected && styles.selectedDayPill]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dayOfWeekPill, isSelected && styles.selectedDayOfWeekPill]}>
                  {format(date, 'EEE')}
                </Text>
                <Text style={[styles.dayNumberPill, isSelected && styles.selectedDayNumberPill]}>
                  {format(date, 'd')}
                </Text>
                {indicatorColor && (
                  <View style={[styles.calendarDot, { backgroundColor: indicatorColor }]} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {renderWorkoutReview({
          selectedWorkout,
          isFutureDate,
          handleVote
        })}
        {renderDailyHabits()}
        {renderChallenges()}
      </View>

      {showConfirmModal && pendingVote && (
        <ConfirmModal
          displayText={`Are you sure you want to vote for this ${pendingVote.type === 'mvp' ? 'participant' : 'exercise'}?`}
          onConfirm={handleConfirmVote}
          onCancel={handleCancelVote}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: colors.primary.dark,
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: colors.gray[700],
  },
  headerTextGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 120,
    marginTop: 4,
  },
  greeting: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
    color: colors.gray[200],
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.size.sm,
    color: colors.gray[200],
    opacity: 0.9,
    marginTop: 4,
    flexShrink: 1,
  },
  calendarContainer: {
    backgroundColor: colors.primary.dark,
    paddingVertical: spacing.md,
    marginTop: -spacing.xl,
    ...shadows.md,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  daysOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 2,
  },
  dayOfWeekText: {
    flex: 1,
    textAlign: 'center',
    color: colors.gray[400],
    fontSize: typography.size.xs,
    fontWeight: '500',
  },
  calendar: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  calendarDayPill: {
    width: 44,
    height: 56,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    backgroundColor: 'transparent',
    paddingVertical: 2,
  },
  selectedDayPill: {
    backgroundColor: colors.primary.light,
  },
  dayOfWeekPill: {
    color: colors.gray[300],
    fontSize: typography.size.xs,
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedDayOfWeekPill: {
    color: colors.gray[900],
  },
  dayNumberPill: {
    color: colors.gray[200],
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
  selectedDayNumberPill: {
    color: colors.gray[900],
  },
  content: {
    padding: spacing.md,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.md,
    backgroundColor: colors.gray[800],
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
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
  },
  cardBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.light + '20',
  },
  cardBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.light,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.primary.light + '20',
  },
  cardFooterText: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
  },
  workoutSummary: {
    marginBottom: spacing.md,
  },
  workoutTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
    marginBottom: spacing.xs,
  },
  workoutTime: {
    fontSize: typography.size.sm,
    color: colors.gray[400],
    marginBottom: spacing.sm,
  },
  energyPointsContainer: {
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
    fontSize: typography.size.xs,
    color: colors.semantic.warning,
    fontWeight: typography.weight.medium as any,
  },
  exercisesList: {
    marginBottom: spacing.md,
  },
  exercisesTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
    marginBottom: spacing.sm,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[600],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.light,
    marginBottom: spacing.xs,
  },
  exerciseDetails: {
    fontSize: typography.size.xs,
    color: colors.gray[400],
  },
  exercisePoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsText: {
    fontSize: typography.size.xs,
    color: colors.semantic.warning,
    fontWeight: typography.weight.medium as any,
  },
  votingSection: {
    gap: spacing.md,
  },
  votingTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
    marginBottom: spacing.sm,
  },
  votingCategory: {
    marginBottom: spacing.md,
  },
  votingCategoryTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[400],
    marginBottom: spacing.sm,
  },
  votingOptions: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  participantCard: {
    backgroundColor: colors.gray[600],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
    width: 100,
    position: 'relative',
  },
  selectedVoteCard: {
    borderWidth: 2,
    borderColor: colors.accent.coral,
  },
  votedCard: {
    opacity: 0.7,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[700],
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
    backgroundColor: colors.gray[700],
  },
  participantInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[400],
  },
  participantName: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.light,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gray[700],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  voteCountText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.light,
  },
  exerciseCard: {
    backgroundColor: colors.gray[800],
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
    fontSize: typography.size.xs,
    color: colors.semantic.error,
    fontWeight: typography.weight.medium as any,
  },
  difficultyText: {
    fontSize: typography.size.xs,
    color: colors.primary.light,
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
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  upcomingTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
    marginBottom: spacing.sm,
  },
  upcomingExercise: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  upcomingExerciseName: {
    fontSize: typography.size.xs,
    color: colors.primary.light,
  },
  upcomingExerciseDetails: {
    fontSize: typography.size.xs,
    color: colors.gray[400],
  },
  noWorkout: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noWorkoutText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
    marginTop: spacing.sm,
  },
  noWorkoutSubtext: {
    fontSize: typography.size.xs,
    color: colors.gray[400],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  crownContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.gray[800],
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
    shadowColor: colors.primary.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  monthText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.gray[200],
  },
  calendarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 2,
  },
});