import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'fade',
    }}>
      <Stack.Screen name="role" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="user" />
    </Stack>
  );
}