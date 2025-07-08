import { View, Text, StyleSheet, ScrollView, Pressable, TouchableOpacity, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router, Tabs } from 'expo-router';
import { useState } from 'react';
import { useEffect } from 'react';
import { getTrainerSessions } from '@/utils/firebase';
import SubscriptionModal from '@/app/components/SubscriptionModal';
import { getLoggedInUser } from '@/utils/auth';

// Demo data
const QUICK_ACTIONS = [
  {
    id: 'squads',
    title: 'Manage Squads',
    icon: 'people',
    color: '#FF3B30',
    route: './squads',
  },
  {
    id: 'schedule',
    title: 'Schedule',
    icon: 'calendar',
    color: '#32ADE6',
    route: './schedule',
  },
  {
    id: 'manage-members',
    title: 'Manage Members',
    icon: 'person-add',
    color: '#32ADE6',
    route: './members',
  },
  {
    id: 'workout-plans',
    title: 'Workout Plans',
    icon: 'calendar',
    color: '#FF9500',
    route: './workout-plans',
  },
  {
    id: 'payments',
    title: 'Payments',
    icon: 'card',
    color: '#34C759',
    route: './payments',
  },
];


export default function TrainerDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetchSessions();
    setUserData(getLoggedInUser().profile);
  }, []);

  async function fetchSessions() {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    const endDate = new Date()
    endDate.setUTCHours(23, 59, 59, 999);
    const sessions = await getTrainerSessions(startDate, endDate, null, true);
    console.log("sessions", sessions);
    setSessions(sessions as any[]);
  }

  function getSessionTime(time: string) {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#21262F', '#353D45']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Welcome {userData?.display_name}!</Text>
            <Text style={styles.subtitle}>You have {sessions.length} sessions today</Text>
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
                    onPress={() => router.push(action.route, {relativeToDirectory: true})}
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Sessions</Text>
              <Pressable 
                style={styles.createSessionSmallButton}
                onPress={() => router.push('./sessions/create', {relativeToDirectory: true})}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
            {sessions.map((session, index) => (
              <Animated.View
                key={session.id}
                entering={FadeInUp.delay(index * 100)}
              >
                <View style={styles.sessionCard}>
                  <View style={styles.sessionHeader}>
                    <View>
                      <Text style={styles.sessionTime}>{session.time}</Text>
                      <Text style={styles.sessionTitle}>{session.title}</Text>
                      <Text style={styles.squadName}>{getSessionTime(session.start_time)}</Text>
                      <Text style={styles.squadName}>{session.squad?.name || session.session_users.length > 1 ? "Squad" : session.session_users[0].display_name}</Text>
                    </View>
                    <View style={styles.sessionBadges}>
                      <BlurView intensity={80} style={styles.typeBadge}>
                        <Text style={styles.participantsText}>
                          {session.status}
                        </Text>
                      </BlurView>
                      <BlurView intensity={80} style={styles.participantsBadge}>
                        <Ionicons name="people" size={16} color="#000000" />
                        <Text style={styles.participantsText}>
                          {session.session_users?.length || ""}
                        </Text>
                      </BlurView>
                    </View>
                  </View>
                  <Pressable 
                    style={styles.startSessionButton}
                    onPress={() => router.push(`./sessions/${session.id}`, {relativeToDirectory: true})}
                  >
                    <Text style={styles.startSessionText}>View Session</Text>
                  </Pressable>
                </View>
              </Animated.View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription</Text>
            <View style={styles.bottomSection}>
            <View style={styles.subscriptionInfo}>
              {userData?.subscription_plan && new Date(userData.subscription_valid_until) > new Date() ? (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={16} color="#FFF" />
                  <Text style={styles.premiumText}>{userData.subscription_plan}</Text>
                  <Text style={styles.expiryText}>
                    Valid until {new Date(userData.subscription_valid_until).toLocaleDateString()}
                  </Text>
                </View>
              ) : (
                <View>
                  <View style={styles.freePlanBadge}>
                    <Text style={styles.freePlanText}>Free Plan</Text>
                  </View>
                  <Text style={styles.limitationText}>
                    Upto 3 clients in free plan. Upgrade to add more clients.
                  </Text>
                  <TouchableOpacity 
                    style={styles.getPremiumButton}
                    onPress={() => setShowSubscriptionModal(true)}
                  >
                    <Ionicons name="star-outline" size={20} color="#FFF" />
                    <Text style={styles.getPremiumText}>Upgrade Plan</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          </View>
        </View>
      </ScrollView>

      <SubscriptionModal 
        visible={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        userId={userData?.id || ''}
        role="trainer"
      />

      <Tabs.Screen
        options={{
          tabBarStyle: {
            backgroundColor: '#21262F',
            borderTopWidth: 0,
            elevation: 0,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C23',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#181C23',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
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
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  section: {
    marginTop: 32,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  createSessionSmallButton: {
    backgroundColor: '#4F46E5',
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCard: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sessionTime: {
    fontSize: 14,
    color: '#94A3B8',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 4,
  },
  squadName: {
    fontSize: 14,
    color: '#94A3B8',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  participantsText: {
    fontSize: 14,
    color: '#FFFFFF',
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
  bottomSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#21262F',
    borderRadius: 16,
  },
  subscriptionInfo: {
    alignItems: 'center',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#21262F',
    borderWidth: 1,
    borderColor: '#4F46E5',
    minWidth: 200,
    justifyContent: 'center',
  },
  premiumText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  expiryText: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: 8,
  },
  freePlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262F',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#64748B',
    minWidth: 200,
    justifyContent: 'center',
  },
  freePlanText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  limitationText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 8,
  },
  getPremiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginVertical: 8,
  },
  getPremiumText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    alignSelf: 'center',
  },
});