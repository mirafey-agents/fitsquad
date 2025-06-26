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

  return res;
}