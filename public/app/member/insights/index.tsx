import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { useSessions } from '@/app/context/SessionsContext';
import SquadInsights from './squad';
import TrainerInputs from './session';

export default function Insights() {
  const { refreshSessions } = useSessions();
  const [activeTab, setActiveTab] = useState<'squad' | 'trainer'>('trainer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    setLoading(true);
    refreshSessions();
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabs}>
          {/* <Pressable
            style={[styles.tab, activeTab === 'squad' && styles.activeTab]}
            onPress={() => setActiveTab('squad')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'squad' ? colors.primary.dark : colors.gray[500]} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'squad' && styles.activeTabText
            ]}>Squad Insights</Text>
          </Pressable> */}
          <Pressable
            style={[styles.tab, activeTab === 'trainer' && styles.activeTab]}
            onPress={() => setActiveTab('trainer')}
          >
            <Ionicons 
              name="clipboard" 
              size={20} 
              color={activeTab === 'trainer' ? colors.primary.dark : colors.gray[500]} 
            />
            <Text style={[
              styles.tabText,
              activeTab === 'trainer' && styles.activeTabText
            ]}>Workouts</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'squad' ? (
          <SquadInsights timeframe={timeframe} setTimeframe={setTimeframe} />
        ) : (
          <TrainerInputs loading={loading} error={error} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  header: {
    padding: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.gray[800],
    borderRadius: borderRadius.full,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  activeTab: {
    backgroundColor: colors.gray[700],
    ...shadows.sm,
  },
  tabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[400],
  },
  activeTabText: {
    color: colors.gray[200],
  },
  content: {
    flex: 1,
  },
}); 