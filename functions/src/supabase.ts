import {createClient} from "@supabase/supabase-js";

// Initialize Supabase admin client
let supabaseAdmin: any = null;

export const getAdmin = () => {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      "https://nlysmwhxasokzkrhfcfy.supabase.co",
      process.env.SUPABASE_SERVICE_KEY ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return supabaseAdmin;
};

export const getRole = async (userId: string): Promise<string> => {
  const {data} = await getAdmin()
    .from("users")
    .select("role").eq("id", userId);
  return data?.[0]?.role ?? "";
};

export const getWorkoutData = async (
  startDate: Date, endDate: Date, userId: string
) => {
  const {data} = await getAdmin()
    .from("user_workouts")
    .select("*")
    .eq("user_id", userId)
    .gte("start_time", startDate.toISOString())
    .lte("start_time", endDate.toISOString())
    .order("start_time", {ascending: true});

  return {"workouts": data};
};
