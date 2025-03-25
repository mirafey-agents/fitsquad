import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';


const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Configure Supabase client with proper options for web environment
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false, // Don't detect OAuth redirects
    autoRefreshToken: true, // Don't auto refresh token
    // storage: {
    //   // Implement in-memory storage for web
    //   getItem: (key: string) => {
    //     try {
    //       const value = sessionStorage.getItem(key);
    //       return value ? JSON.parse(value) : null;
    //     } catch {
    //       return null;
    //     }
    //   },
    //   setItem: (key: string, value: any) => {
    //     console.log('setItem: ', key, value);
    //     try {
    //       sessionStorage.setItem(key, JSON.stringify(value));
    //     } catch {}
    //   },
    //   removeItem: (key: string) => {
    //     try {
    //       sessionStorage.removeItem(key);
    //     } catch {}
    //   },
    // },
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
  console.log('login: ', data);

  const res = {user: data.user};
  localStorage.setItem('loggedinUser', JSON.stringify(res));

  await updateProfile(data.user.id);

  return res;
}

async function updateProfile(userId: string) {
  const profile = await supabase.from('users').select('*').eq('id', userId);
  console.log('profile: ', profile.data[0]);

  const data = getLoggedInUser();
  data.profile = profile.data[0];

  localStorage.setItem('loggedinUser', JSON.stringify(data));
}

export function getLoggedInUser() {
  return JSON.parse(localStorage.getItem('loggedinUser'));
}

export function logout() {
  return localStorage.setItem('loggedinUser', null);
}

// Helper function to check onboarding status with error handling
export async function checkOnboardingStatus() {
  const loggedinUser = getLoggedInUser();

  if (!loggedinUser || loggedinUser.user === null || 
    loggedinUser.profile === null || 
    loggedinUser.profile.onboarding_status != 'completed') {
      return {
        isComplete: false,
        userData: null,
      };
    }
    
  return {
    isComplete: true,
    userData: loggedinUser.profile,
  };
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
  console.log('onboardingUser: ', profileData);
  try {
    const { error } = await supabase.from('users')
      .upsert({
        id: loginUser.user.id,
        email: loginUser.user.email,
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
      }).select();

    await updateProfile(loginUser.user.id);

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
