import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AdminOnboarding() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Your Squad</Text>
        <Text style={styles.subtitle}>Set up your fitness group</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Squad Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Morning Warriors"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Squad Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's your squad all about?"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Workout Schedule</Text>
          <View style={styles.scheduleGrid}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <Pressable key={day} style={styles.dayButton}>
                <Text style={styles.dayText}>{day}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Squad Privacy</Text>
          <View style={styles.privacyOptions}>
            <Pressable style={[styles.privacyOption, styles.selectedPrivacy]}>
              <Ionicons name="people" size={24} color="#4F46E5" />
              <Text style={styles.privacyTitle}>Public</Text>
              <Text style={styles.privacyDescription}>Anyone can join your squad</Text>
            </Pressable>
            <Pressable style={styles.privacyOption}>
              <Ionicons name="lock-closed" size={24} color="#64748B" />
              <Text style={styles.privacyTitle}>Private</Text>
              <Text style={styles.privacyDescription}>Members need approval to join</Text>
            </Pressable>
          </View>
        </View>

        <Link href="/(tabs)" asChild>
          <Pressable style={styles.createButton}>
            <Text style={styles.createButtonText}>Create Squad</Text>
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
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  scheduleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  privacyOptions: {
    gap: 12,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedPrivacy: {
    borderColor: '#4F46E5',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 12,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 12,
  },
  createButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});