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

export async function getUserWorkouts(startDate: Date, endDate: Date) {
    try {
      // console.log('getSession', await supabase.auth.getSession());
      // console.log('refreshSession', await supabase.auth.refreshSession());
      // Get current session from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }
      
      const result = await httpsCallable(functions, 'getWorkouts')({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auth_token: session.access_token
      });
  
      return result.data.workouts;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
}