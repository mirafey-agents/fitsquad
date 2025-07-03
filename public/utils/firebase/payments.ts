import { httpsCallable } from 'firebase/functions';
import { getAuthToken } from '../auth';
import { functions } from './config';

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