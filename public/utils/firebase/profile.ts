import { httpsCallable } from 'firebase/functions';
import { getAuthToken } from '../auth';
import { functions } from './config';
import { setUserProfile } from '../storage';
import { getLoggedInUser } from '../auth';

export async function updateUserProfile(profileData: any) {
  const authToken = await getAuthToken();
  const userId = (await getLoggedInUser()).id;
  const result = await httpsCallable(functions, 'updateUserProfile')({
    userId, profileData, authToken
  });
  await cacheUserProfile(userId);
  return result;
}

export async function cacheUserProfile(userId: string) {
  const authToken = await getAuthToken();
  
  const {data: profile} = await httpsCallable(functions, 'getUserProfile')({
    userId, authToken
  });

  await setUserProfile(profile);
  return profile
}