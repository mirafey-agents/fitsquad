import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { initializeApp } from 'firebase/app';
import {generateVideoThumbnail} from './mediaUtils';
import { getAuth } from 'firebase/auth';
import { getAuthToken, getLoggedInUser } from './auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'asia-south1');
// console.log(functions);

// connectFunctionsEmulator(functions, '127.0.0.1', 5001);

// Initialize Firebase services
export const auth = getAuth(app);

export async function getUserSessions(startDate: Date, endDate: Date) {
    try {
      const authToken = await getAuthToken();
      
      const result = await httpsCallable(functions, 'getUserSessions')({
        startDate, endDate, authToken
      });

      //Todo: Move this to the backend
      // Calculate votesFor for each participant in each session
      const sessionsWithVotes = (result.data as any[]).map(session => {
        const participantsWithVotes = session.participants.map(participant => {
          // Count how many times this participant was voted for as MVP
          const votesFor = session.participants.filter(p => 
            p.vote_mvp_user_id === participant.id
          ).length;
          
          return {
            ...participant,
            votesFor
          };
        });

        // Find the participant with maximum votes
        const mvp = participantsWithVotes.reduce((prev, current) => 
          (prev.votesFor > current.votesFor) ? prev : current
        );

        return {
          ...session,
          participants: participantsWithVotes,
          mvpUserId: mvp.votesFor > 0 ? mvp.id : null
        };
      });
  
      return sessionsWithVotes;
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
}

export async function getTrainerSessions(
  startDate: Date=null, endDate: Date=null,
  sessionId: string=null, fetchUsers=false) {
  try {
    const authToken = await getAuthToken();
    
    const result = await httpsCallable(functions, 'getTrainerSessions')({
      startDate,
      endDate,
      sessionId,
      fetchUsers,
      authToken
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
}

export async function createMember(member: any) {

  const authToken = await getAuthToken();
  const {email, password, name, phone_number} = member;
  try {
    const result = await httpsCallable(functions, 'createMember')({
      email,
      password,
      name,
      phoneNumber:phone_number,
      authToken
    });
    return {data: result.data, error: null};
  } catch (error) {
    console.error('Error creating member:', error);
    return {data: null, error: error};
  }
}

export async function getMembers(memberId: string | null) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'getMembers')({
    memberId, authToken
  });
}

export async function updateUserProfile(profileData: any) {
  const authToken = await getAuthToken();
  const result = await httpsCallable(functions, 'updateUserProfile')({
    userId: getLoggedInUser().user.id, profileData, authToken
  });
  cacheUserProfile(getLoggedInUser().user.id);
  return result;
}

export async function getUserProfile(userId: string) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'getUserProfile')({
    userId, authToken
  });
}

export async function cacheUserProfile(userId: string) {
  const profile = (await getUserProfile(userId))?.data as any;
  console.log('profile to cache: ', profile);
  
  const data = getLoggedInUser();
  data.profile = profile;
  
  localStorage.setItem('loggedinUser', JSON.stringify(data));
}

export async function deleteMember(memberId: string | null) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'deleteMember')({
    memberId, authToken
  });
}

export async function getSquads(squadId: string | null) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'getSquads')({
    squadId, authToken
  });
}

export async function createOrEditSquad(name, description, isPrivate, schedule, members, id=null) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'createOrEditSquad')({
    id,
    name,
    description,
    isPrivate,
    schedule,
    members,
    authToken
  });
}

export async function deleteSquad(squadId: string) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'deleteSquad')(
    {squadId, authToken}
  );
} 

export async function getExercises() {
  const authToken = await getAuthToken();
  return httpsCallable(functions, 'getExercises')({authToken});
}

export async function createSession(
  title: string="", startTime: string= "", squadId: string="",
  userIds: Array<string>=null, exercises: Array<any>=null) {
  
  // console.log("title", title, "start", startTime, "squad", squadId, "users", userIds, "exercises", exercises);
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'createSession')({
    title, startTime, squadId, userIds, exercises, authToken
  });
}

export async function updateSession(
  sessionId: string, status: string, sessionUsers: Array<any>) {
  const authToken = await getAuthToken();
  return httpsCallable(functions, 'updateSession')({
    sessionId, status, sessionUsers, authToken
  });
}

export async function voteSession(sessionId: string, voteMvpId: string) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'voteSession')({
    sessionId, voteMvpId, authToken
  });
}

