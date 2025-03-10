import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';


const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Configure Supabase client with proper options for web environment
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist auth state
    detectSessionInUrl: false, // Don't detect OAuth redirects
    autoRefreshToken: false, // Don't auto refresh token
    storage: {
      // Implement in-memory storage for web
      getItem: (key: string) => {
        try {
          const value = sessionStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: any) => {
        try {
          sessionStorage.setItem(key, JSON.stringify(value));
        } catch {}
      },
      removeItem: (key: string) => {
        try {
          sessionStorage.removeItem(key);
        } catch {}
      },
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'expo-web',
    },
  },
});

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });
  localStorage.setItem('loginUser', JSON.stringify(data));
  console.log('login: ', data);
  return data;
}

export function getLoggedInUser() {
  return JSON.parse(localStorage.getItem('loginUser'));
}

export function logout() {
  return localStorage.setItem('loginUser', null);
}

// Helper function to check onboarding status with error handling
export async function checkOnboardingStatus() {
  const loginUser = await getLoggedInUser();

  try {
    const { data, error } = await supabase
      .from('users')
      .select(
        `
        onboarding_status,
        email,
        display_name,
        goals,
        experience_level,
        medical_conditions,
        preferred_workout_times,
        gender,
        age,
        dietary_restrictions,
        available_equipment
      `
      )
      .eq('id', loginUser.user.id)
      .single();

    console.log('profile: ', data);

    if (error) {
      console.error('Supabase error:', error);
      return {
        isComplete: false,
        userData: null,
      };
    }

    return {
      isComplete: data?.onboarding_status === 'completed',
      userData: data,
    };
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return {
      isComplete: false,
      userData: null,
    };
  }
}

// Helper function to update user profile with error handling
export async function updateUserProfile(profileData: any) {
  const loginUser = await getLoggedInUser();

  try {
    const { error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', loginUser.user.id);

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

// Helper function to complete onboarding with error handling
export async function completeOnboarding(profileData: any) {
  const loginUser = await getLoggedInUser();

  try {
    const { error } = await supabase
      .from('users')
      .update({
        display_name: profileData.name,
        gender: profileData.gender,
        age: parseInt(profileData.age),
        goals: profileData.goals,
        experience_level: profileData.activityLevel,
        medical_conditions: profileData.medicalConditions
          ? [profileData.medicalConditions]
          : null,
        dietary_restrictions: profileData.dietaryRestrictions,
        preferred_workout_times: profileData.preferredWorkoutTimes,
        available_equipment: profileData.availableEquipment,
        onboarding_status: 'completed',
      })
      .eq('id', loginUser.user.id);

    if (error) {
      console.error('Supabase error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return false;
  }
}
