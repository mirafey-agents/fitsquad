/**
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {setGlobalOptions} from "firebase-functions/v2";

setGlobalOptions({region: "asia-south1"});

// Import functions from their respective files
export {getMembers, createMember, deleteMember} from "./members";
export {
  getUserSessions,
  getTrainerSessions,
  getExercises,
  createSession,
  updateSession,
  sessionFeedback,
  sessionStatus,
  deleteSession,
  getSessionParticipants,
  voteSession,
} from "./sessions";

export {
  getHabitIdeas,
  getHabitsHistory,
  addHabit,
  deleteHabit,
  setHabitCompletion,
} from "./habits";

export {
  getSquads,
  createOrEditSquad,
  deleteSquad,
} from "./squads";

export const helloWorld = onRequest(
  {cors: true},
  (request, response) => {
    logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
  });
