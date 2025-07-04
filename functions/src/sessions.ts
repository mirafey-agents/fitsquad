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
      const {data, error: fetchError} = await getAdmin()
        .from("session_users")
        .select("*,session:session_trainers(id, title, start_time, status,"+
          "trainer:users!trainer_id(id, display_name)),"+
          "session_media(media_id, review, content_type)")
        .eq("user_id", userId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .order("start_time", {ascending: true});
      if (fetchError) throw fetchError;

      const sessionTrainersIds =
        data.map((item: any) => item.session_trainers_id).filter(Boolean);

      const {data: sessionParticipants, error: sessionError} = await getAdmin()
        .from("session_users")
        .select(
          "session_trainers_id, vote_mvp_user_id, " +
          "users!user_id(id, display_name)")
        .in("session_trainers_id", sessionTrainersIds);
      if (sessionError) throw sessionError;

      const participantsDict: any = {};
      sessionParticipants.forEach((item: any) => {
        participantsDict[item.session_trainers_id] =
        (participantsDict[item.session_trainers_id] || []).concat(
          {...item.users, vote_mvp_user_id: item.vote_mvp_user_id}
        );
      });

      for (const userSession of data) {
        userSession.participants =
          participantsDict[userSession.session_trainers_id];
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

// export const getSessionParticipants = onCall(
//   {secrets: ["SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"], cors: true},
//   async (request: any) => {
//     try {
//       const {sessionId, authToken} = request.data;
//       const {userId} = verifySupabaseToken(authToken);
//       if (!userId) {
//         throw new HttpsError(
//            "unauthenticated",
//            "Invalid authentication token"
//         );
//       }
//       const {data, error: fetchError} = await getAdmin()
//         .from("session_users")
//         .select("partcipants:users!user_id(id, display_name)")
//         .eq("session_trainers_id", sessionTrainersId);
//       if (fetchError) throw fetchError;
//       return data;
//     } catch (error: any) {
//       console.error("Function error:", error);
//       if (error instanceof HttpsError) {
//         throw error;
//       }
//       throw new HttpsError("internal", error.message);
//     }
//   }
// );

export const getTrainerSessions = onCall(
  {secrets: ["SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"], cors: true},
  async (request: any) => {
    try {
      // Validate input
      const {
        startDate: stDt,
        endDate: enDt,
        sessionTrainersId: sId,
        authToken: auTkn,
        fetchUsers,
      } = request.data;

      if (!((stDt && enDt) || sId) || !auTkn) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }

      const {userId} = verifySupabaseToken(auTkn);

      const queryStr = fetchUsers ?
        ("*, session_users!session_trainers_id(*, " +
        "users!user_id(id, display_name, email),"+
        "session_media(media_id, review, content_type))") :
        "*";
      let query = getAdmin().from("session_trainers")
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

// export const getExercises = onCall(
//   {secrets: ["SUPABASE_JWT_SECRET", "SUPABASE_SERVICE_KEY"], cors: true},
//   async (request: any) => {
//     try {
//     // Validate input
//       const {authToken} = request.data;

//       // Verify Supabase JWT and get user ID
//       const {userId} = verifySupabaseToken(authToken);
//       if (!userId) {
//         throw new HttpsError("invalid-argument", "Invalid auth token");
//       }
//       // Fetch squads
//       const {data, error: fetchError} = await getAdmin()
//         .from("exercises").select("*");

//       if (fetchError) throw fetchError;

//       return data;
//     } catch (error: any) {
//       console.error("Function error:", error);
//       if (error instanceof HttpsError) {
//         throw error;
//       }
//       throw new HttpsError("internal", error.message);
//     }
//   });

export const createSessionTrainer = onCall(
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
      const {data, error: insertError} = await getAdmin()
        .from("session_trainers")
        .insert({
          title,
          "start_time": startTime,
          "trainer_id": userId,
          "updated_at": new Date().toISOString(),
          "status": "scheduled",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add participants
      const participantsData = allUsers.map((userId: string) => ({
        session_trainers_id: data.id,
        user_id: userId,
        start_time: startTime,
        squad_id: squadId,
        exercises,
        status: "scheduled",
        // scheduled, in_progress, completed, cancelled, absent
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

export const createSessionUser = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {authToken, exercises, startDateTime} = request.data;

      if (!authToken || !exercises || !startDateTime) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameters"
        );
      }
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError(
          "unauthenticated",
          "Invalid authentication token"
        );
      }
      await getAdmin()
        .from("session_users")
        .insert({
          session_trainers_id: null,
          user_id: userId,
          exercises: exercises,
          start_time: startDateTime,
          status: "completed",
        })
        .select()
        .single();
    } catch (error: any) {
      console.error("Function error:", error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", error.message);
    }
  }
);

export const updateSession = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {
        authToken,
        sessionTrainersId,
        status,
        sessionUsers,
      } = request.data;

      // console.log(request.data);
      if (!authToken || !status || !sessionTrainersId) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameters"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // Create or update workout
      const {error: updateError} = await getAdmin()
        .from("session_trainers")
        .update({
          "updated_at": new Date().toISOString(),
          "status": status,
        })
        .eq("id", sessionTrainersId)
        .eq("trainer_id", userId)
        .select()
        .single();

      if (updateError) throw updateError;

      for (const user of sessionUsers) {
        const {error: updateError} = await getAdmin()
          .from("session_users")
          .update({
            status: user.status,
            trainer_comments: user.trainer_comments,
            performance_score: user.performance_score,
            exercises: user.exercises,
            updated_at: new Date().toISOString(),
          })
          .eq("session_trainers_id", sessionTrainersId)
          .eq("user_id", user.user_id);

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
  }
);

export const voteSession = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {sessionTrainersId, voteMvpId, authToken} = request.data;
      if (!sessionTrainersId || !voteMvpId || !authToken) {
        throw new HttpsError("invalid-argument", "Missing required parameters");
      }
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }
      // console.log(userId, voteMvpId, sessionId);
      const {error: updateError} = await getAdmin()
        .from("session_users")
        .update({vote_mvp_user_id: voteMvpId})
        .eq("session_trainers_id", sessionTrainersId)
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

// export const sessionFeedback = onCall(
//   {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
//   async (request: any) => {
//     try {
//       const {sessionTrainersId, authToken, userFeedbacks} = request.data;
//       if (!sessionTrainersId || !authToken || !userFeedbacks) {
//         throw new HttpsError(
//            "invalid-argument",
//            "Missing required parameters"
//         );
//       }
//       const {error: tokenError} = verifySupabaseToken(authToken);
//       if (tokenError) {
//         throw new HttpsError(
//            "unauthenticated",
//            "Invalid authentication token"
//         );
//       }

//       for (const userFeedback of userFeedbacks) {
//         const {error: updateError} = await getAdmin()
//           .from("session_users")
//           .update(
//             {status: userFeedback.status,
//               trainer_comment: userFeedback.trainerComment,
//             })
//           .eq("session_trainers_id", sessionTrainersId)
//           .eq("user_id", userFeedback.userId);

//         if (updateError) throw updateError;
//       }
//       return {success: true};
//     } catch (error: any) {
//       console.error("Function error:", error);
//       if (error instanceof HttpsError) {
//         throw error;
//       }
//       throw new HttpsError("internal", error.message);
//     }
//   });

// export const sessionStatus = onCall(
//   {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
//   async (request: any) => {
//     try {
//       const {sessionTrainersId, authToken, userFeedbacks} = request.data;
//       if (!sessionTrainersId || !authToken || !userFeedbacks) {
//         throw new HttpsError(
//            "invalid-argument",
//            "Missing required parameters"
//         );
//       }
//       const {userId, error: tokenError} = verifySupabaseToken(authToken);
//       if (tokenError) {
//         throw new HttpsError(
//            "unauthenticated",
//            "Invalid authentication token"
//         );
//       }

//       const {error: updateError} = await getAdmin()
//         .from("session_trainers")
//         .update({status: "completed"})
//         .eq("id", sessionTrainersId)
//         .eq("trainer_id", userId);

//       if (updateError) throw updateError;

//       return {success: true};
//     } catch (error: any) {
//       console.error("Function error:", error);
//       if (error instanceof HttpsError) {
//         throw error;
//       }
//       throw new HttpsError("internal", error.message);
//     }
//   });

export const deleteSessionTrainer = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {sessionTrainersId, authToken} = request.data;

      if (!sessionTrainersId || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameters"
        );
      }

      // Verify Supabase JWT
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError("unauthenticated", "Invalid authentication token");
      }

      // First verify the session belongs to the trainer
      const {data: session, error: fetchError} = await getAdmin()
        .from("session_trainers")
        .select("trainer_id")
        .eq("id", sessionTrainersId)
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
        .eq("session_trainers_id", sessionTrainersId);

      if (deleteUsersError) throw deleteUsersError;

      // Delete from sessions
      const {error: deleteSessionError} = await getAdmin()
        .from("session_trainers")
        .delete()
        .eq("id", sessionTrainersId)
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

export const deleteSessionUser = onCall(
  {secrets: ["SUPABASE_SERVICE_KEY", "SUPABASE_JWT_SECRET"], cors: true},
  async (request: any) => {
    try {
      const {sessionUsersId, authToken} = request.data;
      if (!sessionUsersId || !authToken) {
        throw new HttpsError(
          "invalid-argument",
          "Missing required parameters"
        );
      }
      const {userId, error: tokenError} = verifySupabaseToken(authToken);
      if (tokenError) {
        throw new HttpsError(
          "unauthenticated",
          "Invalid authentication token"
        );
      }
      const {error: deleteError} = await getAdmin()
        .from("session_users")
        .delete()
        .eq("id", sessionUsersId)
        .eq("user_id", userId);
      if (deleteError) throw deleteError;
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

export const updateSessionMedia = async function(
  sessionTrainersId: string,
  userId: string,
  mediaId: string,
  review: string,
  contentType: string,
  isDelete = false
) {
  if (isDelete) {
    const {error} = await getAdmin()
      .from("session_media")
      .delete()
      .eq("session_trainers_id", sessionTrainersId)
      .eq("user_id", userId)
      .eq("media_id", mediaId);
    if (error) {
      console.log("Error deleting session media",
        sessionTrainersId, userId, mediaId, error);
      throw error;
    }
    return {success: true};
  } else {
    const {error} = await getAdmin()
      .from("session_media")
      .insert({
        session_trainers_id: sessionTrainersId,
        user_id: userId,
        media_id: mediaId,
        review: review,
        content_type: contentType,
      });
    if (error) {
      console.log("Error inserting session media",
        sessionTrainersId, userId, mediaId, error);
      throw error;
    }

    return {success: true};
  }
};
