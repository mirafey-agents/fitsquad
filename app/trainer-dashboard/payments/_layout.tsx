import { Stack } from 'expo-router';

export default function PaymentsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="templates" />
      <Stack.Screen name="templates/[id]" />
      <Stack.Screen name="export" />
      <Stack.Screen name="reminders" />
    </Stack>
  );
}