'use client';

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const habitIcons = {
  // 'dashicons_food.svg': require('@/assets/images/habits/dashicons_food.svg'),
  // 'mdi_cup-water.svg': require('@/assets/images/habits/mdi_cup-water.svg'),
  // 'tabler_run.svg': require('@/assets/images/habits/tabler_run.svg'),
  // 'icon-park-solid_sleep.svg': require('@/assets/images/habits/icon-park-solid_sleep.svg'),
  // 'fxemoji_fire.svg': require('@/assets/images/habits/fxemoji_fire.svg'),
  // 'tabler_stretching.svg': require('@/assets/images/habits/tabler_stretching.svg'),
  // 'mdi_heart.svg': require('@/assets/images/habits/mdi_heart.svg'),
  // 'ri_time-line.svg': require('@/assets/images/habits/ri_time-line.svg'),
};

export default function AddHabitPage() {
  const [habitName, setHabitName] = useState('');

  const predefinedHabits = [
    // { icon: 'dashicons_food.svg', name: 'Eat a healthy meal' },
    // { icon: 'mdi_cup-water.svg', name: 'Drink water' },
    // { icon: 'tabler_run.svg', name: 'Exercise' },
    // { icon: 'icon-park-solid_sleep.svg', name: 'Sleep early' },
    // { icon: 'fxemoji_fire.svg', name: 'Meditate' },
    // { icon: 'tabler_stretching.svg', name: 'Stretch' },
    // { icon: 'mdi_heart.svg', name: 'Take vitamins' },
    // { icon: 'ri_time-line.svg', name: 'Read' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Add habit</Text>
          </View>

          <View style={styles.iconGrid}>
            {predefinedHabits.map((habit, index) => (
              <TouchableOpacity key={index} style={styles.iconContainer}>
                <Image
                  source={habitIcons[habit.icon]}
                  style={styles.habitIcon}
                  resizeMode="stretch"
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>Create your own</Text>
            <TextInput
              placeholder="Enter task title..."
              value={habitName}
              onChangeText={setHabitName}
              style={styles.input}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.predefinedSection}>
            <Text style={styles.sectionTitle}>Or choose one of our tasks</Text>
            {predefinedHabits.map((habit, index) => (
              <View key={index} style={styles.habitRow}>
                <Image
                  source={habitIcons[habit.icon]}
                  style={styles.habitIcon}
                  resizeMode="stretch"
                />
                <Text style={styles.habitName}>{habit.name}</Text>
                <Ionicons name="add" size={24} color="#FFFFFF"/>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#060712',
  },
  headerImage: {
    height: 24,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 21,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  iconContainer: {
    width: '18%',
    aspectRatio: 1,
    marginBottom: 15,
  },
  habitIcon: {
    width: '100%',
    height: '100%',
  },
  inputSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  predefinedSection: {
    marginBottom: 30,
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
  addIcon: {
    width: 24,
    height: 24,
  },
}); 