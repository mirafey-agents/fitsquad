import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '@/app/context/HabitsContext';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/constants/theme';

export default function HabitsPage() {
  const { habits, loading, refreshHabits } = useHabits();

  useEffect(() => {
    refreshHabits();
  }, []);
  useEffect(() => {
    console.log('habits: ', habits);
  }, [habits]);

  // Helper to get icon for a habit (replace with your actual icon logic)
  const getHabitIcon = (habit) => {
    // Example: return <Ionicons name="water" size={64} color="#fff" />;
    // Replace with your actual icon logic or image
    return <Ionicons name={habit.icon || "help-circle"} size={64} color="#fff" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.grid}>
        {habits.map((habit, idx) => (
          <View key={habit.id || idx} style={styles.habitCard}>
            <View style={styles.iconCircle}>
              {getHabitIcon(habit)}
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={16} color={colors.accent.coral} />
                <Text style={styles.streakText}>{habit.streak || 0}</Text>
              </View>
            </View>
            <Text style={styles.habitName}>{habit.title}</Text>
            <Text style={styles.habitDesc}>{habit.description}</Text>
          </View>
        ))}
        {/* Add Habit Button */}
        <Pressable style={styles.habitCard} onPress={() => router.push('/member/habits/add')}>
          <View style={styles.iconCircle}>
            <Ionicons name="add" size={64} color="#fff" />
          </View>
          <Text style={styles.habitName}>Add Habit</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  habitCard: {
    width: '44%',
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  streakBadge: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    transform: [{ translateX: -24 }],
    backgroundColor: '#23191b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  streakText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 14,
  },
  habitName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  habitDesc: {
    color: '#A1A1AA',
    fontSize: 14,
    textAlign: 'center',
  },
});