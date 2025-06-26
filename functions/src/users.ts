import {onCall} from "firebase-functions/v2/https";
import {HttpsError} from "firebase-functions/v2/https";
import {getAdmin} from "./supabase";
import {verifySupabaseToken} from "./auth";

export const updateUserProfile = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    const {userId, profileData, authToken} = request.data;

    if (!userId || !profileData || !authToken) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
    }

    const {
      userId: authUserId,
      error: tokenError,
    } = verifySupabaseToken(authToken);

    if (tokenError) {
      throw new HttpsError("unauthenticated", "Invalid authentication token");
    }
    if (authUserId !== userId) {
      throw new HttpsError("permission-denied",
        "You are not authorized to update this user");
    }
    const allowedFields = [
      "display_name", "gender", "age", "goals",
      "activityLevel", "medical_conditions", "dietary_restrictions",
      "preferred_workout_times", "available_equipment",
      // trainer fields
      "bio", "certifications", "specializations",
    ];
    const updateData: any = {};
    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        updateData[field] = profileData[field];
      }
    }
    updateData.onboarding_status = "completed";

    const {error} = await getAdmin().from("users")
      .update(updateData).eq("id", userId).select();

    if (error) throw error;

    return {success: true};
  }
);

export const getUserProfile = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    const {userId, authToken} = request.data;

    if (!userId) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
    }

    const {
      userId: authUserId,
      error: tokenError,
    } = verifySupabaseToken(authToken);

    if (tokenError) {
      throw new HttpsError("unauthenticated", "Invalid authentication token");
    }
    if (authUserId !== userId) {
      throw new HttpsError("permission-denied",
        "You are not authorized to get this user");
    }

    const {data, error} = await getAdmin().from("users")
      .select("*").eq("id", userId).single();

    if (error) throw error;

    return data;
  }
);
