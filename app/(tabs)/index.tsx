import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';

const VOTE_TYPES = {
  MVP: 'mvp',
  SLACKER: 'slacker'
} as const;

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CURRENT_DATE = new Date();
const TRAINING_DAYS = ['Tue', 'Thu', 'Sat'];

const SCHEDULE_DATA = [
  {
    id: '1',
    time: '06:30 AM',
    title: 'Morning HIIT',
    trainer: 'Sarah Chen',
    participants: 8,
    maxParticipants: 12,
    intensity: 'High',
    duration: '45 min',
    completed: true,
    color: '#FFE1E1',
    participants: [
      {
        id: '1',
        name: 'Sarah Chen',
        mvpVotes: 5,
        slackerVotes: 0,
        performance: 95
      },
      {
        id: '2',
        name: 'Mike Ross',
        mvpVotes: 3,
        slackerVotes: 2,
        performance: 88
      },
      {
        id: '3',
        name: 'Alex Wong',
        mvpVotes: 4,
        slackerVotes: 1,
        performance: 92
      }
    ],
    participantCount: 8,
    exercises: [
      { 
        name: 'Burpees',
        sets: 3,
        reps: 15,
        votes: 8,
        difficulty: 9.2,
      },
      { 
        name: 'Mountain Climbers',
        sets: 3,
        reps: 30,
        votes: 3,
        difficulty: 7.5,
      },
      { 
        name: 'Jump Squats',
        sets: 4,
        reps: 20,
        votes: 5,
        difficulty: 8.3,
      },
    ],
  },
];

