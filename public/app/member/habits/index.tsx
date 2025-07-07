import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHabits } from '@/app/context/HabitsContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors } from '@/constants/theme';
import ConfirmModal from '@/components/ConfirmModal';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  withSpring,
  useSharedValue,
  useAnimatedProps,
  interpolate,
  FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HabitsPage() {
  const { habits, loading, refreshHabits, removeHabit, toggleHabitCompletion } = useHabits();
  const [isEditMode, setIsEditMode] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [showMissedHabitModal, setShowMissedHabitModal] = useState(false);
  const [missedHabitData, setMissedHabitData] = useState<{
    habitId: string;
    previousDate: Date;
  } | null>(null);
  const [isCompletingHabit, setIsCompletingHabit] = useState(false);

  useEffect(() => {
    refreshHabits();
  }, []);

  useEffect(() => {
    console.log('Habits',habits);
  }, [habits]);

  // Helper to get icon for a habit (replace with your actual icon logic)
  const getHabitIcon = (habit) => {
    return <Ionicons name={habit.icon || "help-circle"} size={64} color="#fff" />;
  };

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

  const handleComplete = async (habitId: string, date: Date, currentState: boolean, completionId: string) => {
    setIsCompletingHabit(true);
    try {
      console.log('Habit Toggle', habitId, date, currentState, completionId);
      const p1 = new Promise(resolve => setTimeout(resolve, 1000));
      const p2 = await toggleHabitCompletion(habitId, date, currentState, completionId);
      await Promise.all([p1, p2]);
      await refreshHabits();
      setShowMissedHabitModal(false);
      setMissedHabitData(null);
    } finally {
      setIsCompletingHabit(false);
    }
  };

  const CircularProgress = ({ progress, size = 112, strokeWidth = 4, children, isCompleted }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const animatedProps = useAnimatedProps(() => {
      'worklet';
      const progressValue = interpolate(
        progress.value,
        [0, 1],
        [circumference, 0]
      );
      return {
        strokeDashoffset: progressValue,
      };
    });

    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isCompleted ? colors.semantic.success : "#353D45"}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
        </Svg>
        {!isCompleted && (
          <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.semantic.success}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={[circumference, circumference]}
              animatedProps={animatedProps}
              strokeLinecap="round"
            />
          </Svg>
        )}
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          {children}
        </View>
      </View>
    );
  };

  const HabitCard = ({ habit, onComplete }) => {
    const scale = useSharedValue(1);
    const progress = useSharedValue(0);
    const [showCheckmark, setShowCheckmark] = useState(false);
    const pressTimeout = useRef(null);
    
    useEffect(() => {
      return () => {
        if (pressTimeout.current) {
          clearTimeout(pressTimeout.current);
        }
      };
    }, []);

    const checkForMissedHabit = (h) => {
      if (
        h.completionHistory &&
        h.completionHistory.length >= 2 &&
        h.completionHistory[0].completed === false &&
        h.completionHistory[1].completed === false &&
        h.completionHistory[2].completed === true
      ) {
        return h.completionHistory[1].date;
      }
      return null;
    };

    const handlePressIn = () => {
      if (isEditMode) return;
      
      // Visual feedback
      scale.value = withSpring(0.95);
      progress.value = withTiming(1, { 
        duration: 1500,
      });
      
      // Start timer for completion
      pressTimeout.current = setTimeout(() => {
        // Check for missed habit before completing
        const previousDate = checkForMissedHabit(habit);
        if (previousDate) {
          setShowMissedHabitModal(true);
          setMissedHabitData({ habitId: habit.id, previousDate });
        } else {
          if (!habit.currentCompleted) {
            setShowCheckmark(true);
          }
          onComplete(habit.id, new Date(), habit.currentCompleted, habit.currentCompletionId);
          setShowCheckmark(false);
        }
        scale.value = withSpring(1);
      }, 1500);
    };

    const handlePressOut = () => {
      if (isEditMode) return;
      
      // Reset visual feedback
      scale.value = withSpring(1);
      progress.value = withTiming(0, { 
        duration: 150,
      });
      
      // Clear timer
      if (pressTimeout.current) {
        clearTimeout(pressTimeout.current);
        pressTimeout.current = null;
      }
    };

    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }]
      };
    });

    const cardStyle = useAnimatedStyle(() => {
      if (!isEditMode) return {};
      return {
        transform: [
          {
            rotate: withSequence(
              withTiming('-2deg', { duration: 100 }),
              withTiming('2deg', { duration: 100 }),
              withTiming('0deg', { duration: 100 })
            ),
          },
        ],
      };
    });

    return (
      <Animated.View style={[styles.habitCard, cardStyle]}>
        {isEditMode && (
          <Pressable 
            style={styles.deleteButton} 
            onPress={() => handleDeleteHabit(habit.id)}
          >
            <View style={styles.deleteCircle}>
              <Ionicons name="close" size={16} color="#fff" />
            </View>
          </Pressable>
        )}
        <Pressable 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={() => {}} 
          style={styles.iconWrapper}
        >
          <Animated.View style={animatedStyle}>
            <CircularProgress progress={progress} isCompleted={habit.currentCompleted}>
              <View style={[styles.iconCircle, habit.currentCompleted && styles.completedIconCircle]}>
                {showCheckmark ? (
                  <Animated.View
                    entering={FadeInUp.duration(300)}
                    style={styles.checkmarkContainer}
                  >
                    <Ionicons name="checkmark" size={64} color="#fff" />
                  </Animated.View>
                ) : (
                  <>
                    {getHabitIcon(habit)}
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={16} color={colors.accent.coral} />
                      <Text style={styles.streakText} selectable={false}>{habit.streak || 0}</Text>
                    </View>
                  </>
                )}
              </View>
            </CircularProgress>
          </Animated.View>
                    <Text style={styles.habitName} selectable={false}>{habit.title}</Text>
          <Text style={styles.habitDesc} selectable={false}>{habit.description}</Text>
        </Pressable>
      </Animated.View>
  );
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
        {habits.map((habit, idx) => (
          <HabitCard key={habit.id || idx} habit={habit} onComplete={handleComplete} />
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
                  style={[styles.modalButton, isCompletingHabit && styles.disabledButton]} 
                  onPress={() => handleComplete(missedHabitData!.habitId, missedHabitData!.previousDate, false, '')}
                  disabled={isCompletingHabit}
                >
                  {isCompletingHabit ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalButtonText}>
                      {missedHabitData?.previousDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                    </Text>
                  )}
                </Pressable>
                <Pressable 
                  style={[styles.modalButton, isCompletingHabit && styles.disabledButton]} 
                  onPress={() => handleComplete(missedHabitData!.habitId, new Date(), false, '')}
                  disabled={isCompletingHabit}
                >
                  {isCompletingHabit ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalButtonText}>
                      Today
                    </Text>
                  )}
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