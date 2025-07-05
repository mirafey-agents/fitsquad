import { httpsCallable } from 'firebase/functions';
import { getAuthToken } from '../auth';
import { functions } from './config';

export async function getUserSessions(startDate: Date, endDate: Date) {
    try {
      const authToken = await getAuthToken();
      
      const result = await httpsCallable(functions, 'getUserSessions')({
        startDate, endDate, authToken
      });

      //Todo: Move this to the backend
      // Calculate votesFor for each participant in each session
      const sessionsWithVotes = (result.data as any[]).map(session => {
        if (!session.participants) {
          return {
            ...session,
            participants: [],
            mvpUserId: null
          };
        }
        
        const participantsWithVotes = session.participants?.map(participant => {
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
        const mvp = participantsWithVotes?.reduce((prev, current) => 
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
      sessionTrainersId: sessionId,
      fetchUsers,
      authToken
    });

    return result.data;
  } catch (error) {
    console.error('Error fetching workouts:', error);
    throw error;
  }
}

export async function createSessionTrainer({
  title, startTime, squadId, userIds, exercises
}: {
  title: string, startTime: string, squadId: string, userIds: Array<string>, exercises: Array<any>
}) {
  
  // console.log("title", title, "start", startTime, "squad", squadId, "users", userIds, "exercises", exercises);
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'createSessionTrainer')({
    title, startTime, squadId, userIds, exercises, authToken
  });
}

export async function createSessionUser(
  exercises: Array<any>, startDateTime: Date) {
  
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'createSessionUser')({
    authToken, exercises, startDateTime
  });
}

export async function updateSession(
  sessionId: string, status: string, sessionUsers: Array<any>) {
  const authToken = await getAuthToken();
  return httpsCallable(functions, 'updateSession')({
    sessionTrainersId: sessionId, status, sessionUsers, authToken
  });
}

export async function voteSession(sessionId: string, voteMvpId: string) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'voteSession')({
    sessionTrainersId: sessionId, voteMvpId, authToken
  });
}

export async function deleteSessionTrainer(sessionId: string) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'deleteSessionTrainer')({
    sessionTrainersId: sessionId, authToken
  });
}

export async function deleteSessionUser(sessionUsersId: string) {
  const authToken = await getAuthToken();
  return httpsCallable(functions, 'deleteSessionUser')({
    sessionUsersId, authToken
  });
}

export async function getSessionMediaReview(
  userId: string,
  sessionTrainersId: string
) {
  const authToken = await getAuthToken();

  return (await httpsCallable(functions, 'getSessionMediaReview')({
    userId, sessionTrainersId, authToken
  })).data;
} 