import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { router } from 'expo-router';

const PRESET_HABITS = {
  health: [
    {
      id: '1',
      name: 'Workout',
      icon: 'fitness',
      description: 'Complete daily workout routine',
    },
    {
      id: '2',
      name: 'Hydration',
      icon: 'water',
      description: 'Drink 3L of water',
    },
    {
      id: '3',
      name: 'Sleep',
      icon: 'moon',
      description: 'Sleep 7+ hours',
    },
  ],
  fitness: [
    {
      id: '4',
      name: 'Stretching',
      icon: 'body',
      description: '15 minutes of stretching',
    },
    {
      id: '5',
      name: 'Cardio',
      icon: 'heart',
      description: '30 minutes cardio',
    },
    {
      id: '6',
      name: 'Strength',
      icon: 'barbell',
      description: 'Strength training session',
    },
  ],
  diet: [
    {
      id: '7',
      name: 'Healthy Breakfast',
      icon: 'nutrition',
      description: 'Start day with protein-rich meal',
    },
    {
      id: '8',
      name: 'Meal Prep',
      icon: 'restaurant',
      description: 'Prepare healthy meals',
    },
    {
      id: '9',
      name: 'Track Calories',
      icon: 'calculator',
      description: 'Log daily food intake',
    },
  ],
  avoid: [
    {
      id: '10',
      name: 'No Junk Food',
      icon: 'fast-food',
      description: 'Avoid processed foods',
    },
    {
      id: '11',
      name: 'No Late Snacks',
      icon: 'moon',
      description: 'No eating after 8 PM',
    },
    {
      id: '12',
      name: 'No Sugary Drinks',
      icon: 'cafe',
      description: 'Avoid sodas and sugary beverages',
    },
  ],
};

interface Habit {
  id: string;
  name: string;
  icon: string;
  description: string;
  streak: number;
  completed: boolean;
  lastCompleted?: string;
  category?: string;
}

