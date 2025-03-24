import {createClient} from "@supabase/supabase-js";
import {config} from "firebase-functions";

// Initialize Supabase admin client
const supabaseAdmin = createClient(
//   config().supabase.url,
  "https://nlysmwhxasokzkrhfcfy.supabase.co",
  config().supabase.service_key,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const getWorkoutData = async (
  startDate: Date, endDate: Date, userId: string
) => {
  const {data} = await supabaseAdmin
    .from("user_workouts")
    .select("*")
    .eq("user_id", userId)
    .gte("start_time", startDate.toISOString())
    .lte("start_time", endDate.toISOString())
    .order("start_time", {ascending: true});

  return {"workouts": data};
};
