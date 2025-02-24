import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';

const WORKOUT_PLANS = [
  {
    id: '1',
    name: 'Full Body HIIT',
    description: 'High-intensity interval training targeting all major muscle groups',
    exercises: 8,
    duration: '45 min',
    difficulty: 'Intermediate',
    squads: ['Morning Warriors', 'Power Squad'],
  },
  {
    id: '2',
    name: 'Core & Strength',
    description: 'Focus on building core strength and overall muscle endurance',
    exercises: 6,
    duration: '30 min',
    difficulty: 'Beginner',
    squads: ['Morning Warriors'],
  },
];

export default function WorkoutPlans() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Workout Plans</Text>
        <Pressable 
          style={styles.createButton}
          onPress={() => router.push('/trainer-dashboard/workout-plans/create')}
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

      <ScrollView style={styles.content}>
        {WORKOUT_PLANS.map((plan, index) => (
          <Animated.View
            key={plan.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable 
              style={styles.planCard}
              onPress={() => router.push(`/trainer-dashboard/workout-plans/${plan.id}`)}
            >
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDescription}>{plan.description}</Text>
                </View>
                <BlurView intensity={80} style={styles.difficultyBadge}>
                  <Text style={styles.difficultyText}>{plan.difficulty}</Text>
                </BlurView>
              </View>

              <View style={styles.planStats}>
                <View style={styles.statItem}>
                  <Ionicons name="fitness" size={16} color="#64748B" />
                  <Text style={styles.statText}>{plan.exercises} exercises</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="time" size={16} color="#64748B" />
                  <Text style={styles.statText}>{plan.duration}</Text>
                </View>
              </View>

              <View style={styles.assignedSquads}>
                <Text style={styles.assignedTitle}>Assigned to:</Text>
                <View style={styles.squadsList}>
                  {plan.squads.map((squad) => (
                    <View key={squad} style={styles.squadBadge}>
                      <Text style={styles.squadText}>{squad}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.cardActions}>
                <Pressable 
                  style={styles.actionButton}
                  onPress={() => router.push(`/trainer-dashboard/workout-plans/${plan.id}/edit`)}
                >
                  <Ionicons name="create" size={20} color="#4F46E5" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>
                <Pressable 
                  style={styles.actionButton}
                  onPress={() => router.push(`/trainer-dashboard/workout-plans/${plan.id}/assign`)}
                >
                  <Ionicons name="people" size={20} color="#4F46E5" />
                  <Text style={styles.actionButtonText}>Assign</Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        ))}
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
  content: {
    padding: 20,
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
});