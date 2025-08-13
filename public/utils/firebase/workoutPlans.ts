import { getAuthToken } from '../auth';
import { httpsCallable } from 'firebase/functions';
import { functions } from './config';

export interface WorkoutPlan {
  id: string;
  name: string;
  exercises: Array<{
    exercise_name: string;
    sets: number;
    reps: number;
    module_type: string;
    type: string;
    energy_points: number;
  }>;
  created_by: string;
  created_at: any;
  updated_at: any;
}

export interface CreateWorkoutPlanData {
  name: string;
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    module_type: string;
    type: string;
    energy_points: number;
  }>;
}

export async function getWorkoutPlans(ids: string[] = null) {
    const authToken = await getAuthToken();

    const {data: plans} = await httpsCallable(functions, 'getWorkoutPlans')({
      authToken: authToken,
      ids: ids
    })
    
    return plans;
}

export async function deleteWorkoutPlan(id: string) {
    const authToken = await getAuthToken();
  
    const {data} = await httpsCallable(functions, 'deleteWorkoutPlan')({
      authToken: authToken,
      workoutPlanId: id
    });
    
    return data;
}

export async function createWorkoutPlan({
  name,
  exercises
}: {
  name: string;
  exercises: Array<{
  name: string;
  sets: number;
  reps: number;
  module_type: string;
  type: string;
  energy_points: number;
}>
}) {
  const authToken = await getAuthToken();

  return httpsCallable(functions, "createWorkoutPlan")({
    authToken,
    name,
    exercises
  });
}