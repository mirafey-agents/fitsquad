import { spacing } from '@/constants/theme';
import { StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TrainerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#21262F',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="edit-profile" options={{href: null}}/>
      <Tabs.Screen name="members" options={{href: null}}/>
      <Tabs.Screen name="members/[id]" options={{href: null}}/>
      <Tabs.Screen name="members/create" options={{href: null}}/>
      <Tabs.Screen name="members/edit" options={{href: null}}/>
      <Tabs.Screen name="members/delete" options={{href: null}}/>
      <Tabs.Screen name="payments" options={{href: null}}/>
      <Tabs.Screen name="payments/create" options={{href: null}}/>
      <Tabs.Screen name="payments/edit" options={{href: null}}/>
      <Tabs.Screen name="payments/delete" options={{href: null}}/>
      <Tabs.Screen name="sessions/index" options={{href: null}}/>
      <Tabs.Screen name="sessions/[id]/index" options={{href: null}}/>
      <Tabs.Screen name="sessions/create" options={{href: null}}/>
      <Tabs.Screen name="sessions/edit" options={{href: null}}/>
      <Tabs.Screen name="schedule" options={{href: null}}/>
      <Tabs.Screen name="squads/index" options={{href: null}}/>
      <Tabs.Screen name="squads/[id]/members" options={{href: null}}/>
      <Tabs.Screen name="squads/[id]/calendar" options={{href: null}}/>
      <Tabs.Screen name="squads/[id]/_edit" options={{href: null}}/>
      <Tabs.Screen name="squads/[id]/edit" options={{href: null}}/>
      <Tabs.Screen name="squads/[id]" options={{href: null}}/>
      <Tabs.Screen name="squads/create" options={{href: null}}/>
      <Tabs.Screen name="squads/edit" options={{href: null}}/>
      <Tabs.Screen name="squads/delete" options={{href: null}}/>
      <Tabs.Screen name="workout-plans/index" options={{href: null}}/>
      <Tabs.Screen name="workout-plans/[id]" options={{href: null}}/>
      <Tabs.Screen name="workout-plans/[id]/assign" options={{href: null}}/>
      <Tabs.Screen name="workout-plans/create" options={{href: null}}/>
      <Tabs.Screen name="workout-plans/edit" options={{href: null}}/>
      <Tabs.Screen name="workout-plans/delete" options={{href: null}}/>
    </Tabs>
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