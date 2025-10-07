import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '@/app/context/HabitsContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/constants/theme';
import ConfirmModal from '@/components/ConfirmModal';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import HabitCard from './components/HabitCard';


export default function HabitsPage() {
  const { habits, loading, refreshHabits, removeHabit, toggleHabitCompletion } = useHabits();
  const [isEditMode, setIsEditMode] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [showMissedHabitModal, setShowMissedHabitModal] = useState(false);
  const [missedHabitData, setMissedHabitData] = useState<{
    habitId: string;
    previousDate: Date;
  } | null>(null);

  useEffect(() => {
    refreshHabits();
  }, []);

  useEffect(() => {
    console.log('Habits', habits);
  }, [habits]);


  const handleDeleteHabit = (habitId: string) => {
    setHabitToDelete(habitId);
  };

  const handleDeleteConfirm = async () => {
    if (habitToDelete) {
      await removeHabit(habitToDelete);
      await refreshHabits();
      setHabitToDelete(null);
      setIsEditMode(false);
    }
  };

  const handleDeleteCancel = () => {
    setHabitToDelete(null);
    setIsEditMode(false);
  };

  const handleMissedHabitCancel = () => {
    setShowMissedHabitModal(false);
    setMissedHabitData(null);
  };

  const handleMissedHabitComplete = async (habitId: string, date: Date) => {
    try {
      await toggleHabitCompletion(habitId, date, false, '');
      await refreshHabits();
      setShowMissedHabitModal(false);
      setMissedHabitData(null);
    } catch (error) {
      console.error('Error completing missed habit:', error);
    }
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color={colors.primary.dark} />
  //     </View>
  //   );
  // }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Habits</Text>
        <Pressable onPress={() => setIsEditMode(!isEditMode)}>
          <LinearGradient 
            start={{x:0, y:0}}
            end={{x:0, y:1}}
            colors={["#21262F", "#353D45"]}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>{isEditMode ? 'Done' : 'Edit'}</Text>
          </LinearGradient>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {Object.values(habits).map((habit, idx) => (
          <HabitCard 
            key={habit.id || idx} 
            habit={habit} 
            isEditMode={isEditMode}
            onMissedHabit={(habitId, previousDate) => {
              setShowMissedHabitModal(true);
              setMissedHabitData({ habitId, previousDate });
            }}
            onDelete={handleDeleteHabit}
          />
        ))}
        {/* Add Habit Button */}
        <Pressable style={styles.habitCard} onPress={() => router.navigate('./add', {relativeToDirectory: true})}>
          <View style={styles.iconCircle}>
            <Ionicons name="add" size={64} color="#fff" />
          </View>
          <Text style={styles.habitName} selectable={false}>Add Habit</Text>
        </Pressable>
      </ScrollView>

      {habitToDelete && (
        <ConfirmModal
          displayText="Delete this habit? All history will be lost forever!"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {showMissedHabitModal && (
        <BlurView intensity={80} style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlay} onPress={handleMissedHabitCancel}>
            <Pressable style={styles.missedHabitModal} onPress={(e) => e.stopPropagation()}>
                          <Text style={styles.modalTitle}>
              You have missed the habit as of {missedHabitData?.previousDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
            </Text>
              <Text style={styles.modalSubtitle}>
                Which date do you want to mark complete?
              </Text>
              <View style={styles.modalButtons}>
                <Pressable 
                  style={styles.modalButton} 
                  onPress={() => handleMissedHabitComplete(missedHabitData!.habitId, missedHabitData!.previousDate)}
                >
                  <Text style={styles.modalButtonText}>
                    {missedHabitData?.previousDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                  </Text>
                </Pressable>
                <Pressable 
                  style={styles.modalButton} 
                  onPress={() => handleMissedHabitComplete(missedHabitData!.habitId, new Date())}
                >
                  <Text style={styles.modalButtonText}>
                    Today
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </BlurView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#353D45',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 0,
  },
  habitCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
  },
  deleteCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#21262F',
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
  completedIconCircle: {
    backgroundColor: 'rgba(28, 233, 14, 0.1)',
  },
  pressed: {
    opacity: 0.8,
  },
  checkmarkContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.semantic.success,
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Missed habit modal styles
  // Missed habit modal styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  missedHabitModal: {
    width: '80%',
    backgroundColor: '#21262F',
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#9AAABD',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#4A90E2',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
});