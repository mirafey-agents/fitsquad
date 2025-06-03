import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHabitsHistory, setHabitCompletion, deleteHabit } from '@/utils/firebase';

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

interface HabitsContextType {
  habits: Habit[];
  loading: boolean;
  error: Error | null;
  refreshHabits: () => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: Date, completed: boolean) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const habitsData = await getHabitsHistory();
      
      const habitsWithHistory = habitsData?.map(habit => {
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

      setHabits(habitsWithHistory);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch habits'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const toggleHabitCompletion = async (habitId: string, date: Date, completed: boolean) => {
    try {
      await setHabitCompletion(habitId, date, !completed);
      await fetchHabits();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle habit completion'));
    }
  };

  const removeHabit = async (habitId: string) => {
    try {
      await deleteHabit(habitId);
      await fetchHabits();
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
    removeHabit,
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