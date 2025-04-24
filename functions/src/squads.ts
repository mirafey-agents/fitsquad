import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAdmin} from "./supabase";
import {verifySupabaseToken} from "./auth";

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
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Fetch squads
      let query = getAdmin()
        .from("squads")
        .select(`
          *,
          squad_members (
            joined_at,
            users (
              id,
              display_name,
              email,
              role
            )
          )
        `).eq("created_by", userId);

      if (squadId) {
        query = query.eq("id", squadId);
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

export const createOrEditSquad = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {
        id,
        name,
        description,
        isPrivate,
        schedule,
        members,
        authToken,
      } = request.data;

      if (!id || !name || !description || !schedule || !members || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing one of: id, name, description, schedule, " +
          "members, or auth_token"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Create squad
      const {data: squad, error: squadError} = await getAdmin()
        .from("squads")
        .upsert({
          id,
          name,
          description,
          is_private: isPrivate ?? false,
          schedule,
          created_by: userId,
        })
        .select()
        .single();

      if (squadError) throw squadError;

      // Delete existing squad members if any
      const {error: deleteError} = await getAdmin()
        .from("squad_members")
        .delete()
        .eq("squad_id", squad.id);

      if (deleteError) throw deleteError;

      // Add members to squad
      const membersData = members.map((memberId: string) => ({
        squad_id: squad.id,
        user_id: memberId,
        role: "member",
      }));

      const {error: membersError} = await getAdmin()
        .from("squad_members")
        .insert(membersData);

      if (membersError) throw membersError;

      return {success: true, squadId: squad.id};
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
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Check if user is the creator of the squad
      const {data: squad, error: squadError} = await getAdmin()
        .from("squads")
        .select("created_by")
        .eq("id", squadId)
        .single();

      if (squadError) throw squadError;

      if (squad.created_by !== userId) {
        throw new HttpsError("permission-denied",
          "User is not the creator of the squad");
      }
      const {error: deleteError} = await getAdmin()
        .from("squad_members")
        .delete()
        .eq("squad_id", squadId);

      if (deleteError) throw deleteError;

      // Delete squad
      const {error: deleteError2} = await getAdmin()
        .from("squads")
        .delete()
        .eq("id", squadId);

      if (deleteError2) throw deleteError2;

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
