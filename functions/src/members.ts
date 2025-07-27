import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAdmin} from "./supabase";
import {getAuthInfo} from "./auth";
import * as admin from "firebase-admin";

export const getMembers = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, memberId} = request.data;

      if (!authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameter: auth_token"
        );
      }

      // Verify Supabase JWT
      const {error: tokenError} = getAuthInfo(authToken, request.auth);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Fetch all members
      let query = getAdmin()
        .from("users")
        .select("*")
        .eq("role", "member");

      if (memberId) {
        query = query.eq("id", memberId);
      }

      const {data, error: fetchError} = await query;

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

export const deleteMember = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {memberId, authToken} = request.data;

      if (!memberId || !authToken) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      const {
        userId: trainerId, error: tokenError,
      } = getAuthInfo(authToken, request.auth);

      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const {error: dbError} = await getAdmin()
        .from("trainer_users")
        .delete()
        .eq("user_id", memberId)
        .eq("trainer_id", trainerId);

      if (dbError) throw dbError;

      const {error: dbError2} = await getAdmin()
        .from("squad_members")
        .delete()
        .eq("user_id", memberId);

      if (dbError2) throw dbError2;

      const {error: dbError3} = await getAdmin()
        .from("users")
        .delete()
        .eq("id", memberId);

      if (dbError3) throw dbError3;

      // Delete user from Firebase Auth
      await admin.auth().deleteUser(memberId);

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

export const updateMemberPlan = async (
  userId: string, plan: string, validUntil: Date) => {
  const {error} = await getAdmin()
    .from("users")
    .update({
      subscription_plan: plan,
      subscription_valid_until: validUntil,
    })
    .eq("id", userId);
  if (error) throw error;
};