export async function deleteSession(sessionId: string) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'deleteSession')({
    sessionId, authToken
  });
}

export async function getHabitIdeas() {
  const authToken = await getAuthToken();
  
  return (await httpsCallable(functions, 'getHabitIdeas')({
    authToken
  })).data;
}

export async function getHabitsHistory() {
  const authToken = await getAuthToken();
  
  return (await httpsCallable(functions, 'getHabitsHistory')({
    authToken
  })).data;
}

export async function setHabitCompletion(
  habitId: string, date: Date,
  completed: boolean, completionId: string
) {
  const authToken = await getAuthToken();
  
  return (await httpsCallable(functions, 'setHabitCompletion')({
    habitId, date, completed, completionId, authToken
  })).data;
}

export async function addHabit(title: string, description: string, icon: string) {
  const authToken = await getAuthToken();
  
  return (await httpsCallable(functions, 'addHabit')({
    title, description, icon, authToken
  })).data;
}

export async function deleteHabit(habitId: string) {
  const authToken = await getAuthToken();
  
  return (await httpsCallable(functions, 'deleteHabit')({
    habitId, authToken
  })).data;
}

export async function uploadMedia(
  asset: any,
  userId: string,
  category: string,
  categoryId: string
) {
  const authToken = await getAuthToken();
  try {
    if (!userId) {
      userId = getLoggedInUser().user.id;
    }
    const {url, mediaId} = (await httpsCallable(functions, 'getUploadUrl')({
      authToken, userId, category, categoryId,
      mimeType: asset.mimeType,
    })).data as {url: string, mediaId: string};

    console.log('postUrl', url);

    const response = await fetch(url as string, {
      method: 'PUT',
      body: asset.file,
      headers: {
        "Content-Type": asset.mimeType,
        "x-goog-content-length-range": "0,20000000",
      },
    });

    // Generate thumbnail for videos
    let thumbnailBufferB64: string | undefined;
    if (asset.mimeType?.startsWith('video/')) {
      try {
        thumbnailBufferB64 = await generateVideoThumbnail(asset.file);
      } catch (error) {
        console.warn('Failed to generate video thumbnail:', error);
        // Continue without thumbnail if generation fails
      }
    }

    const processResult = (await httpsCallable(functions, 'processUploadedMedia')({
        authToken, 
        userId, 
        category, 
        categoryId, 
        mediaId,
        thumbnailBufferB64
      })).data;

    return response.status;
  } catch (error) {
    console.error('Error uploading media:', error);
    throw error;
  }
}

export async function getMedia(
  userId: string,
  category: string,
  categoryId: string,
  objectId: string
) {
  const authToken = await getAuthToken();

  return (await httpsCallable(functions, 'getMedia')({
    userId, category, categoryId, objectId, authToken
  }));
}

export async function deleteMedia(
  userId: string,
  category: string,
  categoryId: string,
  objectId: string
) {
  const authToken = await getAuthToken();
  if (!userId) {
    userId = getLoggedInUser().user.id;
  }
  return (await httpsCallable(functions, 'deleteMedia')({
    userId, category, categoryId, objectId, authToken
  }));
}

export async function listMedia(
  category: string,
  categoryId: string
) {
  const authToken = await getAuthToken();

  return (await httpsCallable(functions, 'listMedia')({
    userId: getLoggedInUser().user.id, category, categoryId, authToken
  })).data;
}

export async function getMediaFetchURL(
  userId: string,
  category: string,
  categoryId: string,
  objectId: string,
  isThumbnail: boolean = false
) {
  const authToken = await getAuthToken();

  return (await httpsCallable(functions, 'getMediaFetchUrl')({
    userId,
    category,
    categoryId,
    objectId,
    isThumbnail,
    authToken
  })).data;
}

export async function getSessionMediaReview(
  userId: string,
  sessionId: string
) {
  const authToken = await getAuthToken();

  return (await httpsCallable(functions, 'getSessionMediaReview')({
    userId, sessionId, authToken
  })).data;
}

export async function rzpCreateOrder(data: { userId: string; billingPlan: string }) {
  try {
    const authToken = await getAuthToken();
    
    const result = await httpsCallable(functions, 'rzpCreateOrder')({
      ...data,
      authToken
    });
    return result.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getSubscriptionPlans(data: { role: string }) {
  try {
    const authToken = await getAuthToken();
    
    const result = await httpsCallable(functions, 'getSubscriptionPlans')({
      ...data,
      authToken
    });
    return result.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
