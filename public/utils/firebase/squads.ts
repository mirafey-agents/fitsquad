import { httpsCallable } from 'firebase/functions';
import { getAuthToken } from '../auth';
import { functions } from './config';

export async function getSquads(squadId: string | null) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'getSquads')({
    squadId, authToken
  });
}

export async function createOrEditSquad(name, description, schedule, members, id=null) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'createOrEditSquad')({
    id,
    name,
    description,
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