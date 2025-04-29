import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import { supabase } from '../utils/supabase';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'asia-south1');
// console.log(functions);

// connectFunctionsEmulator(functions, '127.0.0.1', 5001);

export async function getUserSessions(startDate: Date, endDate: Date) {
    try {
      // Get current session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }
      
      const result = await httpsCallable(functions, 'getUserSessions')({
        startDate,
        endDate,
        authToken: session.access_token
      });
  
      return result.data;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
}

export async function getTrainerSessions(
  startDate: Date=null, endDate: Date=null,
  sessionId: string=null, fetchUsers=false) {
  try {
    // Get current session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!session?.access_token) {
      throw new Error('No active session');
    }
    
    const result = await httpsCallable(functions, 'getTrainerSessions')({
      startDate: startDate,
      endDate,
      sessionId,
      fetchUsers,
      authToken: session.access_token
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
}

export async function createMember(member: any) {

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
      
  if (!session?.access_token) {
    throw new Error('No active session');
  }

  const {email, password, name, phone_number} = member;
  try {
    const result = await httpsCallable(functions, 'createMember')({
      email,
      password,
      name,
      phoneNumber:phone_number,
      authToken: session.access_token
    });
    return {data: result.data, error: null};
  } catch (error) {
    console.error('Error creating member:', error);
    return {data: null, error: error};
  }
}

export async function getMembers(memberId: string | null) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'getMembers')({
    memberId, authToken: session.access_token
  });
}

export async function deleteMember(memberId: string | null) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'deleteMember')({
    memberId, authToken: session.access_token
  });
}

export async function getSquads(squadId: string | null) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'getSquads')({
    squadId, authToken: session.access_token
  });
}

export async function createOrEditSquad(name, description, isPrivate, schedule, members, id=null) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'createOrEditSquad')({
    id,
    name,
    description,
    isPrivate,
    schedule,
    members,
    authToken: session.access_token
  });
}

export async function deleteSquad(squadId: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'deleteSquad')(
    {squadId, authToken: session.access_token}
  );
} 

export async function getExercises() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'getExercises')({authToken: session.access_token});
}

export async function createSession(
  title: string="", startTime: string= "", squadId: string="",
  userIds: Array<string>=null, exercises: Array<any>=null) {
  
  // console.log("title", title, "start", startTime, "squad", squadId, "users", userIds, "exercises", exercises);
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'createSession')({
    title, startTime, squadId, userIds, exercises,
    authToken: session.access_token
  });
}

export async function updateSession(
  sessionId: string, status: string, sessionUsers: Array<any>) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
  return httpsCallable(functions, 'updateSession')({
    sessionId, status, sessionUsers,
    authToken: session.access_token
  });
}

export async function voteSession(sessionId: string, mvpUserId: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'voteSession')({
    sessionId, mvpUserId, authToken: session.access_token
  });
}

export async function deleteSession(sessionId: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return httpsCallable(functions, 'deleteSession')({
    sessionId, authToken: session.access_token
  });
}

export async function getHabitIdeas() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return (await httpsCallable(functions, 'getHabitIdeas')({
    authToken: session.access_token,
  })).data;
}

export async function getHabitsHistory() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return (await httpsCallable(functions, 'getHabitsHistory')({
    authToken: session.access_token,
  })).data;
}

export async function setHabitCompletion(habitId: string, date: Date, completed: boolean) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return (await httpsCallable(functions, 'setHabitCompletion')({
    habitId, date, completed, authToken: session.access_token
  })).data;
}

export async function addHabit(title: string, description: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return (await httpsCallable(functions, 'addHabit')({
    title, description, authToken: session.access_token,
  })).data;
}

export async function deleteHabit(habitId: string) {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  
  return (await httpsCallable(functions, 'deleteHabit')({
    habitId, authToken: session.access_token,
  })).data;
}
