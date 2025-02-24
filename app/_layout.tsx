import { useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';
import Logo from './components/Logo';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  const drawerProgress = useSharedValue(0);

  const drawerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(drawerProgress.value, [0, 1], [1, 0.85]);
    const borderRadius = interpolate(drawerProgress.value, [0, 1], [0, 25]);

    return {
      transform: [{ scale }],
      borderRadius,
    };
  });

  const onDrawerStateChange = (isOpen: boolean) => {
    drawerProgress.value = withSpring(isOpen ? 1 : 0);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Drawer 
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#000000',
          headerTitle: '',
          drawerStyle: {
            backgroundColor: '#F2F2F7',
            width: 280,
            borderRightWidth: 0,
          },
          drawerItemStyle: {
            borderRadius: 12,
            marginHorizontal: 8,
            marginVertical: 4,
            paddingVertical: 4,
          },
          drawerLabelStyle: {
            marginLeft: -16,
            fontSize: 16,
            fontWeight: '500',
          },
          drawerActiveBackgroundColor: '#000000',
          drawerActiveTintColor: '#FFFFFF',
          drawerInactiveTintColor: '#000000',
          sceneContainerStyle: drawerAnimatedStyle,
        }}
        screenListeners={{
          drawerOpen: () => onDrawerStateChange(true),
          drawerClose: () => onDrawerStateChange(false),
        }}>
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Member Dashboard',
            drawerIcon: ({ color }) => (
              <Ionicons name="home" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="trainer-dashboard"
          options={{
            drawerLabel: 'Trainer Dashboard',
            drawerIcon: ({ color }) => (
              <Ionicons name="fitness" size={22} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="onboarding"
          options={{
            drawerLabel: 'Switch Profile',
            drawerIcon: ({ color }) => (
              <Ionicons name="swap-horizontal" size={22} color={color} />
            ),
          }}
        />
      </Drawer>
    </>
  );
}