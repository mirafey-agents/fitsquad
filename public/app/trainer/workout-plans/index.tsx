import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';
import ShareButton from '../../../components/ShareButton';

interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  created_at: string;
  exercises: {
    exercise: {
      name: string;
      module_type: string;
      level: string;
    };
    section: string;
  }[];
  squads: {
    squad: {
      name: string;
    };
  }[];
}

type Filter = 'all' | 'assigned' | 'unassigned';

export default function WorkoutPlans() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkoutPlans();
  }, []);

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('workout_plans')
        .select(`
          *,
          exercises:workout_plan_exercises(
            exercise:exercises(*),
            section
          ),
          squads:squad_workout_plans(
            squad:squads(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setWorkoutPlans(data || []);
    } catch (error) {
      console.error('Error fetching workout plans:', error);
      setError('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: string) => {
    Alert.alert(
      'Delete Workout Plan',
      'Are you sure you want to delete this workout plan? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Delete workout plan exercises first
              const { error: exercisesError } = await supabase
                .from('workout_plan_exercises')
                .delete()
                .eq('workout_plan_id', planId);

              if (exercisesError) throw exercisesError;

              // Delete squad assignments
              const { error: assignmentsError } = await supabase
                .from('squad_workout_plans')
                .delete()
                .eq('workout_plan_id', planId);

              if (assignmentsError) throw assignmentsError;

              // Finally delete the workout plan
              const { error: deleteError } = await supabase
                .from('workout_plans')
                .delete()
                .eq('id', planId);

              if (deleteError) throw deleteError;
              
              // Update local state
              setWorkoutPlans(prev => prev.filter(plan => plan.id !== planId));
              Alert.alert('Success', 'Workout plan deleted successfully');
            } catch (error) {
              console.error('Error deleting workout plan:', error);
              Alert.alert('Error', 'Failed to delete workout plan');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredPlans = workoutPlans
    .filter(plan => {
      const matchesSearch = plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          plan.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filter === 'all' ? true :
                          filter === 'assigned' ? plan.squads.length > 0 :
                          plan.squads.length === 0;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getDuration = (exercises: WorkoutPlan['exercises']) => {
    const totalExercises = exercises.length;
    const avgTimePerExercise = 3; // minutes
    return `${totalExercises * avgTimePerExercise} min`;
  };

  const getDifficulty = (exercises: WorkoutPlan['exercises']) => {
    const levels = exercises.map(e => e.exercise.level);
    const levelCounts = {
      Beginner: levels.filter(l => l === 'Beginner').length,
      Intermediate: levels.filter(l => l === 'Intermediate').length,
      Advanced: levels.filter(l => l === 'Advanced').length,
    };

    if (levelCounts.Advanced > levelCounts.Intermediate && levelCounts.Advanced > levelCounts.Beginner) {
      return 'Advanced';
    } else if (levelCounts.Intermediate > levelCounts.Beginner) {
      return 'Intermediate';
    }
    return 'Beginner';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Workout Plans</Text>
        <Pressable 
          style={styles.createButton}
          onPress={() => router.push('./create', {relativeToDirectory: true})}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workout plans"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <Pressable
            style={[
              styles.filterChip,
              filter === 'all' && styles.selectedFilter
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterText,
              filter === 'all' && styles.selectedFilterText
            ]}>All Plans</Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              filter === 'assigned' && styles.selectedFilter
            ]}
            onPress={() => setFilter('assigned')}
          >
            <Text style={[
              styles.filterText,
              filter === 'assigned' && styles.selectedFilterText
            ]}>Assigned</Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              filter === 'unassigned' && styles.selectedFilter
            ]}
            onPress={() => setFilter('unassigned')}
          >
            <Text style={[
              styles.filterText,
              filter === 'unassigned' && styles.selectedFilterText
            ]}>Unassigned</Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading workout plans...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredPlans.length === 0 ? (
          <Text style={styles.emptyText}>No workout plans found</Text>
        ) : (
          filteredPlans.map((plan, index) => {
            const duration = getDuration(plan.exercises);
            const difficulty = getDifficulty(plan.exercises);

            return (
              <Animated.View
                key={plan.id}
                entering={FadeInUp.delay(index * 100)}
              >
                <Pressable 
                  style={styles.planCard}
                  onPress={() => router.push(`./${plan.id}`, {relativeToDirectory: true})}
                >
                  <View style={styles.planHeader}>
                    <View>
                      <Text style={styles.planName}>{plan.name}</Text>
                      <Text style={styles.planDescription}>{plan.description}</Text>
                    </View>
                    <BlurView intensity={80} style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{difficulty}</Text>
                    </BlurView>
                  </View>

                  <View style={styles.planStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="fitness" size={16} color="#64748B" />
                      <Text style={styles.statText}>
                        {plan.exercises.length} exercises
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Ionicons name="time" size={16} color="#64748B" />
                      <Text style={styles.statText}>{duration}</Text>
                    </View>
                  </View>

                  {plan.squads.length > 0 && (
                    <View style={styles.assignedSquads}>
                      <Text style={styles.assignedTitle}>Assigned to:</Text>
                      <View style={styles.squadsList}>
                        {plan.squads.map((squad, i) => (
                          <View key={i} style={styles.squadBadge}>
                            <Text style={styles.squadText}>{squad.squad.name}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.cardActions}>
                    <Pressable 
                      style={styles.actionButton}
                      onPress={() => router.push(`./${plan.id}/edit`, {relativeToDirectory: true})}
                    >
                      <Ionicons name="create" size={20} color="#4F46E5" />
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </Pressable>
                    <Pressable 
                      style={styles.actionButton}
                      onPress={() => router.push(`./${plan.id}/assign`, {relativeToDirectory: true})}
                    >
                      <Ionicons name="people" size={20} color="#4F46E5" />
                      <Text style={styles.actionButtonText}>Assign</Text>
                    </Pressable>
                    <ShareButton
                      onShare={async () => {
                        const sections = plan.exercises.reduce((acc, curr) => {
                          const section = curr.section || 'module';
                          acc[section] = (acc[section] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>);

                        const sectionText = Object.entries(sections)
                          .map(([section, count]) => `${section}: ${count} exercises`)
                          .join('\n');

                        return `
🏋️‍♂️ Workout Plan: ${plan.name}

${plan.description}

Sections:
${sectionText}

Duration: ${duration}
Difficulty: ${difficulty}
Total Exercises: ${plan.exercises.length}

Join our fitness journey! 💪
`;
                      }}
                    />
                    <Pressable 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDelete(plan.id)}
                    >
                      <Ionicons name="trash" size={20} color="#EF4444" />
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                    </Pressable>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
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
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  selectedFilter: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
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
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#64748B',
    maxWidth: '80%',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
  planStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#64748B',
  },
  assignedSquads: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginBottom: 12,
  },
  assignedTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  squadsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  squadBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  squadText: {
    fontSize: 12,
    color: '#1E293B',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
});