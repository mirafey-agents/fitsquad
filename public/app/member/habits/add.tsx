'use client';

import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { FadeInUp } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { addHabit, getHabitIdeas } from '@/utils/firebase';

interface Habit {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export default function AddHabit() {
  const [habitIdeas, setHabitIdeas] = useState<Habit[]>([]);
  const [showCustomHabit, setShowCustomHabit] = useState(false);
  const [customHabit, setCustomHabit] = useState({
    title: '',
    description: '',
    icon: 'star',
  });

  useEffect(() => {
    const fetchHabitIdeas = async () => {
      const ideas = await getHabitIdeas();
      console.log("ideas", ideas)
      setHabitIdeas(ideas as Habit[]);
    }
    fetchHabitIdeas();
  }, []);

  const addNewHabit = async (title, description) => {
    const newHabit = await addHabit(title, description);
    console.log("Add habit", newHabit);
    router.push('/member/habits');
  };

  return (
    <View style={styles.container}>
      {!showCustomHabit ? (
        <ScrollView style={styles.modalScroll}>
          <Pressable
            style={styles.customHabitButton}
            onPress={() => setShowCustomHabit(true)}
          >
            <Ionicons name="add-circle" size={20} color={colors.primary.dark} />
            <Text style={styles.customHabitButtonText}>Create Custom Habit</Text>
          </Pressable>

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
                </Pressable>
              </Animated.View>
            ))}
          </View>
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
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={customHabit.description}
                onChangeText={(text) => setCustomHabit(prev => ({ ...prev, description: text }))}
                placeholder="Enter habit description"
                multiline
                numberOfLines={4}
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
              onPress={()=> {addNewHabit(customHabit.title, customHabit.description);}}
            >
              <Text style={styles.createHabitButtonText}>Create Habit</Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[100],
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: '600',
    color: colors.gray[900],
  },
  modalScroll: {
    flex: 1,
  },
  habitsList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  habitOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  habitOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  habitOptionInfo: {
    flex: 1,
  },
  habitOptionName: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  habitOptionDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
  },
  customHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[200],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  customHabitButtonText: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.gray[900],
    marginLeft: spacing.sm,
  },
  customHabitForm: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: '600',
    color: colors.gray[900],
  },
  input: {
    backgroundColor: colors.gray[200],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: typography.size.md,
    color: colors.gray[900],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  iconPicker: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[200],
  },
  selectedIcon: {
    backgroundColor: colors.primary.dark,
  },
  createHabitButton: {
    backgroundColor: colors.primary.dark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  createHabitButtonText: {
    fontSize: typography.size.md,
    fontWeight: '600',
    color: colors.primary.light,
  },
}); 