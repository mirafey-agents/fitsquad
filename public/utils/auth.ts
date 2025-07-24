import { clearStorage } from "./storage";
import { supabase } from "./supabase";

export async function getAuthToken() {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    
    if (!session?.access_token) {
        throw new Error('No active session');
    }
    return session.access_token;
}
  
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Supabase logout error:', error);
        }
        await clearStorage();
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

export async function getLoggedInUser() {
    const { data: { session }, error: userError } = await supabase.auth.getSession();
    console.log('logged in user: ',session?.user);
    if (userError) throw userError;
    return session?.user;
}