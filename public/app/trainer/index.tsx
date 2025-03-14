import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import Logo from '../../components/Logo';
import { router } from 'expo-router';

// Demo data
const QUICK_ACTIONS = [
  {
    id: 'manage-squads',
    title: 'Manage Squads',
    icon: 'people',
    color: '#FF3B30',
    route: '/trainer-dashboard/manage-squads',
  },
  {
    id: 'schedule',
    title: 'Schedule',
    icon: 'calendar',
    color: '#32ADE6',
    route: '/trainer-dashboard/schedule',
  },
  {
    id: 'manage-members',
    title: 'Manage Members',
    icon: 'person-add',
    color: '#32ADE6',
    route: '/trainer-dashboard/members',
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

export default function TrainerDashboard() {
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
          <Text style={styles.greeting}>Welcome back, Trainer!</Text>
          <Text style={styles.subtitle}>You have {UPCOMING_SESSIONS.length} sessions today</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {QUICK_ACTIONS.map((action, index) => (
              <Animated.View
                key={action.id}
                entering={FadeInUp.delay(index * 100)}
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
              entering={FadeInUp.delay(index * 100)}
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
                <Pressable 
                  style={styles.startSessionButton}
                  onPress={() => router.push(`/trainer-dashboard/session/${session.id}`)}
                >
                  <Ionicons name="play-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.startSessionText}>Start Session</Text>
                </Pressable>
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
  quickActions: {
    marginTop: 20,
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
  startSessionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  startSessionText: {
    color: '#FFFFFF',
    fontSize: 16,
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