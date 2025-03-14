import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, typography, spacing } from '../constants/theme';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { DrawerToggleButton } from '@react-navigation/drawer';

export default function TrainerDashboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary.light,
        },
        headerTintColor: colors.primary.dark,
        headerTitleStyle: {
          fontWeight: typography.weight.semibold as any,
          fontSize: typography.size.lg,
        },
        headerLeft: () => (
          <View style={styles.headerLeft}>
            <DrawerToggleButton tintColor={colors.primary.dark} />
          </View>
        ),
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
            headerTopInsetEnabled: true,
          },
          android: {
            headerStyle: {
              backgroundColor: colors.primary.light,
              height: 64 + spacing.xl,
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
        }}
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen 
        name="create-squad" 
        options={{
          title: 'Create Squad',
        }}
      />
      <Stack.Screen 
        name="manage-members" 
        options={{
          title: 'Manage Members',
        }}
      />
      <Stack.Screen 
        name="workout-plans" 
        options={{
          title: 'Workout Plans',
        }}
      />
      <Stack.Screen 
        name="payments" 
        options={{
          title: 'Payments',
        }}
      />
      <Stack.Screen 
        name="session/[id]" 
        options={{
          title: 'Session Details',
        }}
      />
      <Stack.Screen 
        name="create-session" 
        options={{
          title: 'Create Session',
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
    marginLeft: Platform.OS === 'ios' ? -8 : 0,
    marginRight: spacing.sm,
  },
});