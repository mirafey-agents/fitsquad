import React, { createContext, useContext, useState } from 'react';
import { getUserSessions } from '@/utils/firebase';

interface Session {
  id: string;
  user_id: string;
  session_trainers_id: string;
  start_time: string;
  status: string;
  performance_score: number;
  trainer_comments: string;
  session_media: Array<{
    media_id: string;
    review: string;
  }>;
  session: {
    title: string;
    trainer: {
      display_name: string;
    };
  };
  exercises: Array<{
    name: string;
    sets: string;
    reps: string;
    energy_points: number;
    module_type: string;
    level: string;
    type: string;
  }>;
  participants: Array<{
    id: string;
    display_name: string;
    votesFor: number;
  }>;
  mvpUserId?: string;
  vote_mvp_user_id?: string;


  total_energy_points: number;
  module_type: string;
  type: string;
  level: string;
}

interface SessionsContextType {
  sessions: Session[];
  loading: boolean;
  error: Error | null;
  refreshSessions: () => Promise<void>;
}

const SessionsContext = createContext<SessionsContextType | undefined>(undefined);

export function SessionsProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const sessionsData = await getUserSessions(
        new Date(2024, 1, 1),
        new Date(2025, 12, 1)
      );
      sessionsData.map((session: Session) => {
        session.total_energy_points = session.exercises.reduce(
          (acc, exercise) => {
            return acc + exercise.energy_points * parseInt(exercise.sets || exercise.reps);
           }, 0);

        
        const label_scores = {
          module_type: {},
          level: {},
          type: {},
        }
        session.exercises.map((exercise) => {
          const ep = exercise.energy_points * parseInt(exercise.sets || exercise.reps);
          const mt = exercise.module_type || "Barbell";
          const l = exercise.level || "Intermediate";
          const t = exercise.type || "Strength";
          label_scores.module_type[mt] = (label_scores.module_type[mt] || 0) + ep;
          label_scores.level[l] = (label_scores.level[l] || 0) + ep;
          label_scores.type[t] = (label_scores.type[t] || 0) + ep;
        });
        session.module_type = Object.keys(label_scores.module_type).reduce((a, b) => label_scores.module_type[a] > label_scores.module_type[b] ? a : b);
        session.level = Object.keys(label_scores.level).reduce((a, b) => label_scores.level[a] > label_scores.level[b] ? a : b);
        session.type = Object.keys(label_scores.type).reduce((a, b) => label_scores.type[a] > label_scores.type[b] ? a : b);
      });
      
      console.log('sessionsData', sessionsData);
      setSessions(sessionsData as Session[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
    } finally {
      setLoading(false);
    }
  };

  const value = {
    sessions,
    loading,
    error,
    refreshSessions: fetchSessions,
  };

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionsContext);
  if (context === undefined) {
    throw new Error('useSessions must be used within a SessionsProvider');
  }
  return context;
} 