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
