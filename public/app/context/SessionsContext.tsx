import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserSessions } from '@/utils/firebase';

interface Session {
  id: string;
  user_id: string;
  session_id: string;
  start_time: string;
  status: string;
  performance_score: number;
  trainer_comments: string;
  media_ids: string[];
  media_reviews: Array<any>;
  session: {
    title: string;
    trainer: {
      display_name: string;
    };
  };
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    energyPoints: number;
  }>;
  participants: Array<{
    id: string;
    display_name: string;
    votesFor: number;
  }>;
  mvpUserId?: string;
  vote_mvp_user_id?: string;
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
      setSessions(sessionsData as Session[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch sessions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

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