import { httpsCallable } from 'firebase/functions';
import { getAuthToken } from '../auth';
import { functions } from './config';

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