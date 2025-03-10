import { Stack } from 'expo-router';
import { colors, typography } from '../constants/theme';

export default function HabitsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary.light,
        },
        headerTitleStyle: {
          fontSize: typography.size.lg,
          fontWeight: typography.weight.semibold as any,
        },
        headerTintColor: colors.primary.dark,
        headerBackTitle: 'Back',
        headerShadowVisible: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Daily Habits & Accountability',
        }}
      />
    </Stack>
  );
}