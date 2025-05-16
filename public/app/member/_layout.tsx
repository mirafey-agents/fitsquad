import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, typography, spacing } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

export default function TabLayout() {
  const handleTabPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.gray[800],
          borderTopColor: colors.gray[800],
          borderTopWidth: 0.5,
          height: Platform.select({
            ios: 88,
            android: 68,
            default: 58,
          }),
          paddingBottom: Platform.select({
            ios: 34,
            android: 10,
            default: 0,
          }),
          ...shadows.md,
        },
        tabBarBackground: () => (
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill}>
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.gray[800], opacity: 0.95 },
              ]}
            />
          </BlurView>
        ),
        tabBarActiveTintColor: colors.gray[200],
        tabBarInactiveTintColor: colors.gray[500],
        tabBarLabelStyle: {
          fontSize: typography.size.xs,
          fontWeight: typography.weight.medium as any,
        },
      }}
      screenListeners={{
        tabPress: () => handleTabPress(),
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
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pulse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="challenges" options={{href: null}}/>
      <Tabs.Screen name="progress" options={{href: null}}/>
      <Tabs.Screen name="onboarding" options={{href: null}}/>
      <Tabs.Screen name="habits" options={{href: null}}/>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: Platform.OS === 'ios' ? -8 : 0,
    marginRight: spacing.sm,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    ...shadows.md,
  },
});