import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  colors,
  shadows,
  typography,
  spacing,
  borderRadius,
} from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingFlow from '../../components/OnboardingFlow';
import { checkOnboardingStatus } from '../../utils/supabase';
import { router } from 'expo-router';

const PROFILE_DATA = {
  name: 'Guest',
  email: 'guest@fitsquad.com',
  memberSince: '2024',
  stats: {
    workouts: 48,
    attendance: 92,
    calories: '12.4k',
    achievements: 15,
  },
  goals: ['Weight Loss', 'Muscle Gain', 'Improved Fitness'],
  preferences: {
    workoutTimes: ['Morning', 'Evening'],
    fitnessLevel: 'Intermediate',
    focusAreas: ['Upper Body', 'Core', 'Cardio'],
  },
  achievements: [
    {
      id: '1',
      title: 'Perfect Week',
      description: 'Completed all scheduled workouts',
      date: '2024-02-20',
      icon: '🎯',
    },
    {
      id: '2',
      title: 'Early Bird',
      description: 'Completed 5 morning workouts',
      date: '2024-02-15',
      icon: '🌅',
    },
    {
      id: '3',
      title: 'Squad Leader',
      description: 'Top performer in group challenges',
      date: '2024-02-10',
      icon: '👑',
    },
  ],
  upcomingWorkouts: [
    {
      id: '1',
      title: 'Morning HIIT',
      time: '06:30 AM',
      trainer: 'Sarah Chen',
      type: 'Group',
    },
    {
      id: '2',
      title: 'Strength Training',
      time: '05:30 PM',
      trainer: 'Mike Ross',
      type: 'Personal',
    },
  ],
};

