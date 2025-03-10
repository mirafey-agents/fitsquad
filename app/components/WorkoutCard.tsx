import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface WorkoutCardProps {
  workout: {
    id: string;
    time: string;
    title: string;
    trainer: string;
    participants: number;
    maxParticipants: number;
    intensity: string;
    duration: string;
    completed: boolean;
    color: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      votes: number;
      difficulty: number;
    }>;
  };
  index: number;
}

export default function WorkoutCard({ workout, index }: WorkoutCardProps) {
  const [showDetails, setShowDetails] = useState(false);

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
            color={workout.intensity === 'High' ? colors.semantic.error : colors.semantic.info} 
          />
          <Text style={[
            styles.intensityText,
            { color: workout.intensity === 'High' ? colors.semantic.error : colors.semantic.info }
          ]}>
            {workout.intensity}
          </Text>
        </View>
      </BlurView>

      <View style={styles.workoutInfo}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color={colors.primary.dark} />
            <Text style={styles.infoText}>{workout.duration}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={16} color={colors.primary.dark} />
            <Text style={styles.infoText}>
              {workout.participants}/{workout.maxParticipants}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color={colors.primary.dark} />
            <Text style={styles.infoText}>{workout.trainer}</Text>
          </View>
        </View>
      </View>

      {showDetails && (
        <View style={styles.exerciseList}>
          <Text style={styles.exerciseTitle}>Exercises</Text>
          {workout.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseItem}>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.sets} × {exercise.reps}
                </Text>
              </View>
              <View style={styles.exerciseStats}>
                <View style={styles.difficultyTag}>
                  <Text style={styles.difficultyValue}>{exercise.difficulty.toFixed(1)}</Text>
                </View>
                <View style={styles.voteTag}>
                  <Ionicons name="flame" size={14} color={colors.semantic.error} />
                  <Text style={styles.voteCount}>{exercise.votes}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <Pressable 
        style={styles.toggleButton}
        onPress={() => setShowDetails(!showDetails)}
      >
        <Text style={styles.toggleButtonText}>
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Text>
        <Ionicons 
          name={showDetails ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={colors.primary.dark} 
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  workoutCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  workoutTime: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  workoutTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  intensityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  intensityText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
  },
  workoutInfo: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    margin: spacing.md,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    margin: spacing.md,
    marginTop: 0,
    paddingTop: spacing.md,
  },
  exerciseTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
  exerciseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  difficultyTag: {
    backgroundColor: colors.primary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  difficultyValue: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  voteTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.semantic.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  voteCount: {
    fontSize: typography.size.xs,
    color: colors.semantic.error,
    fontWeight: typography.weight.medium as any,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  toggleButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
});