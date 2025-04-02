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
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const role = await getRole(userId);
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