export default function Profile() {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    checkOnboardingStatus().then(({ isComplete, userData }) => {
      setIsOnboardingComplete(isComplete);
      setUserData(userData);
    });
  }, []);

  const handleOnboardingComplete = () => {
    setIsOnboardingComplete(true);
    setShowOnboarding(false);
    // Refresh user data
    checkOnboardingStatus().then(({ userData }) => {
      setUserData(userData);
    });
  };

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        initialData={userData}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.accent.coral, colors.accent.mint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop',
              }}
              style={styles.avatar}
            />
            <View style={styles.editAvatarButton}>
              <Ionicons name="camera" size={16} color={colors.primary.light} />
            </View>
          </View>
          <Text style={styles.name}>
            {userData?.display_name || PROFILE_DATA.name}
          </Text>
          <Text style={styles.email}>
            {userData?.email || PROFILE_DATA.email}
          </Text>
          <Text style={styles.memberSince}>
            Member since {PROFILE_DATA.memberSince}
          </Text>
        </View>
      </LinearGradient>

      {!isOnboardingComplete && (
        <View style={styles.onboardingBanner}>
          <View style={styles.bannerContent}>
            <Ionicons
              name="information-circle"
              size={24}
              color={colors.semantic.info}
            />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Complete Your Profile</Text>
              <Text style={styles.bannerDescription}>
                Take a moment to set up your profile for a personalized fitness
                experience.
              </Text>
            </View>
          </View>
          <Pressable
            style={styles.completeButton}
            onPress={() => setShowOnboarding(true)}
          >
            <Text style={styles.completeButtonText}>Complete Now</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.statsContainer}>
        <Animated.View
          entering={FadeInUp.delay(100)}
          style={[styles.statCard, { backgroundColor: '#FFE1E1' }]}
        >
          <Text style={styles.statValue}>{PROFILE_DATA.stats.workouts}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp.delay(200)}
          style={[styles.statCard, { backgroundColor: '#E1F5FF' }]}
        >
          <Text style={styles.statValue}>{PROFILE_DATA.stats.attendance}%</Text>
          <Text style={styles.statLabel}>Attendance</Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp.delay(300)}
          style={[styles.statCard, { backgroundColor: '#FFE8D9' }]}
        >
          <Text style={styles.statValue}>{PROFILE_DATA.stats.calories}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </Animated.View>
        <Animated.View
          entering={FadeInUp.delay(400)}
          style={[styles.statCard, { backgroundColor: '#E8FFE1' }]}
        >
          <Text style={styles.statValue}>
            {PROFILE_DATA.stats.achievements}
          </Text>
          <Text style={styles.statLabel}>Achievements</Text>
        </Animated.View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fitness Goals</Text>
        <View style={styles.goalsContainer}>
          {(userData?.goals || PROFILE_DATA.goals).map((goal, index) => (
            <Animated.View
              key={goal}
              entering={FadeInUp.delay(500 + index * 100)}
              style={styles.goalChip}
            >
              <Text style={styles.goalText}>{goal}</Text>
            </Animated.View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Animated.View
          entering={FadeInUp.delay(800)}
          style={styles.preferencesCard}
        >
          <View style={styles.preferenceItem}>
            <Ionicons name="time" size={20} color={colors.primary.dark} />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>
                Preferred Workout Times
              </Text>
              <View style={styles.preferenceChips}>
                {(
                  userData?.preferred_workout_times ||
                  PROFILE_DATA.preferences.workoutTimes
                ).map((time) => (
                  <Text key={time} style={styles.preferenceChip}>
                    {time}
                  </Text>
                ))}
              </View>
            </View>
          </View>
          <View style={styles.preferenceItem}>
            <Ionicons name="fitness" size={20} color={colors.primary.dark} />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Fitness Level</Text>
              <Text style={styles.preferenceValue}>
                {userData?.experience_level ||
                  PROFILE_DATA.preferences.fitnessLevel}
              </Text>
            </View>
          </View>
          <View style={styles.preferenceItem}>
            <Ionicons name="body" size={20} color={colors.primary.dark} />
            <View style={styles.preferenceContent}>
              <Text style={styles.preferenceLabel}>Focus Areas</Text>
              <View style={styles.preferenceChips}>
                {PROFILE_DATA.preferences.focusAreas.map((area) => (
                  <Text key={area} style={styles.preferenceChip}>
                    {area}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Achievements</Text>
        {PROFILE_DATA.achievements.map((achievement, index) => (
          <Animated.View
            key={achievement.id}
            entering={FadeInUp.delay(900 + index * 100)}
            style={styles.achievementCard}
          >
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
              <Text style={styles.achievementDate}>
                {new Date(achievement.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Workouts</Text>
        {PROFILE_DATA.upcomingWorkouts.map((workout, index) => (
          <Animated.View
            key={workout.id}
            entering={FadeInUp.delay(1200 + index * 100)}
            style={styles.workoutCard}
          >
            <View style={styles.workoutHeader}>
              <View>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
                <Text style={styles.workoutTime}>{workout.time}</Text>
              </View>
              <BlurView intensity={80} style={styles.workoutTypeBadge}>
                <Text style={styles.workoutTypeText}>{workout.type}</Text>
              </BlurView>
            </View>
            <View style={styles.workoutTrainer}>
              <Ionicons name="person" size={16} color={colors.gray[500]} />
              <Text style={styles.trainerName}>{workout.trainer}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <Pressable
        style={styles.editProfileButton}
        onPress={() => setShowOnboarding(true)}
      >
        <Ionicons
          name="create-outline"
          size={20}
          color={colors.primary.light}
        />
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </Pressable>

      <Pressable
        style={styles.logoutButton}
        onPress={() => {router.replace('/logout')}}
      >
        <Ionicons name="log-out" size={20} color={colors.semantic.error} />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  header: {
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.lg,
  },
  profileHeader: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary.light,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary.dark,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  name: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    opacity: 0.8,
  },
  onboardingBanner: {
    backgroundColor: colors.semantic.info + '20',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.semantic.info + '40',
    ...shadows.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bannerText: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  bannerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.semantic.info,
    marginBottom: spacing.xs,
  },
  bannerDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
  },
  completeButton: {
    backgroundColor: colors.semantic.info,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  completeButtonText: {
    color: colors.primary.light,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: -spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalChip: {
    backgroundColor: colors.accent.coral + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  goalText: {
    fontSize: typography.size.sm,
    color: colors.accent.coral,
    fontWeight: typography.weight.medium as any,
  },
  preferencesCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  preferenceContent: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  preferenceLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  preferenceValue: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  preferenceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  preferenceChip: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  achievementEmoji: {
    fontSize: typography.size.xl,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  achievementDate: {
    fontSize: typography.size.xs,
    color: colors.gray[400],
  },
  workoutCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  workoutTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  workoutTime: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  workoutTypeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent.mint + '20',
  },
  workoutTypeText: {
    fontSize: typography.size.xs,
    color: colors.accent.mint,
    fontWeight: typography.weight.medium as any,
  },
  workoutTrainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  trainerName: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.dark,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  editProfileText: {
    fontSize: typography.size.md,
    color: colors.primary.light,
    fontWeight: typography.weight.medium as any,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  logoutText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    fontWeight: typography.weight.medium as any,
  },
});
