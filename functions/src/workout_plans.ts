import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAuthInfo} from "./auth";
import * as admin from "firebase-admin";

export const createWorkoutPlan = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, name, exercises} = request.data;

      const {userId, error: tokenError} = getAuthInfo(authToken, request.auth);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const docRef = admin.firestore().collection("workout_plans").doc();
      await docRef.set({
        id: docRef.id,
        name: name,
        created_by: userId,
        created_at: new Date(),
        exercises: exercises,
      });

      return {success: true, id: docRef.id};
    } catch (error) {
      console.error("Error creating workout plan:", error);
      throw new HttpsError("internal", "Failed to create workout plan");
    }
  }
);

export const getWorkoutPlans = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, ids} = request.data;

      const {userId, error: tokenError} = getAuthInfo(authToken, request.auth);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      let q = admin.firestore().collection("workout_plans")
        .where("created_by", "==", userId);

      if (ids) {
        q = q.where("id", "in", ids);
      }

      const workoutPlans = await q.get();
      return workoutPlans.docs.map((doc) => doc.data());
    } catch (error) {
      console.error("Error getting workout plans:", error);
      throw new HttpsError("internal", "Failed to get workout plans");
    }
  }
);

export const deleteWorkoutPlan = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, workoutPlanId} = request.data;

      const {userId, error: tokenError} = getAuthInfo(authToken, request.auth);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const doc = await admin.firestore().collection("workout_plans")
        .doc(workoutPlanId).get();

      if (!doc.exists) {
        throw new HttpsError("not-found", "Workout plan not found");
      } else if (doc.data()?.created_by !== userId) {
        throw new HttpsError(
          "permission-denied",
          "You are not allowed to delete this workout plan"
        );
      }

      await admin.firestore().collection("workout_plans")
        .doc(workoutPlanId).delete();

      return {success: true};
    } catch (error) {
      console.error("Error deleting workout plan:", error);
      throw new HttpsError("internal", "Failed to delete workout plan");
    }
  }
);
