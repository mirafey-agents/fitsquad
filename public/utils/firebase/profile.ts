import { httpsCallable } from 'firebase/functions';
import { getAuthToken, getLoggedInUser } from '../auth';
import { functions } from './config';

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