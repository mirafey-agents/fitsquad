import React, { View, Text, StyleSheet, ScrollView, Pressable, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useRootNavigationState } from 'expo-router';
import { getLoggedInUser } from '@/utils/supabase';
import { voteSession } from '@/utils/firebase';
import { Dimensions } from 'react-native';
import ConfirmModal from '@/components/ConfirmModal';
import { useSessions } from '@/app/context/SessionsContext';

import {
  colors,
  spacing,
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

const renderEnergyPoints = () => (
  <Animated.View entering={FadeInUp.delay(200)}>
    <View style={styles.energyContainer}>
      <Text style={styles.energyTitle}>My Weekly Energy Goals</Text>
      <LinearGradient 
        start={{x:0, y:0}}
        end={{x:0, y:1}}
        colors={["#21262F", "#353D45"]}
        style={styles.energyCard}
      >
        <ImageBackground 
          source={{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZD3WvyHBvM/ssn4fqst_expires_30_days.png"}} 
          resizeMode="stretch"
          style={styles.energyBackground}
        >
          <View style={styles.energyPointsRow}>
            <Text style={styles.energyPointsText}>345</Text>
            <Image
              source={{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZD3WvyHBvM/e3w1f9o8_expires_30_days.png"}}
              resizeMode="stretch"
              style={styles.energyIcon}
            />
          </View>
        </ImageBackground>
        <TouchableOpacity style={styles.energyDateButton}>
          <Text style={styles.energyDateText}>5th - 11th May</Text>
        </TouchableOpacity>
      </LinearGradient>
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
    <View style={styles.workoutContainer}>
      <Text style={styles.workoutTitle}>Workout Review</Text>
      <LinearGradient 
        start={{x:0, y:0}}
        end={{x:0, y:1}}
        colors={["#21262F", "#353D45"]}
        style={styles.workoutCard}
      >
        {selectedWorkout ? (
          <>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutHeaderText}>
                <Text style={styles.workoutName}>
                  {selectedWorkout?.session.title} - Group
                </Text>
                <Text style={styles.workoutTime}>
                  {new Date(selectedWorkout.start_time).toLocaleString('en-US', dateFormatOption)} with {selectedWorkout?.session.trainer.display_name}
                </Text>
              </View>
            </View>

            <View style={styles.workoutContent}>
              <View style={styles.workoutSummaryHeader}>
                <Text style={styles.workoutSummaryTitle}>Workout Summary</Text>
                {selectedWorkout?.status === 'completed' && (
                  <TouchableOpacity style={styles.completedBadge}>
                    <Text style={styles.completedText}>Completed</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.exercisesList}>
                {selectedWorkout?.exercises.map((exercise, index) => (
                  <View key={index} style={styles.exerciseItem}>
                    <Text style={styles.exerciseName}>
                      {exercise.name}
                    </Text>
                    <Text style={styles.exerciseDetails}>
                      {exercise.sets} × {exercise.reps}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {selectedWorkout?.status === 'completed' && (
              <LinearGradient 
                start={{x:0, y:0}}
                end={{x:0, y:1}}
                colors={["#21262F", "#353D45"]}
                style={styles.mvpSection}
              >
                <Text style={styles.mvpTitle}>MVP - Click to Vote</Text>
                <View style={styles.mvpGrid}>
                  {selectedWorkout.participants.map((participant) => (
                    <TouchableOpacity
                      key={participant.id}
                      style={styles.participantCard}
                      disabled={true}
                    >
                      <View style={styles.participantAvatar}>
                        <View style={styles.avatarBackground}>
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
                        {participant.display_name.split(' ')[0]} {participant.display_name.split(' ')[1]?.[0]}
                      </Text>
                      <TouchableOpacity 
                        style={styles.voteCount}
                        onPress={() => selectedWorkout.vote_mvp_user_id !== participant.id && handleVote('mvp', selectedWorkout.session.id, participant.id)}
                        disabled={selectedWorkout.vote_mvp_user_id === participant.id}
                      >
                        <Ionicons
                          name={selectedWorkout.vote_mvp_user_id === participant.id ? "star" : "star-outline"}
                          size={16}
                          color={selectedWorkout.vote_mvp_user_id === participant.id ? "#1CE90E" : "#FFFFFF"}
                        />
                        <Text style={styles.voteCountText}>
                          {participant.votesFor}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </View>
              </LinearGradient>
            )}
          </>
        ) : (
          <View style={styles.noWorkout}>
            <Ionicons name="calendar" size={48} color="#9BA9BD" />
            <Text style={styles.noWorkoutText}>No workout scheduled</Text>
            <Text style={styles.noWorkoutSubtext}>
              Take a rest day or join an available session
            </Text>
          </View>
        )}
      </LinearGradient>
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
  const [userData, setUserData] = useState<{
    user?: { id: string };
    profile: { display_name: string };
  }>({profile: {display_name: 'Guest'}});
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
        {renderEnergyPoints()}
        {renderWorkoutReview({
          selectedWorkout,
          isFutureDate,
          handleVote
        })}
        <HabitTracker preview={true}/>
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
    backgroundColor: "#060712",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#060712",
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 40,
    backgroundColor: "#060712",
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 8,
  },
  headerTextGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  greeting: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 4,
  },
  subtitle: {
    color: "#9AAABD",
    fontSize: 18,
    fontWeight: "bold",
  },
  calendarContainer: {
    backgroundColor: "#060712",
    paddingVertical: 0,
    marginTop: 0,
    marginBottom: 38,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 21,
  },
  monthText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  calendar: {
    paddingHorizontal: 21,
    paddingVertical: 0,
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
    backgroundColor: "#FFFFFF",
  },
  dayOfWeekPill: {
    color: "#9BA9BE",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 2,
  },
  selectedDayOfWeekPill: {
    color: "#060712",
  },
  dayNumberPill: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedDayNumberPill: {
    color: "#060712",
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: "#21262F",
    borderRadius: 24,
    padding: 20,
    marginBottom: 40,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginLeft: 12,
  },
  cardBadge: {
    backgroundColor: "#24433E",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cardBadgeText: {
    color: "#1CE90E",
    fontSize: 14,
    fontWeight: "bold",
  },
  workoutContainer: {
    marginBottom: 40,
  },
  workoutTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  workoutCard: {
    borderRadius: 24,
    paddingVertical: 30,
  },
  workoutHeader: {
    marginBottom: 37,
    marginLeft: 20,
  },
  workoutHeaderText: {
    marginBottom: 2,
  },
  workoutName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  workoutTime: {
    color: "#959C9F",
    fontSize: 14,
    fontWeight: "bold",
  },
  workoutContent: {
    marginHorizontal: 20,
  },
  workoutSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutSummaryTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 12,
    flex: 1,
  },
  completedBadge: {
    backgroundColor: "#24433E",
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  completedText: {
    color: "#1CE90E",
    fontSize: 14,
    fontWeight: "bold",
  },
  exercisesList: {
    gap: 10,
  },
  exerciseItem: {
    backgroundColor: "#3C4148",
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
  },
  exerciseName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  exerciseDetails: {
    color: "#959C9F",
    fontSize: 14,
    fontWeight: "bold",
  },
  mvpSection: {
    borderRadius: 24,
    paddingVertical: 20,
  },
  mvpTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    marginLeft: 20,
  },
  mvpGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
  },
  participantCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#3C4148",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginRight: 15,
    position: 'relative',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 10,
  },
  avatarBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  participantInitials: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  participantName: {
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 6,
  },
  voteCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voteCountText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  calendarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 2,
  },
  habitsContainer: {
    marginBottom: 40,
  },
  habitsTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  habitsCard: {
    borderRadius: 24,
    paddingVertical: 20,
  },
  habitsGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    marginLeft: 21,
  },
  habitItem: {
    alignItems: 'center',
    marginRight: 35,
  },
  habitIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  habitIconVertical: {
    width: 33,
    height: 80,
    marginBottom: 12,
  },
  habitName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#432424",
    borderRadius: 12,
    paddingVertical: 4,
    paddingLeft: 7,
    paddingRight: 9,
  },
  streakIcon: {
    width: 18,
    height: 18,
    marginRight: 5,
  },
  streakText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  logHabitsButton: {
    alignItems: "center",
    borderColor: "#FFFFFF",
    borderRadius: 100,
    borderWidth: 1,
    paddingVertical: 8,
    marginHorizontal: 21,
  },
  logHabitsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  noWorkout: {
    alignItems: 'center',
    padding: 40,
  },
  noWorkoutText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 12,
  },
  noWorkoutSubtext: {
    color: "#9AAABD",
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  energyContainer: {
    marginBottom: 40,
  },
  energyTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  energyCard: {
    alignItems: "center",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 114,
  },
  energyBackground: {
    alignItems: "flex-start",
    paddingVertical: 73,
    paddingHorizontal: 51,
    marginBottom: 20,
  },
  energyPointsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#003E85",
    borderRadius: 12,
    paddingVertical: 4,
    paddingLeft: 12,
    paddingRight: 7,
  },
  energyPointsText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
  energyIcon: {
    borderRadius: 12,
    width: 18,
    height: 18,
  },
  energyDateButton: {
    backgroundColor: "#4D545D",
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  energyDateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});