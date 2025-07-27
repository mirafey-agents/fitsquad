import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAuthInfo} from "./auth";
import * as admin from "firebase-admin";

export const getSquads = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, squadId} = request.data;

      if (!authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameter: auth_token"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = getAuthInfo(authToken, request.auth);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      let q = admin.firestore().collection("squads")
        .where("createdBy", "==", userId);

      if (squadId) {
        q = q.where("id", "==", squadId);
      }
      const ret = (await q.get()).docs;

      return ret?.map((doc) => doc.data());
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const createOrEditSquad = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {
        id,
        name,
        description,
        schedule,
        members,
        authToken,
      } = request.data;

      if (
        (!id && !(name && description && schedule && members)) ||
        !authToken
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Missing one of: id, name, description, schedule, " +
          "members, or auth_token"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = getAuthInfo(authToken, request.auth);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const updateData: any = {updatedAt: new Date()};
      if (name) updateData.name = name;
      if (description) updateData.description = description;
      if (schedule) updateData.schedule = schedule;
      if (members) {
        updateData.members = members.map((memberId: string) => ({
          userId: memberId,
          memberSince: new Date(),
        }));
      }

      if (id) {
        await admin.firestore().collection("squads").doc(id).update(updateData);

        return {success: true, squadId: id};
      } else {
        const docRef = await admin.firestore().collection("squads").doc();
        await docRef.set({
          id: docRef.id,
          createdBy: userId,
          createdAt: new Date(),
          ...updateData,
        });
        return {success: true, squadId: docRef.id};
      }
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const deleteSquad = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {squadId, authToken} = request.data;

      if (!squadId || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameters: squadId and authToken"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = getAuthInfo(authToken, request.auth);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const squad = await admin.firestore().collection("squads")
        .where("id", "==", squadId)
        .where("createdBy", "==", userId).get();

      if (squad.size === 0) {
        throw new HttpsError(
          "not-found",
          "Squad not found or user is not the creator"
        );
      }

      await admin.firestore().collection("squads").doc(squadId).delete();

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
