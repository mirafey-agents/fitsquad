import { httpsCallable } from 'firebase/functions';
import { getAuthToken } from '../auth';
import { functions } from './config';

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

export async function deleteMember(memberId: string | null) {
  const authToken = await getAuthToken();
  
  return httpsCallable(functions, 'deleteMember')({
    memberId, authToken
  });
} 