import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TrainerDashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="create-squad" />
      <Stack.Screen name="manage-members" />
      <Stack.Screen name="workout-plans" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="session/[id]" />
      <Stack.Screen name="create-session" />
    </Stack>
  );
}