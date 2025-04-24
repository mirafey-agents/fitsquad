import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { deleteHabit, getHabitsHistory, setHabitCompletion } from '@/utils/firebase';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';


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
  const [selectedHabits, setSelectedHabits] = useState<Habit[]>([]);
  const [showHabitPicker, setShowHabitPicker] = useState(false);
  const [showCustomHabit, setShowCustomHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [customHabit, setCustomHabit] = useState({
    title: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);

  const fetchHabits = async () => {
    setIsLoading(true);
    try {
      const habits = await getHabitsHistory();
      console.log("habits", habits);

      const habitsWithHistory = habits?.map(habit => {
        const history = Array(30).fill(false).map((_, index) => {
          const date = new Date();
          date.setDate(date.getDate() - index);
          const dateStr = date.toISOString().split('T')[0];
          return {
            date: dateStr,
            completed: habit.completions.some(c => c.date === dateStr)
          };
        });

        let streak = 0;
        for (let i = 0; i < history.length; i++) {
          if (history[i].completed) {
            streak++;
          } else {
            break;
          }
        }

        return {
          ...habit,
          completionHistory: history,
          streak,
          completed: history[0].completed
        };
      });

      setSelectedHabits(habitsWithHistory);
    } catch (error) {
      console.error("Error fetching habits:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchHabits();
  }, []);

  const toggleCompletion = async (habitId: string, date: Date, completed: boolean) => {
    // console.log("toggleCompletion", habitId, date, completed);
    await setHabitCompletion(habitId, date, !completed);
    await fetchHabits();
    // Visual feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // const editHabit = (habitId: string) => {
  //   const habit = selectedHabits.find(h => h.id === habitId);
  //   if (!habit) return;
  //   setEditingHabit(habit);
  // };

  const handleSaveEdit = () => {
    if (editingHabit) {
      setSelectedHabits(prev =>
        prev.map(h =>
          h.id === editingHabit.id ? { ...h, name: editingHabit.title } : h
        )
      );
      setEditingHabit(null);
    }
  };

  const removeHabit = async (habitId: string) => {
    setHabitToDelete(habitId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete);
      await fetchHabits();
      setShowDeleteModal(false);
      setHabitToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setHabitToDelete(null);
  };

  const addCustomHabit = () => {
    if (!customHabit.title || !customHabit.description) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    const newHabit = {
      id: `custom-${Date.now()}`,
      ...customHabit,
      streak: 0,
      completed: false,
      category: 'custom',
    };

    setSelectedHabits(prev => [...prev, newHabit]);
    setCustomHabit({ title: '', description: '', icon: 'star' });
    setShowCustomHabit(false);
    setShowHabitPicker(false);
  };

  if (preview) {
    if(isLoading) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Daily Habits</Text>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.dark} />
          </View>
        </View>
      )
    }
    return (
      <>
      <View style={styles.habitsPreview}>
        {selectedHabits.slice(0, 2).map((habit, index) => (
          <Animated.View
            key={habit.id}
            entering={FadeInUp.delay(index * 100)}
            style={styles.habitPreviewCard}
          >
            <BlurView
              intensity={80}
              style={[
                styles.habitIcon,
                habit.completed && styles.completedHabitIcon,
              ]}
            >
              <Ionicons
                name={habit.icon as any}
                size={24}
                color={habit.completed ? colors.primary.light : colors.primary.dark}
              />
            </BlurView>
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

  if(isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary.dark} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.habitsContainer}>
        {selectedHabits?.map((habit, index) => (
          <Animated.View
            key={habit.id}
            entering={FadeInUp.delay(index * 100)}
            style={styles.habitCard}
          >
            <View style={styles.habitInfo}>
              <BlurView
                intensity={80}
                style={[
                  styles.habitIcon,
                  { marginRight: spacing.sm }
                ]}
              >
                <Ionicons
                  name={habit.icon as any}
                  size={24}
                  color={habit.completed ? colors.primary.light : colors.primary.dark}
                />
              </BlurView>
              <View style={styles.habitDetails}>
                <View style={styles.habitTitleRow}>
                  <Text style={styles.habitName}>{habit.title}</Text>
                  <Pressable
                    style={[styles.deleteButton, { position: 'absolute', right: 0, top: 0 }]}
                    onPress={() => removeHabit(habit.id)}
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
                  onToggleCompletion={(date) => toggleCompletion(habit.id, new Date(date), habit.completionHistory?.find(h => h.date === date)?.completed)}
                />
              </View>
            </View>
          </Animated.View>
        ))}

        {(!selectedHabits || selectedHabits?.length === 0) && (
          <View style={styles.emptyState}>
            <Ionicons name="list" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No habits added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add up to 3 habits to track your daily progress
            </Text>
          </View>
        )}
      </View>
      {editingHabit && (
        <BlurView intensity={80} style={styles.modalOverlay}>
          <View style={styles.editModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Habit</Text>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setEditingHabit(null)}
              >
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </Pressable>
            </View>
            <View style={styles.editForm}>
              <Text style={styles.inputLabel}>Habit Title</Text>
              <TextInput
                style={styles.input}
                value={editingHabit.title}
                onChangeText={(text) => setEditingHabit(prev => prev ? {...prev, name: text} : null)}
                placeholder="Enter habit title"
                placeholderTextColor={colors.gray[400]}
              />
              <Pressable 
                style={styles.saveEditButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveEditButtonText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      )}

      {showDeleteModal && (
        <BlurView intensity={80} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Remove Habit</Text>
              <Pressable
                style={styles.closeButton}
                onPress={handleDeleteCancel}
              >
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </Pressable>
            </View>
            <View style={styles.deleteModalContent}>
              <Text style={styles.deleteModalText}>
                Are you sure you want to remove this habit? Your streaks will be lost.
              </Text>
              <View style={styles.deleteModalActions}>
                <Pressable
                  style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                  onPress={handleDeleteCancel}
                >
                  <Text style={styles.deleteModalButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.deleteModalButton, styles.deleteModalButtonConfirm]}
                  onPress={handleDeleteConfirm}
                >
                  <Text style={[styles.deleteModalButtonText, styles.deleteModalButtonTextConfirm]}>
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </BlurView>
      )}
      <View style={styles.header}>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/member/habits/add')}
        >
          <Ionicons name="add" size={20} color={colors.primary.dark} />
          <Text style={styles.addButtonText}>Add Habit</Text>
        </Pressable>
      </View>
      
      {showHabitPicker && (
        <BlurView intensity={80} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Habit</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  setShowHabitPicker(false);
                  setShowCustomHabit(false);
                }}
              >
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </Pressable>
            </View>

            {!showCustomHabit ? (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.habitsList}>
                  {habitIdeas.map((habit, index) => (
                    <Animated.View
                      key={habit.id}
                      entering={FadeInUp.delay(index * 100)}
                    >
                      <Pressable
                        style={styles.habitOption}
                        onPress={() => addNewHabit(habit.title, habit.description)}
                      >
                        <BlurView intensity={80} style={styles.habitOptionIcon}>
                          <Ionicons
                            name={habit.icon as any}
                            size={24}
                            color={colors.primary.dark}
                          />
                        </BlurView>
                        <View style={styles.habitOptionInfo}>
                          <Text style={styles.habitOptionName}>{habit.title}</Text>
                          <Text style={styles.habitOptionDescription}>
                            {habit.description}
                          </Text>
                        </View>
                        <Ionicons
                          name="add-circle"
                          size={24}
                          color={colors.primary.dark}
                        />
                      </Pressable>
                    </Animated.View>
                  ))}
                </View>

                <Pressable
                  style={styles.customHabitButton}
                  onPress={() => setShowCustomHabit(true)}
                >
                  <Ionicons name="add-circle" size={20} color={colors.primary.dark} />
                  <Text style={styles.customHabitButtonText}>Create Custom Habit</Text>
                </Pressable>
              </ScrollView>
            ) : (
              <ScrollView style={styles.modalScroll}>
                <View style={styles.customHabitForm}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Habit Title</Text>
                    <TextInput
                      style={styles.input}
                      value={customHabit.title}
                      onChangeText={(text) => setCustomHabit(prev => ({ ...prev, title: text }))}
                      placeholder="Enter habit title"
                      placeholderTextColor={colors.gray[400]}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Description</Text>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={customHabit.description}
                      onChangeText={(text) => setCustomHabit(prev => ({ ...prev, description: text }))}
                      placeholder="Enter habit description"
                      placeholderTextColor={colors.gray[400]}
                      multiline
                      numberOfLines={3}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Icon</Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      style={styles.iconPicker}
                    >
                      {['star', 'heart', 'trophy', 'ribbon', 'flash', 'bulb', 'flag'].map((icon) => (
                        <Pressable
                          key={icon}
                          style={[
                            styles.iconOption,
                            customHabit.icon === icon && styles.selectedIcon
                          ]}
                          onPress={() => setCustomHabit(prev => ({ ...prev, icon }))}
                        >
                          <Ionicons
                            name={icon as any}
                            size={24}
                            color={customHabit.icon === icon ? colors.primary.light : colors.primary.dark}
                          />
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>

                  <Pressable
                    style={styles.createHabitButton}
                    onPress={addCustomHabit}
                  >
                    <Text style={styles.createHabitButtonText}>Create Habit</Text>
                  </Pressable>
                </View>
              </ScrollView>
            )}
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    minHeight: '100%',
    backgroundColor: colors.gray[100],
    padding: spacing.md,
    display: 'flex',
    flexDirection: 'column',
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
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitPreviewCard: {
    flex: 1,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...{
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
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
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.gray[900],
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
    borderRadius: borderRadius.sm,
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
    ...{
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
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
    ...{
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
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
  },
  cardFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});