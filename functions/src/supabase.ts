import { createClient } from '@supabase/supabase-js';
// Initialize Supabase admin client
const supabaseAdmin = createClient(
//   functions.config().supabase.url,
//   functions.config().supabase.service_key,
  "https://nlysmwhxasokzkrhfcfy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5seXNtd2h4YXNva3prcmhmY2Z5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTk1NDIxNSwiZXhwIjoyMDU1NTMwMjE1fQ.gl_eHUL1lWOi_V9X8QEUEPbgj1yJ2QAN8eyr1tqel5k",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const getWorkoutData = async (startDate: Date, endDate: Date, userId: string) => {
    const { data } = await supabaseAdmin
      .from('user_workouts')
      .select(`*`)
      .eq('user_id', userId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .order('start_time', { ascending: true });

    return { 'workouts': data };
};