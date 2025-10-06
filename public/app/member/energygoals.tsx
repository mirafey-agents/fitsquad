import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { spacing, borderRadius, shadows } from '../../constants/theme';
import { format, subDays } from 'date-fns';
import { useSessions } from '@/app/context/SessionsContext';
import { LinearGradient } from 'expo-linear-gradient';

const useLastSevenDays = (sessions: Array<any>) => {
  return useMemo(() => {
    // Last 7 days including today
    const days = Array.from({ length: 7 }).map((_, offsetFromEnd) => subDays(new Date(), 6 - offsetFromEnd));
    return days.map((date) => {
      const dayKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toDateString();
      const value = sessions
        .filter((s) => new Date(s.start_time).toDateString() === dayKey)
        .reduce((acc, s) => acc + (typeof s.total_energy_points === 'number' ? s.total_energy_points : 0), 0);
      return { date, value: Math.round(value) };
    });
  }, [sessions]);
};

// compute average without calling hooks inside other hooks

export default function EnergyGoals() {
  const { sessions, refreshSessions } = useSessions();
  useEffect(() => {
    refreshSessions();
  }, []);
  const data = useLastSevenDays(sessions);
  const averagePoints = useMemo(() => {
    const totalPoints = data.reduce((acc, day) => acc + day.value, 0);
    return Math.round(totalPoints / 7);
  }, [data]);
  const maxValue = 200; // chart max

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>Energy Goals</Text>
        <View style={{ width: 24 }} />
      </View>

      <Animated.View entering={FadeInUp.delay(100)}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Energy Points</Text>
          <Text style={styles.cardSubtitle}>Last 7 days</Text>

          <View style={styles.chartArea}>
            {/* Y-axis labels */}
            <View style={styles.yAxisContainer}>
              <Text style={styles.yAxisLabel}>200</Text>
              <Text style={styles.yAxisLabel}>150</Text>
              <Text style={styles.yAxisLabel}>100</Text>
              <Text style={styles.yAxisLabel}>50</Text>
              <Text style={styles.yAxisLabel}>0</Text>
            </View>
            
            {/* Grid lines */}
            <View style={styles.gridContainer}>
              {[0, 50, 100, 150, 200].map((value, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.gridLine,
                    { bottom: (value / 200) * 200 }
                  ]}
                />
              ))}
            </View>

            <View style={styles.barsRow}>
              {data.map((d, idx) => {
                const h = Math.min(200, (d.value / 200) * 200); // cap at 200px
                return (
                  <View key={idx} style={styles.barItem}>
                    {d.value > 0 && (
                      <LinearGradient
                        colors={['#6EA8FF', '#2563FF']}
                        start={{ x: 0.5, y: 0 }}
                        end={{ x: 0.5, y: 1 }}
                        style={[styles.bar, { height: h }]}
                      />
                    )}
                    <Text style={styles.barLabel}>{format(d.date, 'EEE')}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200)}>
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightTitleRow}>
              <Ionicons name="pulse" size={16} color="#FFFFFF" />
              <Text style={styles.insightTitle}>Insight</Text>
            </View>
          </View>
          <Text style={styles.insightText}>
            You have earned an average of {averagePoints} energy points a day over the last seven days
          </Text>
        </View>
      </Animated.View>

      {/* Single insight only */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  card: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#23262F',
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  cardSubtitle: {
    color: '#9AAABD',
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  chartArea: {
    height: 220,
    position: 'relative',
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  yAxisContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 200,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  yAxisLabel: {
    color: '#9AAABD',
    fontSize: 12,
    textAlign: 'right',
  },
  gridContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 200,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#353D45',
    opacity: 0.5,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    height: 200,
    paddingRight: 40, // reserve space for Y-axis
    paddingLeft: 0,
  },
  barItem: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 12,
  },
  bar: {
    width: 24,
    borderRadius: 6,
    marginBottom: 4,
  },
  barLabel: {
    color: '#9AAABD',
    fontSize: 12,
    marginTop: spacing.xs,
  },
  barValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  insightCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: '#23262F',
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: spacing.xs,
  },
  insightTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // removed time row and chevron
  insightText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
});

