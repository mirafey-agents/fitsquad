import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  shadows,
  spacing,
  borderRadius,
} from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import OnboardingFlow from '@/components/OnboardingFlow';
import { checkOnboardingStatus } from '@/utils/supabase';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia } from '@/utils/firebase';

const PROFILE_DATA = {
  stats: {
    workouts: 48,
    attendance: 92,
    calories: '12.4K',
    achievements: 15,
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
      description: 'Completed 5 morning workouts',
      date: '2024-02-15',
      icon: '👑',
    },
  ],
};

export default function Profile() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    checkOnboardingStatus().then(({ isComplete, userData }) => {
      setUserData(userData);
    });
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    checkOnboardingStatus().then(({ userData }) => {
      setUserData(userData);
    });
  };

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      await uploadMedia(
        result.assets[0],
        userData.id,
        'profilepic',
        null
      );
    }
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
      <View>
        <View style={styles.column}>
          <Image
            source={{ uri: `https://storage.googleapis.com/fit-squad-club.firebasestorage.app/media/${userData?.id}/profilepic/1/1-thumbnail` }}
            resizeMode="stretch"
            style={styles.profileImage}
          />
          <View style={styles.editAvatarButton}>
            <TouchableOpacity onPress={handleImagePick}>
              <Ionicons name="camera" size={16} color={colors.primary.light} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>
            {userData?.display_name || 'Guest'}
          </Text>
          <Text style={styles.email}>
            {userData?.email || 'NA'}
          </Text>
          <Text style={styles.memberSince}>
            member since {userData?.created_at.split('T')[0] || 'NA'}
          </Text>

          <View style={styles.row}>
            <LinearGradient 
              start={{x:0, y:0}}
              end={{x:0, y:1}}
              colors={["#21262F", "#353D45"]}
              style={styles.statCard}
            >
              <Text style={styles.statValue}>{PROFILE_DATA.stats.workouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </LinearGradient>
            <TouchableOpacity>
              <LinearGradient 
                start={{x:0, y:0}}
                end={{x:0, y:1}}
                colors={["#21262F", "#353D45"]}
                style={styles.statCard}
              >
                <Text style={styles.statValue}>{PROFILE_DATA.stats.attendance}%</Text>
                <Text style={styles.statLabel}>Attendance</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.row2}>
            <TouchableOpacity>
              <LinearGradient 
                start={{x:0, y:0}}
                end={{x:0, y:1}}
                colors={["#21262F", "#353D45"]}
                style={styles.statCard}
              >
                <Text style={styles.statValue}>{PROFILE_DATA.stats.calories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </LinearGradient>
            </TouchableOpacity>
            <LinearGradient 
              start={{x:0, y:0}}
              end={{x:0, y:1}}
              colors={["#21262F", "#353D45"]}
              style={styles.statCard}
            >
              <Text style={styles.statValue}>{PROFILE_DATA.stats.achievements}</Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.column4}>
          <Text style={styles.sectionTitle}>Fitness Goals</Text>
          <View style={styles.goalsRow}>
            {userData?.goals?.map((goal: string) => (
              <View key={goal} style={styles.goalButton}>
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.column4}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.goalText}>Coming Soon!</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => setShowOnboarding(true)}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={colors.primary.light}
          />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {router.replace('/logout')}}
        >
          <Ionicons name="log-out" size={20} color={colors.semantic.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.dark,
  },
  view: {
    width: '100%',
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  column: {
    alignItems: 'center',
    padding: spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  editAvatarButton: {
    position: 'absolute',
    top: 120,
    right: '50%',
    marginRight: -60,
    backgroundColor: colors.gray[800],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  memberSince: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  row2: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    width: 160,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  column4: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.md,
  },
  goalButton: {
    backgroundColor: '#432424',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  goalText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  column5: {
    padding: spacing.md,
  },
  achievementCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  achievementDate: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  buttonContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[800],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  editProfileText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  logoutText: {
    fontSize: 16,
    color: colors.semantic.error,
    fontWeight: '500',
  },
  goalsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
});
