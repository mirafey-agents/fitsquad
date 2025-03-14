import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import HabitTracker from '../components/HabitTracker';
import AccountabilityPartner from '../components/AccountabilityPartner';

export default function Home2() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Habit Tracker Section */}
        <HabitTracker preview={true} />

        {/* Accountability Partner Section */}
        <AccountabilityPartner preview={true} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  content: {
    padding: spacing.md,
  },
  votedBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success + '20',
  },
  votedText: {
    fontSize: typography.size.xs,
    color: colors.semantic.success,
    fontWeight: typography.weight.medium as any,
  },
  upcomingWorkout: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  upcomingTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  upcomingExercise: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  upcomingExerciseName: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  upcomingExerciseDetails: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  noWorkout: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  noWorkoutText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginTop: spacing.sm,
  },
  noWorkoutSubtext: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  sectionTabs: {
    flexDirection: 'row',
    backgroundColor: colors.gray[100],
    margin: spacing.md,
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  sectionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  activeTab: {
    backgroundColor: colors.primary.light,
    ...shadows.sm,
  },
  sectionTabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
  },
  activeTabText: {
    color: colors.primary.dark,
  },
  feedbackSection: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flex: 1,
  },
  ratingTitle: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.semantic.warning,
    marginLeft: spacing.sm,
  },
  notesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  notesToggleText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  notesContent: {
    gap: spacing.md,
  },
  feedbackComment: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
    lineHeight: typography.lineHeight.relaxed,
  },
  feedbackSectionTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  feedbackItemText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  mediaSection: {
    marginTop: spacing.md,
  },
  mediaScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  mediaItem: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    overflow: 'hidden',
    ...shadows.sm,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
});