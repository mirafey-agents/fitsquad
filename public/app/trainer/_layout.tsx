import { Stack } from 'expo-router';
import { colors, spacing } from '@/constants/theme';
import { StyleSheet, Platform } from 'react-native';

export default function TrainerDashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.primary.light,
        },
      }}
    >
      <Stack.Screen 
        name="index" 
      />
      <Stack.Screen 
        name="edit-profile" 
      />
      <Stack.Screen 
        name="squads/create" 
      />
      <Stack.Screen 
        name="payments" 
      />
      <Stack.Screen 
        name="sessions/[id]" 
      />
      <Stack.Screen 
        name="sessions/create" 
      />
      <Stack.Screen 
        name="schedule" 
      />
      <Stack.Screen 
        name="members" 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: Platform.select({
      ios: -8,
      web: -4,
      default: 0,
    }),
    marginRight: spacing.sm,
  },
});