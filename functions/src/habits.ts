import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAdmin} from "./supabase";
import {verifySupabaseToken} from "./auth";

export const getHabitIdeas = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken} = request.data;
      if (!authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameter: auth_token"
        );
      }

      // Verify Supabase JWT
      const {error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const {data, error: fetchError} = await getAdmin()
        .from("daily_habits")
        .select("*")
        .is("user_id", null);

      if (fetchError) throw fetchError;

      return data;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const getHabitsHistory = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken} = request.data;
      // console.log(request.data);
      if (!authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameter: auth_token"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const {data, error: fetchError} = await getAdmin()
        .from("daily_habits")
        .select("*, completions: daily_habit_completions(*)")
        .eq("user_id", userId);

      if (fetchError) throw fetchError;

      return data;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const addHabit = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, title, description, icon} = request.data;
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const {error: dbError} = await getAdmin()
        .from("daily_habits")
        .insert({
          user_id: userId,
          title,
          description,
          icon,
        });

      if (dbError) throw dbError;

      return {success: true};
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const deleteHabit = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, habitId} = request.data;
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const {error: dbError} = await getAdmin()
        .from("daily_habit_completions")
        .delete()
        .eq("user_id", userId)
        .eq("habit_id", habitId);

      if (dbError) throw dbError;

      const {error: dbError2} = await getAdmin()
        .from("daily_habits")
        .delete()
        .eq("user_id", userId)
        .eq("id", habitId);

      if (dbError2) throw dbError2;

      return {success: true};
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);


export const setHabitCompletion = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {
        habitId,
        date,
        completed,
        authToken,
      } = request.data;

      if (!habitId || !date || typeof completed === "undefined" || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing one of: habitId, date, completed, or auth_token"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      if (completed) {
        const {error: dbError} = await getAdmin()
          .from("daily_habit_completions")
          .upsert({
            user_id: userId,
            habit_id: habitId,
            date,
          });

        if (dbError) throw dbError;
      } else {
        const {error: dbError} = await getAdmin()
          .from("daily_habit_completions")
          .delete()
          .eq("user_id", userId)
          .eq("habit_id", habitId)
          .eq("date", date);

        if (dbError) throw dbError;
      }

      return {success: true};
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);
