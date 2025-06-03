import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
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
  const [showHabitPicker, setShowHabitPicker] = useState(false);
  const [showCustomHabit, setShowCustomHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [customHabit, setCustomHabit] = useState({
    title: '',
    description: ''
  });
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

  if (preview) {
    if(loading) {
    return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.dark} />
        </View>
      );
    }
    return (
      <>
        <View style={styles.habitsPreview}>
          {habits.slice(0, 2).map((habit, index) => (
            <Animated.View
              key={habit.id}
              entering={FadeInUp.delay(index * 100)}
              style={[styles.habitPreviewCard]}
            >
              <View style={styles.habitPreviewInfo}>
                <Text style={styles.habitName}>{habit.title}</Text>
                <View style={styles.streakContainer}>
                  <Ionicons name="flame" size={16} color={colors.accent.coral} />
                  <Text style={styles.streakText}>{habit.streak} days</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardFooterText}>View more</Text>
        <Ionicons name="arrow-forward" size={20} color={colors.primary.dark}/>
      </View>
      </>
    );
  }

  if(loading) {
  return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.dark} />
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[100],
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginTop: spacing.md,
    width: '100%',
  },
  addButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
    textAlign: 'center',
  },
  habitsContainer: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  habitsPreview: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  habitCard: {
    backgroundColor: colors.gray[600],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitPreviewCard: {
    flex: 1,
    backgroundColor: colors.gray[600],
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  habitContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  habitInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedHabitIcon: {
    backgroundColor: colors.primary.dark,
  },
  habitDetails: {
    flex: 1,
    marginLeft: spacing.xs,
  },
  habitPreviewInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium,
    color: colors.primary.dark,
    flexShrink: 1,
  },
  habitDescription: {
    fontSize: typography.size.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  habitActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  editButton: {
    padding: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.sm,
  },
  deleteButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
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
  habitStatus: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    fontSize: typography.size.xs,
    color: colors.gray[700],
  },
  checkContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    height: '100%',
    width: '100%',
    pointerEvents: 'auto',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    position: 'relative',
    zIndex: 100000,
  },
  modalScroll: {
    position: 'relative',
    zIndex: 100001,
    overflow: 'scroll',
    WebkitOverflowScrolling: 'touch',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
    backgroundColor: '#FFFFFF',
    position: 'relative',
    zIndex: 100002,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  closeButton: {
    padding: spacing.sm,
  },
  categoryTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  categoryTab: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  selectedCategoryTab: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.text,
  },
  selectedCategoryTabText: {
    color: colors.primary.light,
  },
  habitsList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  habitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  habitOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  habitOptionInfo: {
    flex: 1,
  },
  habitOptionName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  habitOptionDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  customHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  customHabitButtonText: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  customHabitForm: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
    minHeight: 'auto',
    backgroundColor: '#FFFFFF',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: colors.primary.dark,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  iconPicker: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    marginRight: spacing.sm,
  },
  selectedIcon: {
    backgroundColor: colors.primary,
  },
  createHabitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createHabitButtonText: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.primary.light,
  },
  editModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
  },
  editForm: {
    padding: spacing.md,
  },
  saveEditButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveEditButtonText: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.primary.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  deleteModalContent: {
    padding: spacing.md,
  },
  deleteModalText: {
    fontSize: typography.size.md,
    color: colors.gray[700],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  deleteModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  deleteModalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteModalButtonCancel: {
    backgroundColor: colors.gray[100],
  },
  deleteModalButtonConfirm: {
    backgroundColor: colors.semantic.error,
  },
  deleteModalButtonText: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.gray[700],
  },
  deleteModalButtonTextConfirm: {
    color: colors.primary.light,
  },
  habitTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
    width: '100%',
  },
  cardFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooterText: {
    color: colors.gray[200],
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
});