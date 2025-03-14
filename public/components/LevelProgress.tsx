import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Level {
  id: string;
  name: string;
  required_points: number;
  discount_percentage: number;
  badge_url: string;
}

interface LevelProgressProps {
  currentPoints: number;
  currentLevel: Level;
  nextLevel: Level | null;
  onPress?: () => void;
}

export default function LevelProgress({
  currentPoints,
  currentLevel,
  nextLevel,
  onPress,
}: LevelProgressProps) {
  const calculateProgress = () => {
    if (!nextLevel) return 100;
    const pointsForNextLevel = nextLevel.required_points - currentLevel.required_points;
    const pointsEarned = currentPoints - currentLevel.required_points;
    return Math.min(100, (pointsEarned / pointsForNextLevel) * 100);
  };

  const progress = calculateProgress();
  const pointsToNextLevel = nextLevel ? nextLevel.required_points - currentPoints : 0;

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <BlurView intensity={80} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelName}>{currentLevel.name} Level</Text>
            <Text style={styles.pointsText}>{currentPoints} points</Text>
          </View>
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={[colors.accent.coral, colors.accent.mint]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badge}
            >
              <Text style={styles.discountText}>{currentLevel.discount_percentage}% OFF</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          {nextLevel && (
            <Text style={styles.nextLevelText}>
              {pointsToNextLevel} points to {nextLevel.name}
            </Text>
          )}
        </View>

        <View style={styles.perks}>
          <View style={styles.perkItem}>
            <Ionicons name="star" size={16} color={colors.semantic.warning} />
            <Text style={styles.perkText}>Exclusive Challenges</Text>
          </View>
          <View style={styles.perkItem}>
            <Ionicons name="gift" size={16} color={colors.semantic.success} />
            <Text style={styles.perkText}>Special Rewards</Text>
          </View>
          {currentLevel.discount_percentage > 0 && (
            <View style={styles.perkItem}>
              <Ionicons name="pricetag" size={16} color={colors.semantic.info} />
              <Text style={styles.perkText}>{currentLevel.discount_percentage}% Discount</Text>
            </View>
          )}
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
  },
  content: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  pointsText: {
    fontSize: typography.size.md,
    color: colors.gray[600],
  },
  badgeContainer: {
    marginLeft: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  discountText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
  },
  progressContainer: {
    marginBottom: spacing.md,
  },
  progressBackground: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.coral,
    borderRadius: borderRadius.full,
  },
  nextLevelText: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    textAlign: 'right',
  },
  perks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  perkText: {
    fontSize: typography.size.sm,
    color: colors.gray[700],
  },
});