function CalendarStrip({ onDateSelect }: { onDateSelect: (date: Date) => void }) {
  const dates = [...Array(14)].map((_, index) => {
    const date = new Date();
    date.setDate(CURRENT_DATE.getDate() + index - 7);
    return date;
  });

  const [selectedDate, setSelectedDate] = useState(CURRENT_DATE);
  const [workouts, setWorkouts] = useState(SCHEDULE_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateSelect = (date: Date) => {
    setIsLoading(true);
    setError(null);
    
    setSelectedDate(date);
    
    try {
      // Simulate API call
      setTimeout(() => {
        if (TRAINING_DAYS.includes(WEEK_DAYS[date.getDay()])) {
          setWorkouts(SCHEDULE_DATA);
        } else {
          setWorkouts([]);
        }
        setIsLoading(false);
      }, 500);
    } catch (err) {
      setError('Failed to load workouts. Please try again.');
      setIsLoading(false);
    }
    
    onDateSelect(date);
  };

  return (
    <ScrollView
      horizontal
      initialScrollOffset={120}
      decelerationRate="fast"
      snapToInterval={56}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.calendarStrip}
      contentOffset={{ x: 120, y: 0 }}
    >
      {dates.map((date, index) => {
        const isToday = date.getDate() === CURRENT_DATE.getDate();
        const isSelected = date.getDate() === selectedDate.getDate();
        const dayName = WEEK_DAYS[date.getDay()];
        const isTrainingDay = TRAINING_DAYS.includes(dayName);

        return (
          <Pressable
            key={index}
            style={[
              styles.dateItem,
              { opacity: isTrainingDay ? 1 : 0.5 },
              isTrainingDay && styles.trainingDayItem,
              isSelected && styles.selectedDateItem
            ]}
            disabled={!isTrainingDay}
            onPress={() => handleDateSelect(date)}
          >
            <Text style={[
              styles.dayText,
              isSelected && styles.selectedDayText
            ]}>
              {WEEK_DAYS[date.getDay()]}
            </Text>
            <Text style={[
              styles.dateText,
              isSelected && styles.selectedDateText
            ]}>
              {date.getDate()}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function WorkoutCard({ workout, index }: { workout: typeof SCHEDULE_DATA[0]; index: number }) {
  const [showVoting, setShowVoting] = useState(false);
  const [selectedVoteType, setSelectedVoteType] = useState<typeof VOTE_TYPES[keyof typeof VOTE_TYPES] | null>(null);

  const toughestExercise = workout.exercises.reduce((prev, current) => 
    (current.votes > prev.votes) ? current : prev
  );
  const mvp = workout.participants.reduce((prev, current) => 
    (current.mvpVotes > prev.mvpVotes) ? current : prev
  );
  const slacker = workout.participants.reduce((prev, current) => 
    (current.slackerVotes > prev.slackerVotes) ? current : prev
  );

  const handleVote = (participantId: string) => {
    // Here you would implement the actual voting logic
    console.log(`Voted for ${participantId} as ${selectedVoteType}`);
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 200)}
      style={[styles.workoutCard, { backgroundColor: workout.color }]}
    >
      <BlurView intensity={80} style={styles.workoutHeader}>
        <View>
          <Text style={styles.workoutTime}>{workout.time}</Text>
          <Text style={styles.workoutTitle}>{workout.title}</Text>
        </View>
        <View style={[styles.intensityBadge, { backgroundColor: workout.intensity === 'High' ? '#FFE1E1' : '#E1F5FF' }]}>
          <Ionicons 
            name={workout.intensity === 'High' ? 'flame' : 'fitness'} 
            size={14} 
            color={workout.intensity === 'High' ? '#FF3B30' : '#32ADE6'} 
          />
          <Text style={[
            styles.intensityText,
            { color: workout.intensity === 'High' ? '#FF3B30' : '#32ADE6' }
          ]}>
            {workout.intensity}
          </Text>
        </View>
      </BlurView>

      <View style={styles.workoutInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#000000" />
            <Text style={styles.infoText}>{workout.duration}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color="#000000" />
            <Text style={styles.infoText}>
              {workout.participantCount}/{workout.maxParticipants}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color="#000000" />
            <Text style={styles.infoText}>{workout.trainer}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.highlightsSection}>
        <Pressable 
          style={[styles.highlightCard, selectedVoteType === VOTE_TYPES.MVP && styles.selectedHighlight]}
          onPress={() => setSelectedVoteType(VOTE_TYPES.MVP)}
        >
          <View style={styles.highlightHeader}>
            <Ionicons name="trophy" size={20} color="#F59E0B" />
            <Text style={styles.highlightTitle}>Squad MVP</Text>
          </View>
          <Text style={styles.highlightValue}>{mvp.name}</Text>
          <Text style={styles.highlightSubtext}>
            {mvp.mvpVotes} votes • Performance: {mvp.performance}%
          </Text>
        </Pressable>

        <Pressable 
          style={[styles.highlightCard, selectedVoteType === VOTE_TYPES.SLACKER && styles.selectedHighlight]}
          onPress={() => setSelectedVoteType(VOTE_TYPES.SLACKER)}
        >
          <View style={styles.highlightHeader}>
            <Ionicons name="cafe" size={20} color="#9333EA" />
            <Text style={styles.highlightTitle}>Squad Slacker</Text>
          </View>
          <Text style={styles.highlightValue}>{slacker.name}</Text>
          <Text style={styles.highlightSubtext}>
            {slacker.slackerVotes} votes • "Taking it easy" 😴
          </Text>
        </Pressable>
      </View>

      {selectedVoteType && (
        <View style={styles.votingPanel}>
          <Text style={styles.votingTitle}>
            Vote for {selectedVoteType === VOTE_TYPES.MVP ? 'MVP' : 'Slacker'}
          </Text>
          {workout.participants.map((participant) => (
            <Pressable
              key={participant.id}
              style={styles.participantVoteButton}
              onPress={() => handleVote(participant.id)}
            >
              <Text style={styles.participantName}>{participant.name}</Text>
              <View style={styles.voteCount}>
                <Text style={styles.voteCountText}>
                  {selectedVoteType === VOTE_TYPES.MVP 
                    ? `${participant.mvpVotes} votes`
                    : `${participant.slackerVotes} votes`
                  }
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.exerciseList}>
        <View style={styles.exerciseHeader}>
          <Text style={styles.exerciseTitle}>Exercise Breakdown</Text>
          {workout.completed && (
            <Pressable 
              style={styles.voteButton}
              onPress={() => setShowVoting(!showVoting)}
            >
              <Text style={styles.voteButtonText}>
                {showVoting ? 'Hide Voting' : 'Vote Now'}
              </Text>
            </Pressable>
          )}
        </View>

        {workout.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseItem}>
            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseDetails}>
                {exercise.sets} × {exercise.reps}
              </Text>
            </View>
            {showVoting && (
              <View style={styles.votingSection}>
                <Pressable style={styles.voteTag}>
                  <Ionicons name="flame" size={14} color="#FF3B30" />
                  <Text style={styles.voteCount}>{exercise.votes}</Text>
                </Pressable>
                <BlurView intensity={80} style={styles.difficultyTag}>
                  <Text style={styles.difficultyValue}>
                    {exercise.difficulty.toFixed(1)}
                  </Text>
                </BlurView>
              </View>
            )}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default function Schedule() {  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <LinearGradient
          colors={['#FFE1E1', '#FFE8D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerContent}
        >
          <Logo size="large" />
          <Text style={styles.greeting}>Welcome back, Alex!</Text>
          <Text style={styles.subtitle}>Let's crush today's workout! 💪</Text>
        </LinearGradient>
      </View>

      <View style={[styles.calendar, { backgroundColor: '#E1F5FF' }]}>
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarTitle}>Your Active Days</Text>
          <Text style={styles.calendarMonth}>November</Text>
        </View>
        <CalendarStrip onDateSelect={(date) => console.log('Selected date:', date)} />
      </View>

      <View style={styles.activities}>
        <View style={styles.activitiesHeader}>
          <Text style={styles.sectionTitle}>My Activities</Text>
          <Text style={styles.activitiesCount}>You have 3 planned activities</Text>
        </View>
        
        {SCHEDULE_DATA.map((workout, index) => (
          <WorkoutCard key={workout.id} workout={workout} index={index} />
        ))}
        
        <Pressable style={[styles.addActivityButton, { backgroundColor: '#FFE8D9' }]}>
          <Ionicons name="add" size={24} color="#FF3B30" />
          <Text style={[styles.addActivityText, { color: '#FF3B30' }]}>Add Activity</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    margin: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 2,
    gap: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#000000',
  },
  calendar: {
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  calendarMonth: {
    fontSize: 16,
    color: '#000000',
  },
  activities: {
    padding: 20,
  },
  activitiesHeader: {
    marginBottom: 16,
  },
  activitiesCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  addActivityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  addActivityText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  calendarStrip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dateItem: {
    width: 48,
    height: 65,
    marginHorizontal: 6,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedDateItem: {
    backgroundColor: '#000000',
    transform: [{ scale: 1.1 }],
  },
  trainingDayItem: {
    borderColor: '#000000',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 6,
    textAlign: 'center',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  selectedDateText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  workoutCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  workoutTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
    marginBottom: 4,
  },
  workoutTitle: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '600',
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  intensityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  workoutInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  highlightsSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: 12,
  },
  selectedHighlight: {
    borderColor: '#000000',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 6,
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  highlightSubtext: {
    fontSize: 12,
    color: '#8E8E93',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#000000',
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    margin: 16,
    marginTop: 0,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  voteButtonText: {
    marginLeft: 4,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#8E8E93',
  },
  votingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE1E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  voteCount: {
    color: '#000000',
    fontSize: 14,
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  difficultyValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  votingPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  votingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  participantVoteButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  participantName: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  voteCountText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});