import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

const PROGRESS_DATA = {
  groupProgress: {
    currentMonth: 85,
    lastMonth: 78,
    improvement: 7,
    totalWorkouts: 48,
    avgAttendance: 92,
    topPerformer: 'Sarah Chen',
  },
  memberProgress: [
    {
      id: '1',
      name: 'Sarah Chen',
      progress: 95,
      improvement: 12,
      consistency: 98,
      highlights: ['Most Improved', 'Perfect Attendance'],
    },
    {
      id: '2',
      name: 'Mike Ross',
      progress: 88,
      improvement: 5,
      consistency: 85,
      highlights: ['High Intensity'],
    },
    // Add more members...
  ],
};

export default function Progress() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Tracking</Text>
        <BlurView intensity={80} style={styles.periodSelector}>
          <Text style={styles.periodText}>Last 30 Days</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </BlurView>
      </View>

      <Animated.View 
        entering={FadeInUp.delay(200)}
        style={styles.groupProgressCard}
      >
        <Text style={styles.sectionTitle}>Group Progress</Text>
        
        <View style={styles.progressStats}>
          <View style={styles.progressStat}>
            <BlurView intensity={80} style={styles.statBadge}>
              <Ionicons name="trending-up" size={20} color="#22C55E" />
            </BlurView>
            <Text style={styles.statValue}>{PROGRESS_DATA.groupProgress.currentMonth}%</Text>
            <Text style={styles.statLabel}>Overall Progress</Text>
            <Text style={styles.improvement}>
              +{PROGRESS_DATA.groupProgress.improvement}% from last month
            </Text>
          </View>

          <View style={styles.progressStat}>
            <BlurView intensity={80} style={styles.statBadge}>
              <Ionicons name="fitness" size={20} color="#6366F1" />
            </BlurView>
            <Text style={styles.statValue}>{PROGRESS_DATA.groupProgress.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
            <Text style={styles.subtext}>
              {PROGRESS_DATA.groupProgress.avgAttendance}% attendance
            </Text>
          </View>
        </View>

        <View style={styles.topPerformer}>
          <Text style={styles.topPerformerLabel}>Top Performer</Text>
          <Text style={styles.topPerformerName}>
            {PROGRESS_DATA.groupProgress.topPerformer}
          </Text>
        </View>
      </Animated.View>

      <Text style={[styles.sectionTitle, { marginLeft: 20 }]}>Individual Progress</Text>

      {PROGRESS_DATA.memberProgress.map((member, index) => (
        <Animated.View
          key={member.id}
          entering={FadeInUp.delay(300 + index * 100)}
          style={styles.memberCard}
        >
          <View style={styles.memberHeader}>
            <Text style={styles.memberName}>{member.name}</Text>
            <BlurView intensity={80} style={styles.progressBadge}>
              <Text style={styles.progressText}>{member.progress}%</Text>
            </BlurView>
          </View>

          <View style={styles.memberStats}>
            <View style={styles.memberStat}>
              <Text style={styles.memberStatLabel}>Improvement</Text>
              <Text style={styles.memberStatValue}>+{member.improvement}%</Text>
            </View>
            <View style={styles.memberStat}>
              <Text style={styles.memberStatLabel}>Consistency</Text>
              <Text style={styles.memberStatValue}>{member.consistency}%</Text>
            </View>
          </View>

          <View style={styles.highlights}>
            {member.highlights.map((highlight, i) => (
              <BlurView key={i} intensity={80} style={styles.highlightBadge}>
                <Text style={styles.highlightText}>{highlight}</Text>
              </BlurView>
            ))}
          </View>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    gap: 4,
  },
  periodText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  groupProgressCard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  statBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  improvement: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  subtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  topPerformer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  topPerformerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  topPerformerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  memberCard: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
  },
  memberStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  memberStat: {
    flex: 1,
  },
  memberStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  memberStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  highlights: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  highlightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  highlightText: {
    fontSize: 12,
    color: '#6B7280',
  },
});