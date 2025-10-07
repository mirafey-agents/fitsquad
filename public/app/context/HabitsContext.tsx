import React, { createContext, useContext, useState } from 'react';
import { getHabitsHistory, setHabitCompletion, deleteHabit, addHabit as addHabitFirebase } from '@/utils/firebase';

interface HabitCompletion {
  habitId: string;
  date: string;
  completionId?: string;
}

interface HabitCompletionResult {
  success: boolean;
  habitHistory: Habit[];
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  schedule?: string;
  icon?: string;
  completions: Array<HabitCompletion>;
  completionHistory?: Array<{ date: string; completed: boolean }>;
  streak?: number;
  completed?: boolean;
  currentCompleted?: boolean;
  currentCompletionId?: string;
}

interface HabitsContextType {
  habits: { [key: string]: Habit };
  loading: boolean;
  error: Error | null;
  refreshHabits: () => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: Date, completed: boolean, completionId: string) => Promise<Habit>;
  updateHabit: (habitId: string, update: Habit) => void;
  removeHabit: (habitId: string) => Promise<void>;
  addHabit: (title: string, description: string, selectedIcon: string, schedule: string) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);
const MAX_DAYS = 30;

// Generate schedule for the last 30 days based on crontab string
const generateScheduleFromCrontab = (crontab: string): any[] => {
  const schedule: any[] = [];
  const date = new Date();
  date.setHours(6, 0, 0, 0); // Always 6 AM
    
  // Parse crontab: "0 3 * * mon,wed,fri" or "0 3 * * *"
  const dayOfWeek = crontab?.split(' ')?.[4] || '*';
  
  // Generate dates for the last 30 days
  for (let i = 0; i < MAX_DAYS; i++) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    
    // Check if this day matches the schedule
    if (dayOfWeek === '*' || dayOfWeek.includes(dayName)) {
      schedule.push({date: new Date(date), completed: false, completionId: null});
    }
    date.setDate(date.getDate() - 1); 
  }
  
  return schedule;
};

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<{ [key: string]: Habit }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const calculateStreak = (habit: Habit) => {
    // Generate expected schedule dates based on crontab
    const history = generateScheduleFromCrontab(habit.schedule);
    // console.log("history", history);
    // Mark expected dates based on schedule
    for (const item of history) {
      const itemDate = item.date.toISOString().split('T')[0];
      const completion = habit.completions.find(c => {
        return (new Date(c.date)).toISOString().split('T')[0] === itemDate
      });

      if (completion) {
        item.completed = true;
        item.completionId = completion.completionId;
      }
    }

    let streak = 0;
    while (streak + 1 < history.length && history[streak+1]?.completed) {
      streak++;
    }

    if (history[0]?.completed) {
      streak++;
    }

    return {
      ...habit,
      completionHistory: history,
      streak,
      currentCompleted: history[0]?.completionId ? true : false,
      currentCompletionId: history[0]?.completionId
    };
  }

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const habitsData = await getHabitsHistory() as Habit[];
      const habitsObject: { [key: string]: Habit } = {};
      habitsData.forEach((habit: Habit) => {
        habitsObject[habit.id] = calculateStreak(habit);
      });
      setHabits(habitsObject);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch habits'));
    } finally {
      setLoading(false);
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: Date,
    completed: boolean, completionId: string) => {
    try {
      const result = await setHabitCompletion(habitId, date, !completed, completionId) as HabitCompletionResult;
      
      if (result.success && result.habitHistory) {
        // Update only this specific habit with the returned data
        const updatedHabit = result.habitHistory[0];
        if (updatedHabit) {
          setHabits(prevHabits => ({
            ...prevHabits,
            [habitId]: calculateStreak(updatedHabit)
          }));
        }
      }
      return result.habitHistory[0];
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle habit completion'));
    }
  };

  const addHabit = async (
    title: string, description: string,
    selectedIcon: string, schedule: string
  ) => {
    try {
      await addHabitFirebase(title, description, selectedIcon, schedule);
      await fetchHabits();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add habit'));
    }
  };

  const removeHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete habit'));
    }
  };

  const value = {
    habits,
    loading,
    error,
    refreshHabits: fetchHabits,
    toggleHabitCompletion,
    updateHabit: (habitId: string, update: Habit) => {
      setHabits(prevHabits => ({
        ...prevHabits,
        [habitId]: update
      }));
    },
    removeHabit,
    addHabit
  };

  return (
    <HabitsContext.Provider value={value}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
} 