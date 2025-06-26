import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAdmin, getRole} from "./supabase";
import {verifySupabaseToken} from "./auth";

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
      const {error: tokenError} = verifySupabaseToken(authToken);
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

export const createMember = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {email, password, name, phoneNumber, authToken} = request.data;

      if (!email || !password || !name || !phoneNumber || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing one of: email, password, name, phoneNumber, or authToken"
        );
      }

      // Verify Supabase JWT
      const {
        userId: trainerId, error: tokenError,
      } = verifySupabaseToken(authToken);

      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const role = await getRole(trainerId);
      if (role !== "admin" && role !== "trainer") {
        throw new HttpsError("permission-denied",
          "Only admin or trainer can create members, role: " + role);
      }

      // Create user in Supabase Auth
      const {
        data: authData, error: authError,
      } = await getAdmin().auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create user record in users table
      const {error: dbError} = await getAdmin()
        .from("users")
        .insert({
          id: authData.user.id,
          email,
          display_name: name,
          phone_number: phoneNumber,
          created_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      // Create user record in users table
      const {error: dbError2} = await getAdmin()
        .from("trainer_users")
        .insert({
          user_id: authData.user.id,
          trainer_id: trainerId,
          created_at: new Date().toISOString(),
        });

      if (dbError2) throw dbError2;

      return {success: true, userId: authData.user.id};
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
      } = verifySupabaseToken(authToken);

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

      // Create user in Supabase Auth
      const {
        error: authError,
      } = await getAdmin().auth.admin.deleteUser(memberId);

      if (authError) throw authError;

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
