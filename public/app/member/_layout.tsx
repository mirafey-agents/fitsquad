import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

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
          backgroundColor: "#21262F",
          borderTopColor: "#21262F",
          borderTopWidth: 0,
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
        },
        tabBarBackground: () => (
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "#21262F", opacity: 0.95 },
              ]}
            />
          </BlurView>
        ),
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#9BA9BD",
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "bold",
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
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights/index"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => (
            <Ionicons name="analytics" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="challenges" options={{href: null}}/>
      <Tabs.Screen name="progress" options={{href: null}}/>
      <Tabs.Screen name="onboarding" options={{href: null}}/>
      <Tabs.Screen name="habits" options={{href: null}}/>
      <Tabs.Screen name="_insights" options={{href: null}}/>
      <Tabs.Screen name="insights/session" options={{href: null}}/>
      <Tabs.Screen name="insights/squad" options={{href: null}}/>
      <Tabs.Screen name="insights/[id]" options={{href: null}}/>
      <Tabs.Screen name="insights/add" options={{href: null}}/>
      <Tabs.Screen name="habits/add" options={{href: null}}/>
      <Tabs.Screen name="habits/index" options={{href: null}}/>
      <Tabs.Screen name="components/HabitsPreview" options={{href: null}}/>
      <Tabs.Screen name="components/MirrorPreview" options={{href: null}}/>
      <Tabs.Screen name="mirrormoment/index" options={{href: null}}/>
      <Tabs.Screen name="mirrormoment/capture" options={{href: null}}/>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: Platform.OS === 'ios' ? -8 : 0,
    marginRight: 8,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#060712",
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
});