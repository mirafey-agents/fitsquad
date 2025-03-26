/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest, onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {verifySupabaseToken} from "./auth";
import {getWorkoutData, getAdmin, getRole} from "./supabase";

import {setGlobalOptions} from "firebase-functions/v2";
setGlobalOptions({region: "asia-south1"});


export const helloWorld = onRequest(
  {cors: true},
  (request, response) => {
    logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
  });

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

export const createMember = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {email, password, name,
        phone_number: phoneNumber, authToken} = request.data;

      if (!email || !password || !name || !phoneNumber || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing params: email, password, name, phone_number, or auth_token"
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
      const {data: authData, error: authError} = await getAdmin()
        .auth.admin.createUser({
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
          role: "member",
          onboarding_status: "pending",
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
      let query = getAdmin().from("users").select("*").eq("role", "member");

      if (memberId && memberId !== "") {
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
