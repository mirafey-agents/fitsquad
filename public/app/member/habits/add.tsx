'use client';

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useHabits } from '@/app/context/HabitsContext';

type IconName = keyof typeof Ionicons.glyphMap;

const predefinedHabits: Array<{ icon: IconName; title: string; description: string }> = [
  { icon: 'restaurant', title: 'Healthy meal', description: 'Eat a low-carb, high protein, high fiber meal' },
  { icon: 'water', title: 'Drink water', description: '8 glasses of water' },
  { icon: 'barbell', title: 'Weight training', description: '30 minutes of weight training' },
  { icon: 'moon', title: 'Sleep early', description: 'Sleep by 10pm' },
  { icon: 'body', title: 'Meditate', description: '10 minutes of meditation' },
  { icon: 'body', title: 'Stretch', description: '15 minutes of stretching' },
  { icon: 'heart', title: 'Cardio', description: '30 minutes of cardio' },
  { icon: 'book', title: 'Read', description: 'Read for 30 minutes' },
  { icon: 'person', title: 'Yoga', description: '30 minutes of yoga' },
  { icon: 'add-circle', title: 'Medication', description: 'Take medication' },
  { icon: 'flash', title: 'Vitamins', description: 'Take vitamins' },
  { icon: 'ban', title: 'No alcohol', description: 'No alcohol for 30 days' },
  { icon: 'logo-no-smoking', title: 'No smoking', description: 'No smoking for 30 days' },
  { icon: 'musical-notes', title: 'Play Guitar', description: 'Play guitar for 30 minutes' },
  { icon: 'file-tray', title: 'Clear emails', description: 'Clear your inbox' },
  { icon: 'checkmark-circle', title: 'Check in', description: 'Check in to your day' },
];

// Get all unique icons from predefinedHabits
const uniqueIcons: IconName[] = Array.from(new Set(predefinedHabits.map(h => h.icon)));

export default function AddHabitPage() {
  const { addHabit } = useHabits();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<IconName>('add-circle');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      await addHabit(title, description, selectedIcon);
      router.push('/member/habits', {relativeToDirectory: true});
    } catch (error) {
      console.error('Failed to add habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedSelect = (habit: { icon: IconName; title: string; description: string }) => {
    setSelectedIcon(habit.icon);
    setTitle(habit.title);
    setDescription(habit.description);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} scrollEnabled={!loading}>
        <View style={styles.content} pointerEvents={loading ? 'none' : 'auto'}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.push('/member/habits', {relativeToDirectory: true})}
              style={[styles.headerButton, loading && styles.headerButtonDisabled]}
              disabled={loading}
            >
              <Text style={styles.headerButtonText}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>Add Habit</Text>
            <Pressable
              onPress={handleSave}
              style={[styles.headerButton, loading && styles.headerButtonDisabled]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.headerButtonText}>Save</Text>
              )}
            </Pressable>
          </View>

          <View style={styles.iconSelector}>
            <Text style={styles.sectionTitle}>Choose an Icon</Text>
            <View style={styles.iconGrid}>
              {uniqueIcons.map((icon) => (
                <Pressable
                  key={icon}
                  style={[
                    styles.iconGridItem,
                    selectedIcon === icon && styles.selectedIcon,
                    loading && styles.iconGridItemDisabled
                  ]}
                  onPress={() => !loading && setSelectedIcon(icon)}
                  disabled={loading}
                >
                  <Ionicons name={icon} size={28} color="#fff" />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter habit title..."
              placeholderTextColor="#666"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter habit description..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          <View style={styles.predefinedSection}>
            <Text style={styles.sectionTitle}>Or choose one of our tasks</Text>
            {predefinedHabits.map((habit, index) => (
              <Pressable
                key={index}
                style={[styles.habitRow, loading && styles.habitRowDisabled]}
                onPress={() => !loading && handlePredefinedSelect(habit)}
                disabled={loading}
              >
                <Ionicons name={habit.icon} size={24} color="#FFFFFF" />
                <Text style={styles.habitName}>{habit.title}</Text>
                <Text style={styles.habitDesc}>{habit.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {loading && <View style={styles.loadingOverlay} pointerEvents="auto" />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#353D45',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  iconSelector: {
    marginBottom: 24,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  iconGridItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#353D45',
    marginRight: 12,
    marginBottom: 12,
  },
  selectedIcon: {
    backgroundColor: colors.semantic.success,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#353D45',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  actions: undefined,
  button: undefined,
  cancelButton: undefined,
  confirmButton: undefined,
  buttonText: undefined,
  predefinedSection: {
    marginBottom: 24,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  habitName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  habitDesc: {
    color: '#A1A1AA',
    fontSize: 14,
    flex: 2,
    marginLeft: 10,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  iconGridItemDisabled: {
    opacity: 0.5,
  },
  habitRowDisabled: {
    opacity: 0.5,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 10,
  },
}); 