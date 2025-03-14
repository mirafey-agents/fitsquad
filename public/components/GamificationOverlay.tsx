import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../constants/theme';
import { supabase } from '../utils/supabase';

interface PointAward {
  points: number;
  description: string;
  timestamp: Date;
}

interface GamificationOverlayProps {
  userId: string;
}

export default function GamificationOverlay({ userId }: GamificationOverlayProps) {
  const [recentPoints, setRecentPoints] = useState<PointAward[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    const subscription = supabase
      .channel('points')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_points',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        const newPoints: PointAward = {
          points: payload.new.points,
          description: payload.new.description,
          timestamp: new Date(payload.new.created_at),
        };
        
        setRecentPoints(prev => [newPoints, ...prev].slice(0, 5));
        showPointAnimation(newPoints.points);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const showPointAnimation = (points: number) => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(-100);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate out after delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3000);
  };

  return (
    <View style={styles.container}>
      {recentPoints.map((award, index) => (
        <Animated.View
          key={`${award.timestamp.getTime()}-${index}`}
          style={[
            styles.pointAlert,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <BlurView intensity={80} style={styles.alertContent}>
            <View style={styles.pointIcon}>
              <Ionicons name="star" size={24} color={colors.semantic.warning} />
            </View>
            <View style={styles.pointInfo}>
              <Text style={styles.pointsEarned}>+{award.points} points</Text>
              <Text style={styles.pointDescription}>{award.description}</Text>
            </View>
          </BlurView>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
  },
  pointAlert: {
    marginBottom: spacing.sm,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.semantic.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  pointInfo: {
    flex: 1,
  },
  pointsEarned: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold as any,
    color: colors.semantic.warning,
    marginBottom: 2,
  },
  pointDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
  },
});