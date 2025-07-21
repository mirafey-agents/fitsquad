import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../types/supabase';
import { setLoggedInUser } from './storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter for React Native
const customStorage = {
  getItem: async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      console.log('Supabase Storage: Getting', key, value ? 'Found' : 'Not found');
      return value;
    } catch (error) {
      console.error('Supabase Storage: Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      console.log('Supabase Storage: Setting', key, 'Success');
    } catch (error) {
      console.error('Supabase Storage: Error setting item in storage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      console.log('Supabase Storage: Removing', key, 'Success');
    } catch (error) {
      console.error('Supabase Storage: Error removing item from storage:', error);
    }
  },
};

// Configure Supabase client with custom storage for React Native
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
    detectSessionInUrl: false,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'expo-web',
    },
  },
});

export async function login(email, password) {
  console.log('Supabase: Attempting login for', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error('Supabase: Login error:', error);
    throw error;
  }

  if (data.user) {
    console.log('Supabase: Login successful for', data.user.email);
    await setLoggedInUser(data.user);
  }

  return data.user;
}