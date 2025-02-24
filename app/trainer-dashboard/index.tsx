import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Logo from '../components/Logo';
import { router } from 'expo-router';
import { useState } from 'react';

const QUICK_ACTIONS = [
  {
    id: 'create-squad',
    title: 'Create Squad',
    icon: 'people',
    color: '#FF3B30',
    route: '/trainer-dashboard/create-squad',
  },
  {
    id: 'manage-members',
    title: 'Manage Members',
    icon: 'person-add',
    color: '#32ADE6',
    route: '/trainer-dashboard/manage-members',
  },
  {
    id: 'workout-plans',
    title: 'Workout Plans',
    icon: 'calendar',
    color: '#FF9500',
    route: '/trainer-dashboard/workout-plans',
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: 'card',
    color: '#34C759',
    route: '/trainer-dashboard/payments',
  },
];

const CLIENT_STATS = {
  personalTraining: {
    total: 15,
    active: 12,
    avgAttendance: 95,
    revenue: 180000,
  },
  groupTraining: {
    total: 30,
    active: 26,
    avgAttendance: 88,
    revenue: 105000,
  },
};

const UPCOMING_SESSIONS = [
  {
    id: '1',
    time: '06:30 AM',
    title: 'Morning HIIT',
    participants: 8,
    maxParticipants: 12,
    squad: 'Morning Warriors',
    type: 'Group Training',
  },
  {
    id: '2',
    time: '09:00 AM',
    title: 'Strength Training',
    participants: 1,
    maxParticipants: 1,
    squad: 'Personal Session',
    type: 'Personal Training',
  },
];

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to get dates for the calendar
const getCalendarDates = () => {
  const today = new Date();
  const dates = [];
  for (let i = -3; i <= 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

export default function TrainerDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarDates = getCalendarDates();

  const totalClients = CLIENT_STATS.personalTraining.total + CLIENT_STATS.groupTraining.total;
  const activeClients = CLIENT_STATS.personalTraining.active + CLIENT_STATS.groupTraining.active;
  const avgAttendance = Math.round(
    (CLIENT_STATS.personalTraining.avgAttendance * CLIENT_STATS.personalTraining.active +
     CLIENT_STATS.groupTraining.avgAttendance * CLIENT_STATS.groupTraining.active) / activeClients
  );
  const totalRevenue = CLIENT_STATS.personalTraining.revenue + CLIENT_STATS.groupTraining.revenue;

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#818CF8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Logo size="large" />
          <View style={styles.profileSection}>
            <Pressable 
              style={styles.editProfile}
              onPress={() => router.push('/trainer-dashboard/edit-profile')}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </Pressable>
          </View>
          <Text style={styles.greeting}>Welcome back, Coach!</Text>
          <Text style={styles.subtitle}>You have 2 sessions today</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <Animated.View 
            entering={FadeInUp.delay(200)}
            style={[styles.statCard, { backgroundColor: '#FFE1E1' }]}
          >
            <BlurView intensity={80} style={styles.statIcon}>
              <Ionicons name="people" size={24} color="#FF3B30" />
            </BlurView>
            <Text style={styles.statValue}>{totalClients}</Text>
            <Text style={styles.statLabel}>Total Clients</Text>
            <View style={styles.statBreakdown}>
              <Text style={styles.breakdownText}>PT: {CLIENT_STATS.personalTraining.total}</Text>
              <Text style={styles.breakdownText}>GT: {CLIENT_STATS.groupTraining.total}</Text>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(300)}
            style={[styles.statCard, { backgroundColor: '#E1F5FF' }]}
          >
            <BlurView intensity={80} style={styles.statIcon}>
              <Ionicons name="fitness" size={24} color="#32ADE6" />
            </BlurView>
            <Text style={styles.statValue}>{activeClients}</Text>
            <Text style={styles.statLabel}>Active Clients</Text>
            <View style={styles.statBreakdown}>
              <Text style={styles.breakdownText}>PT: {CLIENT_STATS.personalTraining.active}</Text>
              <Text style={styles.breakdownText}>GT: {CLIENT_STATS.groupTraining.active}</Text>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(400)}
            style={[styles.statCard, { backgroundColor: '#FFE8D9' }]}
          >
            <BlurView intensity={80} style={styles.statIcon}>
              <Ionicons name="trending-up" size={24} color="#FF9500" />
            </BlurView>
            <Text style={styles.statValue}>{avgAttendance}%</Text>
            <Text style={styles.statLabel}>Avg. Attendance</Text>
            <View style={styles.statBreakdown}>
              <Text style={styles.breakdownText}>PT: {CLIENT_STATS.personalTraining.avgAttendance}%</Text>
              <Text style={styles.breakdownText}>GT: {CLIENT_STATS.groupTraining.avgAttendance}%</Text>
            </View>
          </Animated.View>

          <Animated.View 
            entering={FadeInUp.delay(500)}
            style={[styles.statCard, { backgroundColor: '#E8FFE1' }]}
          >
            <BlurView intensity={80} style={styles.statIcon}>
              <Ionicons name="cash" size={24} color="#34C759" />
            </BlurView>
            <Text style={styles.statValue}>{formatCurrency(totalRevenue)}</Text>
            <Text style={styles.statLabel}>Monthly Revenue</Text>
            <View style={styles.statBreakdown}>
              <Text style={styles.breakdownText}>PT: {formatCurrency(CLIENT_STATS.personalTraining.revenue)}</Text>
              <Text style={styles.breakdownText}>GT: {formatCurrency(CLIENT_STATS.groupTraining.revenue)}</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            <Pressable 
              style={styles.addSessionButton}
              onPress={() => router.push('/trainer-dashboard/create-session')}
            >
              <Ionicons name="add" size={20} color="#4F46E5" />
              <Text style={styles.addSessionText}>Add Session</Text>
            </Pressable>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.calendar}
          >
            {calendarDates.map((date, index) => {
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = date.toDateString() === selectedDate.toDateString();
              
              return (
                <Pressable
                  key={date.toISOString()}
                  style={[
                    styles.calendarDay,
                    isSelected && styles.selectedDay,
                    isToday && styles.today,
                  ]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text style={[
                    styles.dayName,
                    isSelected && styles.selectedDayText,
                  ]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text style={[
                    styles.dayNumber,
                    isSelected && styles.selectedDayText,
                  ]}>
                    {date.getDate()}
                  </Text>
                  {isToday && (
                    <View style={styles.todayDot} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.id}
                entering={FadeInUp.delay(600 + index * 100)}
                style={styles.actionCardContainer}
              >
                <Pressable 
                  style={styles.actionCard}
                  onPress={() => router.push(action.route)}
                >
                  <BlurView intensity={80} style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </BlurView>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Sessions</Text>
          {UPCOMING_SESSIONS.map((session, index) => (
            <Animated.View
              key={session.id}
              entering={FadeInUp.delay(1000 + index * 100)}
            >
              <Pressable 
                style={styles.sessionCard}
                onPress={() => router.push(`/trainer-dashboard/session/${session.id}`)}
              >
                <View style={styles.sessionHeader}>
                  <View>
                    <Text style={styles.sessionTime}>{session.time}</Text>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <Text style={styles.squadName}>{session.squad}</Text>
                  </View>
                  <View style={styles.sessionBadges}>
                    <BlurView intensity={80} style={styles.typeBadge}>
                      <Text style={styles.typeText}>{session.type}</Text>
                    </BlurView>
                    <BlurView intensity={80} style={styles.participantsBadge}>
                      <Ionicons name="people" size={16} color="#000000" />
                      <Text style={styles.participantsText}>
                        {session.participants}/{session.maxParticipants}
                      </Text>
                    </BlurView>
                  </View>
                </View>
                <View style={styles.sessionActions}>
                  <Pressable 
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => router.push(`/trainer-dashboard/session/${session.id}/start`)}
                  >
                    <Text style={styles.actionButtonText}>Start Session</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`/trainer-dashboard/session/${session.id}`)}
                  >
                    <Text style={styles.secondaryButtonText}>View Details</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Pressable 
          style={styles.createSessionButton}
          onPress={() => router.push('/trainer-dashboard/create-session')}
        >
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.createSessionText}>Create New Session</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContent: {
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  editProfileText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: -40,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statBreakdown: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  breakdownText: {
    fontSize: 12,
    color: '#64748B',
  },
  calendarSection: {
    marginTop: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0FF',
    borderRadius: 20,
  },
  addSessionText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  calendar: {
    flexDirection: 'row',
  },
  calendarDay: {
    width: 64,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  selectedDay: {
    backgroundColor: '#4F46E5',
  },
  today: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  dayName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4F46E5',
    marginTop: 4,
  },
  quickActions: {
    marginTop: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  actionCardContainer: {
    flex: 1,
    minWidth: '45%',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionTime: {
    fontSize: 14,
    color: '#64748B',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
  },
  squadName: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  sessionBadges: {
    alignItems: 'flex-end',
    gap: 8,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  participantsText: {
    fontSize: 14,
    color: '#000000',
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
  },
  createSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  createSessionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});