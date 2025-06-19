import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {getAdmin} from "./supabase";
import {verifySupabaseToken} from "./auth";

const authenticate = (request: any) => {
  try {
    const {authToken} = request.data;
    if (!authToken) {
      throw new HttpsError("invalid-argument", "authToken missing");
    }

    const {userId: aUId, error} = verifySupabaseToken(authToken);

    if (error) {
      throw new HttpsError("unauthenticated", "Invalid authToken");
    }

    if (request.data.userId && aUId !== request.data.userId) {
      throw new HttpsError("permission-denied", "User ID mismatch");
    }

    return aUId;
  } catch (error: any) {
    throw new HttpsError("internal", error.message);
  }
};

const col = (c: string) => {
  return admin.firestore().collection(c);
};

const _addHabit = async (data: any, authUserId: string) => {
  const {title, description, icon} = data;
  const docRef = await col("habits").doc();
  await docRef.set({
    id: docRef.id,
    title,
    description,
    icon,
    userId: authUserId,
    createdAt: new Date(),
  });

  return {success: true, id: docRef.id};
};

const _deleteHabit = async (data: any, authUserId: string) => {
  const {habitId} = data;
  const doc = await col("habits").doc(habitId).get();
  if (!doc.exists) {
    throw new HttpsError("not-found", "Habit not found");
  }
  if (doc.data()?.userId !== authUserId) {
    throw new HttpsError(
      "permission-denied",
      "User does not have permission to delete this habit");
  }

  await admin.firestore().recursiveDelete(doc.ref);

  return {success: true};
};

const setCompletion = async (data: any, authUserId: string) => {
  const {habitId, date, completed, completionId} = data;
  const docRef = await col("habits").doc(habitId).get();
  if (!docRef.exists) {
    throw new HttpsError("not-found", "Habit not found");
  }
  if (docRef.data()?.userId !== authUserId) {
    throw new HttpsError(
      "permission-denied",
      "User does not have permission to set completion for this habit");
  }

  if (completed == false) {
    await col("habits").doc(`${habitId}/completions/${completionId}`).delete();
    return {success: true};
  }

  const completionDocRef = await col(`habits/${habitId}/completions/`).doc();
  await completionDocRef.set({
    id: completionDocRef.id,
    date,
  });

  return {success: true};
};

const getHistory = async (userId: string) => {
  const habits = await col("habits").where("userId", "==", userId).get();
  const habitsWithHistory = habits.docs.map(async (doc) => {
    const habit = await doc.data();
    habit.completions = (await col(`habits/${habit.id}/completions/`).get())
      .docs.map((doc) => ({completionId: doc.id, ...doc.data()}));
    return habit;
  });
  return await Promise.all(habitsWithHistory);
};

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
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    return await getHistory(authenticate(request));
  }
);

export const addHabit = onCall(
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    return await _addHabit(request.data, authenticate(request));
  }
);

export const deleteHabit = onCall(
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    return await _deleteHabit(request.data, authenticate(request));
  }
);

export const setHabitCompletion = onCall(
  {secrets: ["SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    return await setCompletion(request.data, authenticate(request));
  }
);
