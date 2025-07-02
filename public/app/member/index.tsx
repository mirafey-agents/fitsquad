import React, { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router, useRootNavigationState } from 'expo-router';
import { getLoggedInUser } from '@/utils/auth';
import { voteSession } from '@/utils/firebase';
import { Dimensions } from 'react-native';
import ConfirmModal from '@/components/ConfirmModal';
import { useSessions } from '@/app/context/SessionsContext';
import { HabitsPreview } from './components/HabitsPreview';
import Svg, { Circle } from 'react-native-svg';
import { Animated as RNAnimated, Easing } from 'react-native';
import MirrorPreview from './components/MirrorPreview';

import {
  spacing,
} from '@/constants/theme';

import {
  format,
  isSameDay,
  isAfter,
  addDays,
  eachDayOfInterval,
} from 'date-fns';
import { getProfilePicThumbNailURL } from '@/utils/mediaUtils';

const dateFormatOption = {
  weekday: 'short' as const,
  month: 'short' as const,
  day: '2-digit' as const,
  hour: '2-digit' as const,
  minute: '2-digit' as const,
  hour12: true
};

const AnimatedCircle = RNAnimated.createAnimatedComponent(Circle);

const renderEnergyPoints = (selectedWorkout: any) => {
  const total = Math.min(selectedWorkout?.total_energy_points || 0, 100);
  const percent = total;
  const percentDisplay = Math.round(percent);
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Animated value
  const animatedValue = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    RNAnimated.timing(animatedValue, {
      toValue: percent,
      duration: 800,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [percent]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const animatedColor = animatedValue.interpolate({
    inputRange: [0, 50, 100],
    outputRange: ['#FF3B30', '#FFD600', '#1CE90E'],
  });

  const [showInfo, setShowInfo] = useState(false);

  return (
    <Animated.View entering={FadeInUp.delay(200)}>
      <View style={styles.energyContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Text style={styles.energyTitle}>Fitness Goal</Text>
          <Ionicons
            name="help-circle-outline"
            size={20}
            color="#9AAABD"
            style={{ marginLeft: 6, marginTop: 2, alignSelf: 'flex-start' }}
            onPress={() => setShowInfo(true)}
          />
        </View>
        {showInfo && (
          <>
            <Pressable
              style={styles.energyInfoOverlay}
              onPress={() => setShowInfo(false)}
            />
            <View style={styles.energyInfoTooltip}>
              <Text style={styles.energyInfoText}>
                Fitness Goal is calculated based on the nature & intensity of your workout for your body's characteristics to help you achieve your fitness goals. Try to hit 100% at least 4 times a week.
              </Text>
              <Ionicons
                name="close"
                size={18}
                color="#fff"
                style={{ position: 'absolute', top: 6, right: 6 }}
                onPress={() => setShowInfo(false)}
              />
            </View>
          </>
        )}
        <View style={styles.energyCard}>
          <View style={styles.energyCircle}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#353D45"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={animatedColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            </Svg>
            <Text style={styles.energyPercentText}>
              {percentDisplay}%
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const renderWorkoutReview = ({
  selectedWorkout,
  isFutureDate,
  handleVote
}: {
  selectedWorkout: any;
  isFutureDate: boolean;
  handleVote: (type: 'mvp' | 'toughest', sessionId: string, id: string, name: string) => void;
}) => {
  if (!selectedWorkout) {
    return (
      <>
        <Text style={styles.workoutReviewTitle}>Workout Review</Text>
        <View style={styles.workoutReviewCard}>
          <View style={styles.workoutCardContent}>
            <Ionicons name="calendar" size={48} color="#9BA9BD" style={{ alignSelf: 'center', marginBottom: 8 }} />
            <Text style={styles.noWorkoutText}>No workout scheduled</Text>
            <Text style={styles.noWorkoutSubtext}>
              Take a rest day or join an available session
            </Text>
          </View>
        </View>
      </>
    );
  }
  return (
    <>
      <Text style={styles.workoutReviewTitle}>Workout Review</Text>
      <View style={styles.workoutReviewCard}>
        <View style={styles.workoutCardContent}>
          {/* Header row with title and chevron */}
          <View style={styles.workoutHeaderRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.workoutTitleRow}>
                <Text style={styles.workoutName}>{selectedWorkout?.session.title} - Group</Text>
                {selectedWorkout?.status === 'completed' && (
                  <View style={styles.completedBadgeRowInline}>
                    <Text style={styles.completedBadgeText}>Completed</Text>
                  </View>
                )}
              </View>
              <Text style={styles.workoutTime}>
                {new Date(selectedWorkout.start_time).toLocaleString('en-US', dateFormatOption)}
                <Text style={styles.workoutTrainer}>  with {selectedWorkout?.session.trainer.display_name}</Text>
              </Text>
            </View>
            <Pressable
              onPress={() => router.push(`/member/insights/${selectedWorkout.id}`)}
              style={styles.chevronButton}
            >
              <Ionicons name="chevron-forward" size={24} color="#9BA9BD" />
            </Pressable>
          </View>

          {/* Summary Section */}
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.workoutSummaryGrid}>
            <View style={styles.workoutSummaryGridRow}>
              <View style={styles.summaryPillRow}>
                <View style={[styles.summaryPillIcon, styles.summaryPillModule]}>
                  <Ionicons name="barbell" size={16} color="#60D394" />
                </View>
                <Text style={styles.summaryPillLabel}>Barbell</Text>
              </View>
              <View style={styles.summaryPillRow}>
                <View style={[styles.summaryPillIcon, styles.summaryPillLevel]}>
                  <Text style={styles.summaryPillLevelNumber}>2</Text>
                </View>
                <Text style={styles.summaryPillLabel}>Intermediate</Text>
              </View>
            </View>
            <View style={styles.workoutSummaryGridRow}>
              <View style={styles.summaryPillRow}>
                <View style={[styles.summaryPillIcon, styles.summaryPillType]}>
                  <Ionicons name="flash" size={16} color="#A259FF" />
                </View>
                <Text style={styles.summaryPillLabel}>Strength</Text>
              </View>
              <View style={styles.summaryPillRow}>
                <View style={[styles.summaryPillIcon, styles.summaryPillEnergy]}>
                  <Ionicons name="flame" size={16} color="#FF7A59" />
                </View>
                <Text style={styles.summaryPillLabel}>{selectedWorkout?.total_energy_points || 0} Points</Text>
              </View>
            </View>
          </View>

          {/* MVP Section: Only show if more than one participant */}
          {selectedWorkout.participants && selectedWorkout.participants.length > 1 && (
            <>
              <Text style={styles.sectionTitle}>MVP</Text>
              <View style={styles.mvpHeaderRow}>
                <Text style={styles.mvpSubtitle}>Cast Your Vote</Text>
              </View>
              <View style={styles.mvpAvatarsRow}>
                {selectedWorkout.participants.map((participant, idx) => {
                  const voted = selectedWorkout.vote_mvp_user_id === participant.id;
                  const isMVP = selectedWorkout.mvpUserId === participant.id;
                  return (
                    <Pressable
                      key={participant.id}
                      style={styles.mvpAvatarContainer}
                      onPress={() => {
                        handleVote('mvp', selectedWorkout.session.id, participant.id, participant.display_name);
                      }}
                    >
                      {/* Star icon at 4 o'clock if this is the MVP */}
                      {isMVP && (
                        <Ionicons name="star" size={28} color="#FFD600" style={styles.mvpStarIconFourOClock} />
                      )}
                      <View style={styles.mvpAvatarStack}>
                        <View style={styles.mvpAvatarFallback}>
                          <Text style={styles.mvpAvatarInitials}>{getInitials(participant.display_name)}</Text>
                        </View>
                        <Image
                          source={{ uri: getProfilePicThumbNailURL(participant.id) }}
                          style={voted ? [styles.mvpAvatarImage, styles.mvpAvatarVoted] : styles.mvpAvatarImage}
                        />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>
      </View>
    </>
  );
};

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  return parts[0][0] + (parts[1]?.[0] || '');
}

export default function Home() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingVote, setPendingVote] = useState<{
    type: 'mvp' | 'toughest';
    sessionId: string;
    id: string;
    name: string;
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

  const handleVote = async (type: 'mvp' | 'toughest', sessionId: string, id: string, name: string) => {
    setPendingVote({ type, sessionId, id, name });
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
      <View style={styles.headerBarNew}>
        <Image
          source={{ uri: getProfilePicThumbNailURL(userData?.user?.id) }}
          style={styles.profileImageNew}
        />
        <View style={styles.headerTextGroupNew}>
          <Text style={styles.greetingNew} numberOfLines={1}>
            Hello {userData?.profile?.display_name || 'Guest'}
          </Text>
          <Text style={styles.subtitleNew} numberOfLines={1}>
            Let's crush today's goals!
          </Text>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <Text style={styles.monthText}>{format(selectedDate, 'MMMM yyyy')}</Text>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendar}
        >
          {getCalendarDays().map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const workout = sessions.find((session) => new Date(session.start_time).toDateString() === date.toDateString());
            // Outer pill style
            let outerPillStyle = styles.outerPill;
            let dayTextStyle = styles.outerPillDayText;
            // Inner date pill style
            let innerDatePillStyle = styles.innerDatePill;
            let innerDateTextStyle = styles.innerDateText;
            if (workout) {
              if (workout.status === 'completed') {
                innerDatePillStyle = { ...styles.innerDatePill, ...styles.innerDatePillCompleted };
                innerDateTextStyle = { ...styles.innerDateText, ...styles.innerDateTextCompleted };
              } else if (workout.status === 'scheduled' || workout.status === 'planned') {
                innerDatePillStyle = { ...styles.innerDatePill, ...styles.innerDatePillScheduled };
                innerDateTextStyle = { ...styles.innerDateText, ...styles.innerDateTextScheduled };
              }
            }
            if (isSelected) {
              outerPillStyle = { ...styles.outerPill, ...styles.outerPillSelected };
              innerDatePillStyle = { ...innerDatePillStyle, ...styles.innerDatePillSelected };
              dayTextStyle = { ...styles.outerPillDayText, ...styles.outerPillDayTextSelected };
              innerDateTextStyle = { ...innerDateTextStyle, ...styles.innerDateTextSelected };
            }
            return (
              <Pressable
                key={date.toISOString()}
                style={styles.calendarDayPill}
                onPress={() => setSelectedDate(date)}
              >
                <View style={outerPillStyle}>
                  <Text style={dayTextStyle}>{format(date, 'EEE')}</Text>
                  <View style={innerDatePillStyle}>
                    <Text style={innerDateTextStyle}>{format(date, 'd')}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {renderEnergyPoints(selectedWorkout)}
        {renderWorkoutReview({
          selectedWorkout,
          isFutureDate,
          handleVote: (type, sessionId, id, name) => { handleVote(type, sessionId, id, name); }
        })}
        <MirrorPreview />
        <HabitsPreview />
      </View>

      {showConfirmModal && pendingVote && (
        <ConfirmModal
          displayText={`Are you sure you want to vote for ${pendingVote.name} as ${pendingVote.type} for this session?`}
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
  headerBarNew: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 20,
    backgroundColor: "#060712",
  },
  profileImageNew: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerTextGroupNew: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  greetingNew: {
    color: "#FFFFFF",
    fontSize: 12,
    marginBottom: 2,
  },
  subtitleNew: {
    color: "#9AAABD",
    fontSize: 16,
    fontWeight: "bold",
  },
  menuIconNew: {
    marginLeft: 12,
  },
  calendarContainer: {
    backgroundColor: "#060712",
    paddingVertical: 0,
    marginTop: 0,
    marginBottom: 24,
  },
  monthText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 21,
    marginBottom: 8,
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
    backgroundColor: "#2563FF",
  },
  dayOfWeekPill: {
    color: "#9BA9BE",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  selectedDayOfWeekPill: {
    color: "#FFFFFF",
  },
  dayNumberPill: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  selectedDayNumberPill: {
    color: "#FFFFFF",
  },
  calendarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 2,
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
  workoutReviewCard: {
    backgroundColor: '#23262F',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  workoutReviewTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  workoutCardContent: {
    // The inner card content (header, summary, etc.)
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  workoutTrainer: {
    color: '#9AAABD',
    fontSize: 14,
    marginTop: 2,
  },
  chevronButton: {
    padding: 4,
    marginLeft: 8,
  },
  completedBadgeRowInline: {
    backgroundColor: '#24433E',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginLeft: 10,
  },
  completedBadgeText: {
    color: '#1CE90E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  workoutSummaryGrid: {
    marginTop: 8,
  },
  workoutSummaryGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryPillRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  summaryPillIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#23262F',
  },
  summaryPillModule: {
    backgroundColor: '#1A2C22',
  },
  summaryPillLevel: {
    backgroundColor: '#393A1A',
  },
  summaryPillType: {
    backgroundColor: '#2B1A3A',
  },
  summaryPillEnergy: {
    backgroundColor: '#2B2321',
  },
  summaryPillLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  summaryPillLevelNumber: {
    color: '#FFD600',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
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
    textAlign: 'center',
  },
  noWorkoutSubtext: {
    color: "#9AAABD",
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  energyContainer: {
    marginBottom: 40,
    position: 'relative',
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
    backgroundColor: "#23262F",
    marginBottom: 8,
  },
  energyCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  energyCircleBg: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: '#23262F',
  },
  energyCircleFg: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: '#2563FF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  energyPercentText: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 120,
    height: 120,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'System',
    includeFontPadding: false,
    lineHeight: 120,
    zIndex: 2,
  },
  energyDateButton: {
    backgroundColor: "#4D545D",
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  energyDateText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  energyInfoTooltip: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: '#23262F',
    borderRadius: 12,
    padding: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  energyInfoText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
    paddingRight: 24,
  },
  energyInfoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.01)',
    zIndex: 9,
  },
  outerPill: {
    backgroundColor: '#181A20',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    marginHorizontal: 4,
    minWidth: 38,
  },
  outerPillSelected: {
    backgroundColor: '#2563FF',
  },
  outerPillDayText: {
    color: '#9BA9BE',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  outerPillDayTextSelected: {
    color: '#fff',
  },
  innerDatePill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#23262F',
    marginBottom: 2,
  },
  innerDatePillCompleted: {
    backgroundColor: '#1CE90E',
  },
  innerDatePillScheduled: {
    backgroundColor: '#FF7A59',
  },
  innerDatePillSelected: {
    backgroundColor: '#fff',
  },
  innerDateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  innerDateTextCompleted: {
    color: '#060712',
  },
  innerDateTextScheduled: {
    color: '#fff',
  },
  innerDateTextSelected: {
    color: '#2563FF',
  },
  mvpCard: {
    backgroundColor: '#23262F',
    borderRadius: 24,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mvpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mvpTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  mvpSubtitle: {
    color: '#9AAABD',
    fontSize: 13,
    flex: 1,
  },
  mvpAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  mvpAvatarContainer: {
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    height: 80,
  },
  mvpStarIconFourOClock: {
    position: 'absolute',
    // 4 o'clock: bottom right, about 45deg from center
    left: '75%', // 75% of width
    top: '75%',  // 75% of height
    marginLeft: -14, // half icon size
    marginTop: -14,  // half icon size
    zIndex: 10,
  },
  mvpAvatarStack: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  mvpAvatarVoted: {
    borderWidth: 3,
    borderColor: '#1CE90E',
  },
  mvpAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mvpAvatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mvpAvatarInitials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#9AAABD',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 8,
  },
});