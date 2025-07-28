import {onCall} from "firebase-functions/v2/https";
import {HttpsError} from "firebase-functions/v2/https";
import {getAdmin, getRole} from "./supabase";
import {getAuthInfo} from "./auth";
import * as admin from "firebase-admin";
import {randomUUID} from "crypto";
import {FirebaseAuthError} from "firebase-admin/auth";
import {sendWelcomeEmailToMember} from "./notifications";

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
    } = getAuthInfo(authToken, request.auth);

    if (tokenError) {
      throw new HttpsError("unauthenticated", "Invalid authentication token");
    }
    if (authUserId !== userId) {
      throw new HttpsError("permission-denied",
        "You are not authorized to update this user");
    }
    const allowedFields = [
      "display_name", "gender", "age", "goals",
      "experience_level", "medical_conditions", "dietary_restrictions",
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

    if (error) {
      console.error(error);
      throw error;
    }

    return {success: true};
  }
);

export const getUserProfile = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    const {userId, authToken} = request.data;
    // console.log("getUserProfile", request.auth);
    if (!userId) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
    }

    const {
      userId: authUserId,
      error: tokenError,
    } = getAuthInfo(authToken, request.auth);

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

const newUser = async (
  email: string, password: string, name: string, role: string
) => {
  const user = await admin.auth().createUser({
    uid: randomUUID(),
    email,
    password,
    displayName: name,
    emailVerified: true,
  });

  await admin.auth().setCustomUserClaims(user.uid, {role: role});

  return user;
};

export const createUser = onCall(
  {
    secrets: [
      "SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET", "SMTP_KEY",
    ],
    cors: true,
  },
  async (request: any) => {
    try {
      const {
        email, password, name, phoneNumber, authToken,
      } = request.data;

      if (!email || !password || !name || !phoneNumber || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing one of: email, password, name, phoneNumber, or authToken"
        );
      }

      // Verify Supabase JWT
      const {
        userId: trainerId, error: tokenError,
        name: trainerName,
      } = getAuthInfo(authToken, request.auth);

      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const authRole = await getRole(trainerId);

      // Role permission validation
      if (authRole !== "trainer") {
        throw new HttpsError("permission-denied",
          "Only trainer can create users");
      }

      let user = null;
      const role = "member";

      try {
        // Create user in Firebase Auth with custom UID
        user = await newUser(email, password, name, role);

        // Create user record in users table
        const {error: dbError} = await getAdmin()
          .from("users")
          .insert({
            id: user.uid,
            email,
            display_name: name,
            phone_number: phoneNumber,
            role: role,
            created_at: new Date().toISOString(),
            onboarding_status: "pending",
          });

        if (dbError) throw dbError;
      } catch (error) {
        if (error instanceof FirebaseAuthError &&
          error.code === "auth/email-already-exists") {
          user = await admin.auth().getUserByEmail(email);
        } else {
          throw error;
        }
      }

      if (authRole === "trainer" && role === "member") {
        // Create user record in trainer_users table
        const {error: dbError2} = await getAdmin()
          .from("trainer_users")
          .insert({
            user_id: user.uid,
            trainer_id: trainerId,
            created_at: new Date().toISOString(),
          });

        if (dbError2) throw dbError2;
        await sendWelcomeEmailToMember(
          name, email, password, trainerName);
      }

      return {success: true, userId: user.uid};
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

