import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  exercises_count: number;
}

interface ScheduleEntry {
  day: string;
  workoutPlanId: string | null;
}

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SquadCalendar() {
  const { id } = useLocalSearchParams();
  const [squad, setSquad] = useState<any>(null);
  const [schedule, setSchedule] = useState<Record<string, string | null>>({});
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSquadData();
    fetchWorkoutPlans();
  }, [id]);

  const fetchSquadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('squads')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setSquad(data);
      setSchedule(data?.schedule || {});
    } catch (error) {
      console.error('Error fetching squad:', error);
      setError('Failed to load squad data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutPlans = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          exercises_count:workout_plan_exercises(count)
        `)
        .eq('created_by', '00000000-0000-0000-0000-000000000000');

      if (fetchError) throw fetchError;
      setWorkoutPlans(data || []);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
    }
  };

  const handleAssignWorkout = async (day: string, workoutPlanId: string | null) => {
    try {
      const newSchedule = {
        ...schedule,
        [day]: workoutPlanId,
      };

      const { error: updateError } = await supabase
        .from('squads')
        .update({ schedule: newSchedule })
        .eq('id', id);

      if (updateError) throw updateError;
      setSchedule(newSchedule);
      setSelectedDay(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Squad Schedule</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading schedule...</Text>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.squadInfo}>
            <Text style={styles.squadName}>{squad?.name}</Text>
            <Text style={styles.squadDescription}>{squad?.description}</Text>
          </View>

          <View style={styles.calendar}>
            {WEEK_DAYS.map((day, index) => (
              <Animated.View
                key={day}
                entering={FadeInUp.delay(index * 100)}
              >
                <Pressable
                  style={[
                    styles.dayCard,
                    selectedDay === day && styles.selectedDay
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{day}</Text>
                    {schedule[day] && (
                      <Pressable
                        style={styles.removeButton}
                        onPress={() => handleAssignWorkout(day, null)}
                      >
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      </Pressable>
                    )}
                  </View>
                  {schedule[day] ? (
                    <View style={styles.assignedWorkout}>
                      <BlurView intensity={80} style={styles.workoutBadge}>
                        <Text style={styles.workoutName}>
                          {workoutPlans.find(wp => wp.id === schedule[day])?.name || 'Unknown Workout'}
                        </Text>
                      </BlurView>
                    </View>
                  ) : (
                    <Text style={styles.noWorkout}>No workout assigned</Text>
                  )}
                </Pressable>

                {selectedDay === day && (
                  <View style={styles.workoutSelector}>
                    <Text style={styles.selectorTitle}>Select Workout Plan</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.workoutList}
                    >
                      {workoutPlans.map((plan) => (
                        <Pressable
                          key={plan.id}
                          style={styles.workoutOption}
                          onPress={() => handleAssignWorkout(day, plan.id)}
                        >
                          <Text style={styles.workoutOptionName}>{plan.name}</Text>
                          <Text style={styles.workoutOptionDetails}>
                            {plan.exercises_count} exercises
                          </Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </Animated.View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  content: {
    padding: 20,
  },
  squadInfo: {
    marginBottom: 24,
  },
  squadName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  squadDescription: {
    fontSize: 16,
    color: '#64748B',
  },
  calendar: {
    gap: 16,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  removeButton: {
    padding: 4,
  },
  assignedWorkout: {
    flexDirection: 'row',
    gap: 8,
  },
  workoutBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  workoutName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
  },
  noWorkout: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  workoutSelector: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  workoutList: {
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  workoutOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 160,
  },
  workoutOptionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  workoutOptionDetails: {
    fontSize: 12,
    color: '#64748B',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
});