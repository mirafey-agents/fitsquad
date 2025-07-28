import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Modal, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';
import { updateUserProfile } from '@/utils/firebase';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia } from '@/utils/firebase';
import { getLoggedInUser } from '@/utils/auth';

const EXPERIENCE_LEVELS = [
  {
    id: 'beginner', title: 'Beginner', icon: 'leaf',
    description: 'New to fitness or getting back into it',
  },
  {
    id: 'intermediate', title: 'Intermediate', icon: 'fitness',
    description: 'Regular workout routine for 6+ months',
  },
  {
    id: 'advanced', title: 'Advanced', icon: 'flame',
    description: 'Experienced with various workout types',
  },
];

const GOALS = [
  'Weight Loss', 'Muscle Gain', 'Endurance',
  'Flexibility', 'Overall Health', 'Strength',
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export default function MemberOnboarding() {
  const [stats, setStats] = useState({
    weight: '',
    height: '',
    age: '',
  });
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0]);
    }
  };

  const handleStartJourney = async () => {
    try {
      const user = await getLoggedInUser();
      const profileData = {
        name: displayName,
        age: stats.age,
        goals: selectedGoals,
        activityLevel: selectedExperience,
        gender: selectedGender || 'not_specified',
        medicalConditions: null,
        dietaryRestrictions: [],
        preferredWorkoutTimes: [],
        availableEquipment: []
      };
      
      await updateUserProfile(profileData);
      
      // Upload profile image if selected
      if (profileImage && user) {
        await uploadMedia(profileImage, user.id, 'profilepic', null);
      }
      
      router.push('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Help us personalize your experience</Text>
      </View>

      <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Profile Picture</Text>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImageWrapper}>
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={48} color="#9AAABD" />
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton} onPress={handleImagePick}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Basic Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            placeholderTextColor="#9AAABD"
            value={displayName}
            onChangeText={setDisplayName}
          />
          <View style={styles.statsGrid}>
            <TextInput
              style={[styles.input, styles.statInput]}
              placeholder="Weight"
              keyboardType="numeric"
              value={stats.weight}
              onChangeText={(text) => setStats(prev => ({ ...prev, weight: text }))}
              placeholderTextColor="#9AAABD"
            />
            <TextInput
              style={[styles.input, styles.statInput]}
              placeholder="Height"
              keyboardType="numeric"
              value={stats.height}
              onChangeText={(text) => setStats(prev => ({ ...prev, height: text }))}
              placeholderTextColor="#9AAABD"
            />
            <TextInput
              style={[styles.input, styles.statInput]}
              placeholder="Age"
              keyboardType="numeric"
              value={stats.age}
              onChangeText={(text) => setStats(prev => ({ ...prev, age: text }))}
              placeholderTextColor="#9AAABD"
            />
          </View>
          
          <Pressable 
            style={styles.dropdown}
            onPress={() => setShowGenderModal(true)}
          >
            <Text style={[
              styles.dropdownText,
              !selectedGender && styles.dropdownPlaceholder
            ]}>
              {selectedGender || 'Select Gender'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#9AAABD" />
          </Pressable>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Experience Level</Text>
          <View style={styles.experienceLevels}>
            {EXPERIENCE_LEVELS.map((level) => (
              <Pressable 
                key={level.id} 
                style={[
                  styles.experienceCard,
                  selectedExperience === level.id && styles.selectedExperienceCard
                ]}
                onPress={() => setSelectedExperience(level.id)}
              >
                <View style={styles.experienceIcon}>
                  <Ionicons name={level.icon as any} size={24} color="#2563FF" />
                </View>
                <View style={styles.experienceContent}>
                  <Text style={styles.experienceTitle}>{level.title}</Text>
                </View>
                <Text style={styles.experienceDescription}>{level.description}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fitness Goals</Text>
          <View style={styles.goalsGrid}>
            {GOALS.map((goal) => (
              <Pressable 
                key={goal} 
                style={[
                  styles.goalChip,
                  selectedGoals.includes(goal) && styles.selectedGoalChip
                ]}
                onPress={() => {
                  setSelectedGoals(prev => 
                    prev.includes(goal) 
                      ? prev.filter(g => g !== goal)
                      : [...prev, goal]
                  );
                }}
              >
                <Text style={[
                  styles.goalText,
                  selectedGoals.includes(goal) && styles.selectedGoalText
                ]}>{goal}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable 
        style={styles.joinButton} 
        onPress={handleStartJourney}
        >
        <Text style={styles.joinButtonText}>Start Your Journey</Text>
        </Pressable>
      </Animated.View>

      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {GENDER_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedGender(option);
                  setShowGenderModal(false);
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.modalCancel}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  header: {
    padding: 20,
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#9AAABD',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#353D45',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statInput: {
    flex: 1,
    marginBottom: 0,
    minWidth: 80,
  },
  dropdown: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#353D45',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  dropdownPlaceholder: {
    color: '#9AAABD',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#353D45',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalCancel: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#9AAABD',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#21262F',
    borderWidth: 2,
    borderColor: '#353D45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563FF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#060712',
  },
  experienceLevels: {
    gap: 12,
  },
  experienceCard: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#353D45',
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#23262F',
  },
  experienceContent: {
    flex: 1,
    marginRight: 12,
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  experienceDescription: {
    fontSize: 14,
    color: '#9AAABD',
    flex: 1,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    backgroundColor: '#21262F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#353D45',
  },
  goalText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#2563FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedExperienceCard: {
    borderColor: '#2563FF',
    backgroundColor: '#23262F',
  },
  selectedGoalChip: {
    backgroundColor: '#2563FF',
    borderColor: '#2563FF',
  },
  selectedGoalText: {
    color: '#FFFFFF',
  },

});