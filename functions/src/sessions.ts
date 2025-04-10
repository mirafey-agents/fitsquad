import {onCall, HttpsError} from "firebase-functions/v2/https";
import {getAdmin} from "./supabase";
import {verifySupabaseToken} from "./auth";

export const getUserSessions = onCall(
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
      const {data, error: fetchError} = await getAdmin().from("session_users")
        .select("*,session:sessions(id, title, start_time, status,"+
          "trainer:users!trainer_id(id, display_name))")
        .eq("user_id", userId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time", {ascending: true});
      if (fetchError) throw fetchError;

      const sessionIds = data.map((item: any) => item.session_id);
      const {data: sessionParticipants, error: sessionError} = await getAdmin()
        .from("session_users")
        .select("session_id, users!user_id(id, display_name)")
        .in("session_id", sessionIds);
      if (sessionError) throw sessionError;

      const participantsDict: any = {};
      sessionParticipants.forEach((item: any) => {
        participantsDict[item.session_id] =
        (participantsDict[item.session_id] || []).concat(item.users);
      });

      for (const userSession of data) {
        userSession.participants = participantsDict[userSession.session_id];
      }

      return data;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  });

export const getSessionParticipants = onCall(
  {secrets: ["SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"], cors: true},
  async (request: any) => {
    try {
      const {sessionId, authToken} = request.data;
      const {userId} = verifySupabaseToken(authToken);
      if (!userId) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      const {data, error: fetchError} = await getAdmin()
        .from("session_users")
        .select("partcipants:users!user_id(id, display_name)")
        .eq("session_id", sessionId);
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

export const getTrainerSessions = onCall(
  {secrets: ["SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"], cors: true},
  async (request: any) => {
    try {
      // Validate input
      const {
        startDate: stDt,
        endDate: enDt,
        sessionId: sId,
        authToken: auTkn,
        fetchUsers,
      } = request.data;

      if (!((stDt && enDt) || sId) || !auTkn) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      const {userId} = verifySupabaseToken(auTkn);

      const queryStr = fetchUsers ?
        ("*, session_users!session_id(*, " +
        "users!user_id(id, display_name, email))") :
        "*";
      let query = getAdmin().from("sessions")
        .select(queryStr).eq("trainer_id", userId);

      if (sId) {
        query = query.eq("id", sId);
      } else {
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
        query = query
          .gte("start_time", startDate.toISOString())
          .lte("start_time", endDate.toISOString())
          .order("start_time", {ascending: true});
      }
      const {data: sessions, fetchError: sessionsError} = await query;
      if (sessionsError) throw sessionsError;

      return sessions;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  });

export const getExercises = onCall(
  {secrets: ["SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"], cors: true},
  async (request: any) => {
    try {
    // Validate input
      const {authToken} = request.data;

      // Verify Supabase JWT and get user ID
      const {userId} = verifySupabaseToken(authToken);
      if (!userId) {
        throw new HttpsError("invalid-argument", "Invalid auth token");
      }
      // Fetch squads
      const {data, error: fetchError} = await getAdmin()
        .from("exercises").select("*");

      if (fetchError) throw fetchError;

      return data;
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  });

export const createOrEditSession = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {
        title,
        startTime,
        squadId,
        userIds,
        exercises,
        authToken,
        sessionId,
      } = request.data;
      // console.log(request.data);
      if (!title || !startTime || !exercises || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing one of: title, startTime, exercises, or authToken"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Get all users from participant squads
      let allUsers = [...userIds];
      if (squadId) {
        const {data: squadMembers, error: squadError} = await getAdmin()
          .from("squad_members")
          .select("user_id")
          .eq("squad_id", squadId);

        if (squadError) throw squadError;

        // Add unique users from squads
        const squadUserIds = squadMembers.map((member: any) => member.user_id);
        allUsers = [...new Set([...allUsers, ...squadUserIds])];
      }

      // Create or update workout
      const {data, error: updateError} = await getAdmin()
        .from("sessions")
        .upsert({
          "id": sessionId,
          title,
          "start_time": startTime,
          "trainer_id": userId,
          "updated_at": new Date().toISOString(),
          "status": "scheduled",
        })
        .select()
        .single();

      if (updateError) throw updateError;
      // Delete existing participants
      const {error: deleteError} = await getAdmin()
        .from("session_users")
        .delete()
        .eq("session_id", data.id);

      if (deleteError) throw deleteError;

      // Add participants
      const participantsData = allUsers.map((userId: string) => ({
        session_id: data.id,
        user_id: userId,
        start_time: startTime,
        squad_id: squadId,
        exercises,
        status: "scheduled",
        // scheduled, in_progress, completed, cancelled, missed
      }));

      const {error: participantsError} = await getAdmin()
        .from("session_users")
        .insert(participantsData);

      if (participantsError) throw participantsError;

      return {success: true, sessionId: data.id};
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const voteSession = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {sessionId, voteMVP, authToken} = request.data;
      if (!sessionId || !voteMVP || !authToken) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      const {error: updateError} = await getAdmin()
        .from("session_users")
        .update({vote_mvp: voteMVP})
        .eq("session_id", sessionId)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      return {success: true};
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  });

export const sessionFeedback = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {sessionId, authToken, userFeedbacks} = request.data;
      if (!sessionId || !authToken || !userFeedbacks) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }
      const {error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      for (const userFeedback of userFeedbacks) {
        const {error: updateError} = await getAdmin()
          .from("session_users")
          .update(
            {status: userFeedback.status,
              trainer_comment: userFeedback.trainerComment,
            })
          .eq("session_id", sessionId)
          .eq("user_id", userFeedback.userId);

        if (updateError) throw updateError;
      }
      return {success: true};
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  });

export const sessionStatus = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {sessionId, authToken, userFeedbacks} = request.data;
      if (!sessionId || !authToken || !userFeedbacks) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      const {error: updateError} = await getAdmin()
        .from("sessions")
        .update({status: "completed"})
        .eq("session_id", sessionId)
        .eq("trainer_id", userId);

      if (updateError) throw updateError;

      return {success: true};
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  });

export const deleteSession = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {sessionId, authToken} = request.data;

      if (!sessionId || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameters: session_id or auth_token"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // First verify the session belongs to the trainer
      const {data: session, error: fetchError} = await getAdmin()
        .from("sessions")
        .select("trainer_id")
        .eq("id", sessionId)
        .single();

      if (fetchError) throw fetchError;
      if (!session || session.trainer_id !== userId) {
        throw new HttpsError(
          "permission-denied",
          "You don't have permission to delete this session"
        );
      }

      // Delete from session_users first (due to foreign key constraint)
      const {error: deleteUsersError} = await getAdmin()
        .from("session_users")
        .delete()
        .eq("session_id", sessionId);

      if (deleteUsersError) throw deleteUsersError;

      // Delete from sessions
      const {error: deleteSessionError} = await getAdmin()
        .from("sessions")
        .delete()
        .eq("id", sessionId)
        .eq("trainer_id", userId);

      if (deleteSessionError) throw deleteSessionError;

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
