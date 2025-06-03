import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import ConfirmModal from './ConfirmModal';
import { useHabits } from '@/app/context/HabitsContext';

interface HabitCompletion {
  habitId: string;
  date: string;
}

interface Habit {
  id: string;
  title: string;
  description: string;
  completions: Array<HabitCompletion>;
  completionHistory?: Array<{ date: string; completed: boolean }>;
  streak?: number;
  completed?: boolean;
}

const HabitHistory = ({ history, onToggleCompletion }: { history: Array<{ date: string; completed: boolean }>, onToggleCompletion: (date: string) => void }) => {
  return (
    <View style={styles.historyContainer}>
      {history.slice(0, 7).map((day, index) => (
        <Pressable
          key={day.date}
          onPress={() => onToggleCompletion(day.date)}
          style={styles.historyDay}
        >
          <Ionicons
            name={'checkmark-circle'}
            size={16}
            color={day.completed ? colors.semantic.success : colors.gray[300]}
          />
        </Pressable>
      ))}
    </View>
  );
};

export default function HabitTracker({ preview = false }) {
  const router = useRouter();
  const { habits, loading, toggleHabitCompletion, removeHabit } = useHabits();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const handleToggleCompletion = async (habitId: string, date: string, completed: boolean) => {
    await toggleHabitCompletion(habitId, new Date(date), completed);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleDeleteHabit = async (habitId: string) => {
    setHabitToDelete(habitId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (habitToDelete) {
      await removeHabit(habitToDelete);
      setShowDeleteModal(false);
      setHabitToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setHabitToDelete(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.dark} />
      </View>
    );
  }

  if (preview) {
    return (
      <Animated.View entering={FadeInUp.delay(200)}>
        <View style={styles.habitsContainer}>
          <Text style={styles.habitsTitle}>Daily Habits</Text>
          <LinearGradient 
            start={{x:0, y:0}}
            end={{x:0, y:1}}
            colors={["#21262F", "#353D45"]}
            style={styles.habitsCard}
          >
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.habitsGrid}
            >
              {habits && habits.map((habit, index) => (
                <View key={habit.id} style={styles.habitItem}>
                  <Image
                    source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZD3WvyHBvM/yrhxmq6c_expires_30_days.png" }}
                    style={styles.habitIcon}
                  />
                  <Text style={styles.habitName}>{habit.title}</Text>
                  <View style={styles.habitStreak}>
                    <Image
                      source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/ZD3WvyHBvM/jk5qmujk_expires_30_days.png" }}
                      style={styles.streakIcon}
                    />
                    <Text style={styles.streakText}>{habit.streak || 0} days</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={styles.logHabitsButton}
              onPress={() => router.push('./habits', {relativeToDirectory: true})}
            >
              <Text style={styles.logHabitsText}>Log Your Habits</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Animated.View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.habitsContainer}>
        {Array.isArray(habits) && habits.map((habit, index) => (
          <Animated.View
            key={habit.id}
            entering={FadeInUp.delay(index * 100)}
            style={[styles.habitCard]}
          >
            <View style={styles.habitInfo}>
              <View style={styles.habitDetails}>
                <View style={styles.habitTitleRow}>
                  <Text style={[styles.habitName, { flex: 1, marginRight: spacing.md }]}>{habit.title}</Text>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDeleteHabit(habit.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.semantic.error} />
                  </Pressable>
                </View>
                <Text style={styles.habitDescription}>{habit.description}</Text>
              </View>
            </View>
            <View style={styles.habitStatus}>
              <View style={styles.streakContainer}>
                <Ionicons name="flame" size={16} color={colors.accent.coral} />
                <Text style={styles.streakText}>{habit.streak} days</Text>
              </View>
              <View style={styles.historyContainer}>
                <HabitHistory 
                  history={habit.completionHistory || []} 
                  onToggleCompletion={(date) => handleToggleCompletion(habit.id, date, habit.completionHistory?.find(h => h.date === date)?.completed || false)}
                />
              </View>
            </View>
          </Animated.View>
        ))}

        {(!habits || habits?.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="list" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No habits added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add up to 3 habits to track your daily progress
            </Text>
          </View>
        )}
      </View>

      {showDeleteModal && (
        <ConfirmModal
          displayText="Are you sure you want to remove this habit? Your streaks will be lost."
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
    padding: spacing.md,
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
    padding: spacing.md,
    gap: spacing.md,
  },
  habitItem: {
    alignItems: 'center',
    width: 120,
    marginRight: spacing.md,
  },
  habitIcon: {
    width: 48,
    height: 48,
    marginBottom: 8,
  },
  habitName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: 'center',
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
    width: 16,
    height: 16,
    marginRight: 4,
  },
  streakText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  logHabitsButton: {
    backgroundColor: colors.primary.dark,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  logHabitsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitCard: {
    backgroundColor: colors.gray[600],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  habitInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitDetails: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  habitTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    width: '100%',
  },
  habitDescription: {
    fontSize: typography.size.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  habitStatus: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  historyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  historyDay: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  emptyStateSubtext: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
  },
});