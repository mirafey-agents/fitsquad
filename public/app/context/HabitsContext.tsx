import React, { createContext, useContext, useState, useEffect } from 'react';
import { getHabitsHistory, setHabitCompletion, deleteHabit, addHabit as addHabitFirebase } from '@/utils/firebase';

interface HabitCompletion {
  habitId: string;
  date: string;
  completionId?: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string;
  icon?: string;
  completions: Array<HabitCompletion>;
  completionHistory?: Array<{ date: string; completed: boolean }>;
  streak?: number;
  completed?: boolean;
  currentCompleted?: boolean;
  currentCompletionId?: string;
}

interface HabitsContextType {
  habits: Habit[];
  loading: boolean;
  error: Error | null;
  refreshHabits: () => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: Date, completed: boolean, completionId: string) => Promise<void>;
  removeHabit: (habitId: string) => Promise<void>;
  addHabit: (title: string, description: string, selectedIcon: string) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);
const MAX_HISTORY = 30;

// Helper function to get start of day in local timezone
const getStartOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHabits = async () => {
    setLoading(true);
    try {
      const habitsData = await getHabitsHistory() as Habit[];
      const habitsWithHistory = habitsData?.map(habit => {
        // Get start of today in local timezone
        const today = getStartOfDay(new Date());
        const history = Array(MAX_HISTORY).fill({
          completedDate: null,
          completed: false,
          completionId: null
        });

        for (const c of habit.completions) {
          // Convert completion date to local timezone start of day
          const completionDate = getStartOfDay(new Date(c.date));
          const offsetDays = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (offsetDays >= 0 && offsetDays < MAX_HISTORY) {
            history[offsetDays] = {
              completedDate: c.date,
              completed: true,
              completionId: c.completionId
            }
          }
        }

        let streak = 0;
        while (history[streak]?.completed && streak < MAX_HISTORY) {
          streak++;
        }
        
        return {
          ...habit,
          completionHistory: history,
          streak,
          currentCompleted: history[0]?.completionId ? true : false,
          currentCompletionId: history[0]?.completionId
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

  const toggleHabitCompletion = async (habitId: string, date: Date,
    completed: boolean, completionId: string) => {
    try {
      await setHabitCompletion(habitId, date, !completed, completionId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle habit completion'));
    }
  };

  const addHabit = async (title: string, description: string, selectedIcon: string) => {
    try {
      await addHabitFirebase(title, description, selectedIcon);
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