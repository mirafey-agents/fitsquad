import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  badge_url: string;
  requirements: Record<string, any>;
  progress?: number;
  completed?: boolean;
  completed_at?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
}

export default function AchievementCard({ achievement, onPress }: AchievementCardProps) {
  const getProgressColor = () => {
    if (achievement.completed) return colors.semantic.success;
    if (achievement.progress && achievement.progress > 66) return colors.semantic.warning;
    return colors.gray[400];
  };

  const formatProgress = () => {
    if (achievement.completed) return '100%';
    if (achievement.progress) return `${Math.round(achievement.progress)}%`;
    return '0%';
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <BlurView intensity={80} style={styles.content}>
        <View style={styles.header}>
          <Image 
            source={{ uri: achievement.badge_url }}
            style={styles.badge}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.name}>{achievement.name}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
          </View>
          {achievement.completed && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={24} color={colors.semantic.success} />
            </View>
          )}
        </View>

        <View style={styles.details}>
          <View style={styles.categoryBadge}>
            <Ionicons 
              name={
                achievement.category === 'workout' ? 'fitness' :
                achievement.category === 'habits' ? 'calendar' :
                achievement.category === 'social' ? 'people' :
                achievement.category === 'goals' ? 'flag' :
                'trophy'
              } 
              size={16} 
              color={colors.primary.dark} 
            />
            <Text style={styles.categoryText}>{achievement.category}</Text>
          </View>

          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={16} color={colors.semantic.warning} />
            <Text style={styles.pointsText}>{achievement.points} points</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: formatProgress(),
                  backgroundColor: getProgressColor(),
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{formatProgress()}</Text>
        </View>

        {achievement.completed && achievement.completed_at && (
          <View style={styles.completionInfo}>
            <Ionicons name="time" size={14} color={colors.gray[500]} />
            <Text style={styles.completionDate}>
              Completed on {new Date(achievement.completed_at).toLocaleDateString()}
            </Text>
          </View>
        )}
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: spacing.sm,
  },
  content: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
  },
  completedBadge: {
    marginLeft: spacing.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    textTransform: 'capitalize',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pointsText: {
    fontSize: typography.size.sm,
    color: colors.semantic.warning,
    fontWeight: typography.weight.medium as any,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBackground: {
    flex: 1,
    height: 6,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
    width: 40,
    textAlign: 'right',
  },
  completionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  completionDate: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
});