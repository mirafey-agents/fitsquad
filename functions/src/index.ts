/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */


import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { verifySupabaseToken } from "./auth";
import { getWorkoutData } from "./supabase";
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


export const getWorkouts = onCall(async (request: any) => {
  try {
    // Validate input
    const { start_date, end_date, auth_token } = request.data;
    if (!start_date || !end_date || !auth_token) {
      throw new HttpsError(
        'invalid-argument',
        'Missing required parameters: start_date, end_date, or auth_token'
      );
    }

    // Verify dates are valid
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new HttpsError('invalid-argument','Invalid date format');
    }

    if (endDate < startDate) {
      throw new HttpsError('invalid-argument','End date must be after start date');
    }
    
    // Verify Supabase JWT and get user ID
    const {userId} = verifySupabaseToken(auth_token);
    // console.log(userId);
    
    // // Query workouts for the user within dat
    // if (error) {
    //   console.error('Supabase query error:', error);
    //   throw new functions.https.HttpsError('internal', 'Database query failed');
    // }
    const workouts = await getWorkoutData(startDate, endDate, userId);
    return workouts;

  } catch (error: any) {
    console.error('Function error:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', error.message);
  }
}); 