import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner',
    title: 'Beginner',
    icon: 'leaf',
    description: 'New to fitness or getting back into it',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    icon: 'fitness',
    description: 'Regular workout routine for 6+ months',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    icon: 'flame',
    description: 'Experienced with various workout types',
  },
];

const GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Endurance',
  'Flexibility',
  'Overall Health',
  'Strength',
];

export default function MemberOnboarding() {
  const [stats, setStats] = useState({
    weight: '',
    height: '',
    age: '',
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Help us personalize your experience</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Basic Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor="#94A3B8"
          />
          <View style={styles.statsGrid}>
            <TextInput
              style={[styles.input, styles.statInput]}
              placeholder="Weight (kg)"
              keyboardType="numeric"
              value={stats.weight}
              onChangeText={(text) => setStats(prev => ({ ...prev, weight: text }))}
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.input, styles.statInput]}
              placeholder="Height (cm)"
              keyboardType="numeric"
              value={stats.height}
              onChangeText={(text) => setStats(prev => ({ ...prev, height: text }))}
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.input, styles.statInput]}
              placeholder="Age"
              keyboardType="numeric"
              value={stats.age}
              onChangeText={(text) => setStats(prev => ({ ...prev, age: text }))}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Experience Level</Text>
          <View style={styles.experienceLevels}>
            {EXPERIENCE_LEVELS.map((level) => (
              <Pressable key={level.id} style={styles.experienceCard}>
                <View style={styles.experienceIcon}>
                  <Ionicons name={level.icon as any} size={24} color="#4F46E5" />
                </View>
                <Text style={styles.experienceTitle}>{level.title}</Text>
                <Text style={styles.experienceDescription}>{level.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fitness Goals</Text>
          <View style={styles.goalsGrid}>
            {GOALS.map((goal) => (
              <Pressable key={goal} style={styles.goalChip}>
                <Text style={styles.goalText}>{goal}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Link href="/(tabs)" asChild>
          <Pressable style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Start Your Journey</Text>
          </Pressable>
        </Link>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748B',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statInput: {
    flex: 1,
    marginBottom: 0,
  },
  experienceLevels: {
    gap: 12,
  },
  experienceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  experienceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  goalText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});