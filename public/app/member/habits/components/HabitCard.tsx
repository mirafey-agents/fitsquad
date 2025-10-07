import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  withSequence,
  FadeInUp,
  useAnimatedProps,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '@/app/context/HabitsContext';
import { useHabits } from '@/app/context/HabitsContext';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '@/constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface HabitCardProps {
  habit: Habit;
  isEditMode: boolean;
  onMissedHabit: (habitId: string, previousDate: Date) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({ habit, isEditMode, onMissedHabit, onDelete }: HabitCardProps) {
  const { toggleHabitCompletion } = useHabits();
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);
  const pressTimeout = useRef<NodeJS.Timeout | null>(null);
  const [showCheckmark, setShowCheckmark] = React.useState(false);
  const [localHabit, setLocalHabit] = React.useState(habit);
  
  useEffect(() => {
    return () => {
      if (pressTimeout.current) {
        clearTimeout(pressTimeout.current);
      }
    };
  }, []);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalHabit(habit);
  }, [habit]);

  const checkForMissedHabit = (h: Habit) => {
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
    pressTimeout.current = setTimeout(async () => {
      progress.value = 0;
      // Check for missed habit before completing
      const previousDate = checkForMissedHabit(localHabit);
      if (previousDate) {
        onMissedHabit(localHabit.id, new Date(previousDate));
        return;
      }
      setShowCheckmark(!(localHabit.currentCompleted || false));
      try {
          const result = await toggleHabitCompletion(localHabit.id, new Date(), localHabit.currentCompleted || false, localHabit.currentCompletionId || '');
          console.log('result', result);
          // Clear checkmark after a short delay to show the completion
          setTimeout(() => setShowCheckmark(false), 500) as any;
          if (result) {
          setLocalHabit(result);
          }
      } catch (error) {
          console.error('Error toggling habit completion:', error);
      }
      
    
      scale.value = withSpring(1);
    }, 1500) as any;
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

  const getHabitIcon = (habit: Habit) => {
    return <Ionicons name={(habit.icon as any) || "help-circle"} size={64} color="#fff" />;
  };

  const CircularProgress = ({ progress, size = 112, strokeWidth = 4, children, isCompleted }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const animatedProps = useAnimatedProps(() => {
      const progressValue = isCompleted ? 1 - progress.value : progress.value;
      const strokeDashoffset = circumference - (progressValue * circumference);
      return {
        strokeDashoffset,
      };
    });

    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.semantic.success}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
        {children}
      </View>
    );
  };

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
          onPress={() => onDelete(localHabit.id)}
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
          <CircularProgress progress={progress} isCompleted={localHabit.currentCompleted}>
            <View style={styles.iconCircle}>
              {showCheckmark ? (
                <Animated.View
                  entering={FadeInUp.duration(300)}
                  style={styles.checkmarkContainer}
                >
                  <Ionicons name="checkmark" size={64} color="#fff" />
                </Animated.View>
              ) : (
                <>
                  {getHabitIcon(localHabit)}
                  <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={16} color={colors.accent.coral} />
                    <Text style={styles.streakText} selectable={false}>{localHabit.streak || 0}</Text>
                  </View>
                </>
              )}
            </View>
          </CircularProgress>
        </Animated.View>
        <Text style={styles.habitName} selectable={false}>{localHabit.title}</Text>
        <Text style={styles.habitDesc} selectable={false}>{localHabit.description}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  checkmarkContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.semantic.success,
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
});