export default function HabitTracker({ preview = false }) {
  const [selectedHabits, setSelectedHabits] = useState<Habit[]>([]);
  const [showHabitPicker, setShowHabitPicker] = useState(false);
  const [showCustomHabit, setShowCustomHabit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof PRESET_HABITS>('health');
  const [editingHabit, setEditingHabit] = useState<{id: string, name: string} | null>(null);
  const [customHabit, setCustomHabit] = useState({
    name: '',
    description: '',
    icon: 'star',
  });

  useEffect(() => {
    // Load saved habits from storage in a real app
    setSelectedHabits(
      PRESET_HABITS.health.slice(0, 2).map(habit => ({
        ...habit,
        streak: Math.floor(Math.random() * 10),
        completed: false,
        lastCompleted: undefined,
      }))
    );
  }, []);

  const handleHabitPress = (habit: Habit) => {
    completeHabit(habit.id);
    
    // Visual feedback
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const completeHabit = (habitId: string) => {
    setSelectedHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          const today = new Date().toISOString().split('T')[0];
          const wasCompletedToday = h.lastCompleted === today;
          
          return {
            ...h,
            completed: !wasCompletedToday,
            streak: !wasCompletedToday ? h.streak + 1 : h.streak,
            lastCompleted: !wasCompletedToday ? today : undefined,
          };
        }
        return h;
      })
    );
  };

  const addHabit = (habit: typeof PRESET_HABITS[keyof typeof PRESET_HABITS][0]) => {
    if (selectedHabits.length >= 3) {
      Alert.alert('Maximum Habits', 'You can only track up to 3 habits at a time.');
      return;
    }

    if (selectedHabits.some(h => h.id === habit.id)) {
      Alert.alert('Already Added', 'This habit is already being tracked.');
      return;
    }

    setSelectedHabits(prev => [
      ...prev,
      {
        ...habit,
        streak: 0,
        completed: false,
      },
    ]);
    setShowHabitPicker(false);
  };

  const editHabit = (habitId: string) => {
    const habit = selectedHabits.find(h => h.id === habitId);
    if (!habit) return;
    setEditingHabit({ id: habitId, name: habit.name });
  };

  const handleSaveEdit = () => {
    if (editingHabit) {
      setSelectedHabits(prev =>
        prev.map(h =>
          h.id === editingHabit.id ? { ...h, name: editingHabit.name } : h
        )
      );
      setEditingHabit(null);
    }
  };

  const removeHabit = (habitId: string) => {
    Alert.alert(
      'Remove Habit',
      'Are you sure you want to remove this habit? Your streak will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setSelectedHabits(prev => prev.filter(h => h.id !== habitId));
          },
        },
      ]
    );
  };

  const addCustomHabit = () => {
    if (!customHabit.name || !customHabit.description) {
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
    setCustomHabit({ name: '', description: '', icon: 'star' });
    setShowCustomHabit(false);
    setShowHabitPicker(false);
  };

  if (preview) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Habits</Text>
          <Pressable
            style={styles.viewAllButton}
            onPress={() => router.push('/habits')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary.dark} />
          </Pressable>
        </View>

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
                <Text style={styles.habitName}>{habit.name}</Text>
                <View style={styles.streakContainer}>
                  <Ionicons name="flame" size={16} color={colors.accent.coral} />
                  <Text style={styles.streakText}>{habit.streak} days</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Habits</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => setShowHabitPicker(true)}
        >
          <Ionicons name="add" size={20} color={colors.primary.dark} />
          <Text style={styles.addButtonText}>Add Habit</Text>
        </Pressable>
      </View>

      <View style={styles.habitsContainer}>
        {selectedHabits.map((habit, index) => (
          <Animated.View
            key={habit.id}
            entering={FadeInUp.delay(index * 100)}
            style={styles.habitCard}
          >
            <Pressable
              style={styles.habitContent}
              onPress={() => handleHabitPress(habit)}
              onLongPress={() => removeHabit(habit.id)}
            >
              <View style={styles.habitInfo}>
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
                <View style={styles.habitDetails}>
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <Text style={styles.habitDescription}>{habit.description}</Text>
                  <View style={styles.habitActions}>
                    <Pressable
                      style={styles.editButton}
                      onPress={() => editHabit(habit.id)}
                    >
                      <Ionicons name="create" size={16} color={colors.primary.dark} />
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => removeHabit(habit.id)}
                    >
                      <Ionicons name="trash" size={16} color={colors.semantic.error} />
                    </Pressable>
                  </View>
                </View>
              </View>
              <View style={styles.habitStatus}>
                <View style={styles.streakContainer}>
                  <Ionicons name="flame" size={16} color={colors.accent.coral} />
                  <Text style={styles.streakText}>{habit.streak} days</Text>
                </View>
                <View style={styles.checkContainer}>
                  <Ionicons
                    name={habit.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                    size={32}
                    color={habit.completed ? colors.semantic.success : colors.gray[300]}
                  />
                </View>
              </View>
            </Pressable>
          </Animated.View>
        ))}

        {selectedHabits.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="list" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No habits added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add up to 3 habits to track your daily progress
            </Text>
          </View>
        )}
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
                <View style={styles.categoryTabs}>
                  {(Object.keys(PRESET_HABITS) as Array<keyof typeof PRESET_HABITS>).map((category) => (
                    <Pressable
                      key={category}
                      style={[
                        styles.categoryTab,
                        selectedCategory === category && styles.selectedCategoryTab
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[
                        styles.categoryTabText,
                        selectedCategory === category && styles.selectedCategoryTabText
                      ]}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.habitsList}>
                  {PRESET_HABITS[selectedCategory].map((habit, index) => (
                    <Animated.View
                      key={habit.id}
                      entering={FadeInUp.delay(index * 100)}
                    >
                      <Pressable
                        style={styles.habitOption}
                        onPress={() => addHabit(habit)}
                      >
                        <BlurView intensity={80} style={styles.habitOptionIcon}>
                          <Ionicons
                            name={habit.icon as any}
                            size={24}
                            color={colors.primary.dark}
                          />
                        </BlurView>
                        <View style={styles.habitOptionInfo}>
                          <Text style={styles.habitOptionName}>{habit.name}</Text>
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
                    <Text style={styles.inputLabel}>Habit Name</Text>
                    <TextInput
                      style={styles.input}
                      value={customHabit.name}
                      onChangeText={(text) => setCustomHabit(prev => ({ ...prev, name: text }))}
                      placeholder="Enter habit name"
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
              <Text style={styles.inputLabel}>Habit Name</Text>
              <TextInput
                style={styles.input}
                value={editingHabit.name}
                onChangeText={(text) => setEditingHabit(prev => prev ? {...prev, name: text} : null)}
                placeholder="Enter habit name"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
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
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  habitsContainer: {
    gap: spacing.md,
  },
  habitsPreview: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  habitCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  habitPreviewCard: {
    flex: 1,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  habitContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  habitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
  },
  completedHabitIcon: {
    backgroundColor: colors.primary.dark,
  },
  habitDetails: {
    flex: 1,
  },
  habitPreviewInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  habitDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
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
    backgroundColor: colors.semantic.error + '10',
    borderRadius: borderRadius.sm,
  },
  habitStatus: {
    alignItems: 'flex-end',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.accent.coral + '20',
    borderRadius: borderRadius.full,
  },
  streakText: {
    fontSize: typography.size.sm,
    color: colors.accent.coral,
    fontWeight: typography.weight.medium as any,
  },
  checkContainer: {
    marginTop: spacing.sm,
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
    backgroundColor: Platform.OS === 'web' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: Platform.OS === 'web' ? 9999999 : 99999,
    height: Platform.OS === 'web' ? '100vh' : '100%',
    width: '100%',
    pointerEvents: 'auto',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: Platform.OS === 'web' ? '85vh' : '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    position: 'relative',
    zIndex: Platform.OS === 'web' ? 10000000 : 100000,
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    } : {}),
    ...shadows.lg,
  },
  modalScroll: {
    flex: 1,
    position: 'relative',
    zIndex: Platform.OS === 'web' ? 10000001 : 100001,
    overflow: Platform.OS === 'web' ? 'auto' : 'scroll',
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
    zIndex: Platform.OS === 'web' ? 10000002 : 100002,
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
    backgroundColor: colors.primary.dark,
  },
  categoryTabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
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
    minHeight: Platform.OS === 'web' ? 400 : 'auto',
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
    textAlignVertical: Platform.OS === 'web' ? undefined : 'top',
    minHeight: 100,
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
    backgroundColor: colors.primary.dark,
  },
  createHabitButton: {
    backgroundColor: colors.primary.dark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createHabitButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
  },
  editModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  editForm: {
    padding: spacing.md,
  },
  saveEditButton: {
    backgroundColor: colors.primary.dark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveEditButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
  },
});