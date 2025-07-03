import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useHabits } from '@/app/context/HabitsContext';

export function HabitsPreview() {
  const router = useRouter();
  const { habits, loading, refreshHabits } = useHabits();

  useEffect(() => {
    refreshHabits();
  }, []);

  if (loading) {
    return (
      <Animated.View entering={FadeInUp.delay(200)}>
        <View style={styles.habitsContainer}>
          <Text style={styles.habitsTitle}>Daily Habits</Text>
          <View style={styles.habitsCard}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent.coral} />
              <Text style={styles.loadingText}>Loading your habits...</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.delay(200)}>
      <View style={styles.habitsContainer}>
        <Text style={styles.habitsTitle}>Daily Habits</Text>
        <View style={styles.habitsCard}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitsGrid}
          >
            {habits && habits.map((habit, index) => (
              <View key={habit.id} style={styles.habitItem}>
                <Ionicons 
                  name={(habit.icon as any) || "help-circle"} 
                  size={48} 
                  color="#fff" 
                />
                <Text style={styles.habitName}>{habit.title}</Text>
                <View style={styles.habitStreak}>
                  <Ionicons name="flame" size={16} color={colors.accent.coral} />
                  <Text style={styles.streakText}>{habit.streak || 0} days</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.logHabitsButton}
            onPress={() => router.push('/member/habits')}
          >
            <Text style={styles.logHabitsText}>Log Habits</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#23262F',
  },
  loadingCard: {
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#23262F',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: spacing.md,
    fontWeight: "500",
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
  streakText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  logHabitsButton: {
    backgroundColor: '#2563FF',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logHabitsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
  