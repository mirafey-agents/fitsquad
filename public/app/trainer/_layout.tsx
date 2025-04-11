import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, typography, spacing } from '../../constants/theme';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function TrainerDashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary.light,
          ...Platform.select({
            ios: {
              height: 44,
            },
            android: {
              height: 56,
            },
            web: {
              height: 40,
            },
          }),
        },
        headerTintColor: colors.primary.dark,
        headerTitleStyle: {
          fontWeight: typography.weight.semibold as any,
          fontSize: typography.size.lg,
          ...Platform.select({
            web: {
              fontSize: typography.size.md,
            },
          }),
        },
        headerLeft: undefined,
        headerBackground: () => (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.primary.light, opacity: 0.95 }]} />
          </BlurView>
        ),
        contentStyle: {
          backgroundColor: colors.primary.light,
        },
        headerShadowVisible: false,
        headerLargeTitle: false,
        headerTitleAlign: 'center',
        ...Platform.select({
          ios: {
            headerTopInsetEnabled: false,
          },
          android: {
            headerStyle: {
              backgroundColor: colors.primary.light,
              height: 56,
            },
          },
          web: {
            headerStyle: {
              backgroundColor: colors.primary.light,
              height: 40,
            },
          },
        }),
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{
          title: 'Trainer Dashboard',
          headerLargeTitle: true,
          headerLeft: null,
        }}
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen 
        name="squads/create" 
        options={{
          title: 'Create Squad',
        }}
      />
      {/* <Stack.Screen 
        name="workout-plans" 
        options={{
          title: 'Workout Plans',
        }}
      /> */}
      <Stack.Screen 
        name="payments" 
        options={{
          title: 'Payments',
        }}
      />
      <Stack.Screen 
        name="sessions/[id]" 
        options={{
          title: 'Session Details',
        }}
      />
      <Stack.Screen 
        name="sessions/create" 
        options={{
          title: 'Create Session',
        }}
      />
      <Stack.Screen 
        name="schedule" 
        options={{
          title: 'Schedule',
        }}
      />
      <Stack.Screen 
        name="members" 
        options={{
          title: 'Members',
        }}
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