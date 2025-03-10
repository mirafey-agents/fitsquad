import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function MembersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="add" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="[id]/edit" />
      <Stack.Screen name="[id]/assessment" />
      <Stack.Screen name="invitations" />
    </Stack>
  );
}