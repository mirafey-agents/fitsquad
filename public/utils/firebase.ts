// Import all sub-modules
import * as Sessions from './firebase/sessions';
import * as Members from './firebase/members';
import * as Squads from './firebase/squads';
import * as Habits from './firebase/habits';
import * as Media from './firebase/media';
import * as Profile from './firebase/profile';
import * as Payments from './firebase/payments';
import * as Exercises from './firebase/exercises';

// Import centralized Firebase config
export { auth } from './firebase/config';

// Re-export all functions to maintain the same API
export const {
  getUserSessions,
  getTrainerSessions,
  createSessionTrainer,
  createSessionUser,
  updateSession,
  voteSession,
  deleteSessionTrainer,
  deleteSessionUser,
  getSessionMediaReview
} = Sessions;

export const {
  createMember,
  getMembers,
  deleteMember
} = Members;

export const {
  getSquads,
  createOrEditSquad,
  deleteSquad
} = Squads;

export const {
  getHabitIdeas,
  getHabitsHistory,
  setHabitCompletion,
  addHabit,
  deleteHabit
} = Habits;

export const {
  uploadMedia,
  getMedia,
  deleteMedia,
  listMedia,
  getMediaFetchURL
} = Media;

export const {
  updateUserProfile,
  cacheUserProfile
} = Profile;

export const {
  rzpCreateOrder,
  getSubscriptionPlans
} = Payments;

export const {
  getExercises,
  getExercisesByModuleType,
} = Exercises;
