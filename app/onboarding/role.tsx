import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Logo from '../components/Logo';

export default function RoleSelection() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Logo size="large" />
        <Text style={styles.title}>Welcome to FitSquad</Text>
        <Text style={styles.subtitle}>Choose your role to get started</Text>
      </View>

      <View style={styles.roles}>
        <Link href="/onboarding/trainer" asChild>
          <Animated.View entering={FadeInDown.delay(200)}>
            <Pressable style={styles.roleCard}>
              <BlurView intensity={80} style={styles.roleIcon}>
                <Ionicons name="shield" size={32} color="#4F46E5" />
              </BlurView>
              <Text style={styles.roleTitle}>Trainer</Text>
              <Text style={styles.roleDescription}>
                Create and manage workout groups, track progress, and lead your squad
              </Text>
              <Ionicons name="chevron-forward" size={24} color="#4F46E5" />
            </Pressable>
          </Animated.View>
        </Link>

        <Link href="/onboarding/member" asChild>
          <Animated.View entering={FadeInDown.delay(400)}>
            <Pressable style={styles.roleCard}>
              <BlurView intensity={80} style={styles.roleIcon}>
                <Ionicons name="fitness" size={32} color="#22C55E" />
              </BlurView>
              <Text style={styles.roleTitle}>Member</Text>
              <Text style={styles.roleDescription}>
                Join workout groups, participate in challenges, and track your progress
              </Text>
              <Ionicons name="chevron-forward" size={24} color="#22C55E" />
            </Pressable>
          </Animated.View>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
  },
  roles: {
    gap: 20,
  },
  roleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
});