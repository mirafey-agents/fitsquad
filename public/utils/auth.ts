import { supabase } from "./supabase";

export async function getAuthToken() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }
      return session.access_token;
}

export function getLoggedInUser() {
    return JSON.parse(localStorage.getItem('loggedinUser'));
  }
  
export function logout() {
    return localStorage.setItem('loggedinUser', null);
  }