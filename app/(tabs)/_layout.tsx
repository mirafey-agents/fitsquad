import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Pressable, View } from 'react-native';
import Logo from '../components/Logo';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: false,
          headerTitle: () => <Logo size="small" />,
          headerLeft: () => <DrawerToggleButton tintColor="#000000" />,
          headerStyle: {
            backgroundColor: '#F2F2F7',
          },
          headerShadowVisible: false,
        }} 
      />
      <Tabs 
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: '#FFFFFF',
            borderTopColor: '#F2F2F7',
            borderTopWidth: 0.5,
            height: Platform.select({
              ios: 88,
              android: 68,
              default: 58
            }),
            paddingBottom: Platform.select({
              ios: insets.bottom,
              android: 10,
              default: 0
            }),
          },
          tabBarBackground: () => (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFFFFF', opacity: 0.95 }]} />
            </BlurView>
          ),
          tabBarActiveTintColor: '#000000',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarHideOnKeyboard: true,
        }}>
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
          name="analytics"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pulse" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarLabelStyle: {
              marginTop: -4,
            },
            tabBarIcon: ({ color }) => (
              <View style={styles.addButton}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="challenges"
          options={{
            title: 'Challenges',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trophy" size={size} color={color} />
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
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
});