import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAdmin, getRole} from "./supabase";
import {getAuthInfo} from "./auth";
import * as admin from "firebase-admin";
import {randomUUID} from "crypto";

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

export const createUser = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {
        email, password, name, phoneNumber,
        role, uid, authToken} = request.data;

      if (!email || !password || !name || !phoneNumber || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing one of: email, password, name, phoneNumber, or authToken"
        );
      }

      // Verify Supabase JWT
      const {
        userId: trainerId, error: tokenError,
      } = getAuthInfo(authToken, request.auth);

      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const authRole = await getRole(trainerId);

      // Role permission validation
      if (authRole === "admin" && role!=="trainer") {
        throw new HttpsError("permission-denied",
          "Admin cannot create: " + role);
      } else if (authRole === "trainer" && role !== "member") {
        throw new HttpsError("permission-denied",
          "Trainer user cannot create role: " + role);
      }

      // Generate custom UUID for the user
      const customUid = uid || randomUUID();

      // Create user in Firebase Auth with custom UID
      await admin.auth().createUser({
        uid: customUid,
        email,
        password,
        displayName: name,
        phoneNumber,
        emailVerified: true,
      });

      // Set custom claims based on role
      await admin.auth().setCustomUserClaims(customUid, {role: role});

      // Create user record in users table
      const {error: dbError} = await getAdmin()
        .from("users")
        .insert({
          id: customUid,
          email,
          display_name: name,
          phone_number: phoneNumber,
          role: role,
          created_at: new Date().toISOString(),
        });

      if (dbError) throw dbError;

      if (authRole === "trainer") {
        // Create user record in trainer_users table
        const {error: dbError2} = await getAdmin()
          .from("trainer_users")
          .insert({
            user_id: customUid,
            trainer_id: trainerId,
            created_at: new Date().toISOString(),
          });

        if (dbError2) throw dbError2;
      }

      return {success: true, userId: customUid};
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
