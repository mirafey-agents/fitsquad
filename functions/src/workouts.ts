import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAdmin, getWorkoutData} from "./supabase";
import {verifySupabaseToken} from "./auth";

export const getWorkouts = onCall(
  {secrets: ["SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"], cors: true},
  async (request: any) => {
    try {
      // Validate input
      const {
        startDate: stDt,
        endDate: enDt,
        authToken: auTkn,
      } = request.data;

      if (!stDt || !enDt || !auTkn) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameters: start_date, end_date, or auth_token"
        );
      }

      // Verify dates are valid
      const startDate = new Date(stDt);
      const endDate = new Date(enDt);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new HttpsError("invalid-argument", "Invalid date format");
      }

      if (endDate < startDate) {
        throw new HttpsError("invalid-argument",
          "End date must be after start date");
      }

      // Verify Supabase JWT and get user ID
      const {userId} = verifySupabaseToken(auTkn);
      console.log(userId);
      const workouts = await getWorkoutData(startDate, endDate, userId);
      return workouts;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  });

export const getExercises = onCall(
  {secrets: ["SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"], cors: true},
  async (request: any) => {
    try {
    // Validate input
      const {authToken} = request.data;

      // Verify Supabase JWT and get user ID
      const {userId} = verifySupabaseToken(authToken);
      if (!userId) {
        throw new HttpsError("invalid-argument", "Invalid auth token");
      }
      // Fetch squads
      const {data, error: fetchError} = await getAdmin()
        .from("exercises").select("*");

      if (fetchError) throw fetchError;

      return data;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  });

