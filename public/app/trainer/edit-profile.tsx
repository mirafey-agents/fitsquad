import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia, updateUserProfile } from '@/utils/firebase';
import { getUserProfile } from '@/utils/storage';
import { getProfilePicThumbNailURL } from '@/utils/mediaUtils';
import Dropdown from '@/components/ui/Dropdown';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';

const CERTIFICATIONS = [
  'NASM (National Academy of Sports Medicine)',
  'ACE (American Council on Exercise)',
  'ISSA (International Sports Sciences Association)',
  'ACSM (American College of Sports Medicine)',
  'NSCA (National Strength and Conditioning Association)',
  'CrossFit Level 1',
  'CrossFit Level 2',
  'AFAA (Athletics and Fitness Association of America)',
  'Other',
];

const EXPERIENCE_LEVELS = [
  '1-2 years',
  '3-5 years',
  '6-10 years',
  '11+ years',
];

const SPECIALIZATIONS = [
  'HIIT',
  'Strength Training',
  'Yoga',
  'CrossFit',
  'Pilates',
  'Cardio',
  'Nutrition',
  'Recovery',
  'Functional Training',
  'Olympic Weightlifting',
  'Powerlifting',
  'Bodybuilding',
  'Pre/Post Natal',
  'Senior Fitness',
  'Youth Training',
  'Sports Performance',
  'Rehabilitation',
  'Group Training',
  'Personal Training',
  'Online Coaching',
];

const sampleBio = 'Certified fitness trainer with 8 years of experience helping clients achieve their fitness goals through personalized training programs.';

export default function EditTrainerProfile() {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [userData, setUserData] = useState(null);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedExp, setSelectedExp] = useState(EXPERIENCE_LEVELS[2]);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([SPECIALIZATIONS[0], SPECIALIZATIONS[1], SPECIALIZATIONS[6]]);

  useEffect(() => {
    getUserProfile().then((profile) => {
      setUserData(profile);
      if (profile?.id) {
        setProfileImageUrl(getProfilePicThumbNailURL(profile.id));
      }
    });
  }, []);

  const pickImage = async () => {
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
      await uploadMedia(
        result.assets[0],
        userData.id,
        'profilepic',
        null
      );
      setProfileImageUrl(getProfilePicThumbNailURL(userData.id));
    }
  };

  

  const handleSave = async () => {
    if (!userData?.id) return;
    await updateUserProfile({ 
      display_name: userData.display_name,
      age: userData.age,
      gender: userData.gender,
      bio: userData.bio,
      certifications: selectedCerts,
      experience_level: selectedExp,
      specializations: selectedSpecs
    });
    // Refresh userData after update
    getUserProfile().then((profile) => {
      setUserData(profile);
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <Pressable style={styles.saveButton} onPress={()=>{router.push('/logout')}}>
          <Text style={styles.saveButtonText}>Logout</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Photo</Text>
            <Pressable style={styles.imageUpload} onPress={pickImage}>
              <View style={styles.profileImageContainer}>
                {profileImageUrl ? (
                  <Image 
                    source={{uri: profileImageUrl}}
                    style={styles.profileImage}
                    onError={() => setProfileImageUrl(null)}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera" size={32} color="#94A3B8" />
                    <Text style={styles.uploadText}>Change Photo</Text>
                  </View>
                )}
              </View>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Basic Information</Text>
            <TextInput
              style={styles.input}
              value={userData?.display_name || ''}
              onChangeText={(text) => setUserData(prev => ({ ...prev, display_name: text }))}
              placeholder="Full Name"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              value={userData?.age?.toString() || ''}
              onChangeText={(text) => setUserData(prev => ({ ...prev, age: parseInt(text) || undefined }))}
              placeholder="Age"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
            <View style={{ marginTop: 12 }}>
              <Dropdown
                value={userData?.gender || ''}
                options={['Male', 'Female', 'Other', 'Prefer not to say']}
                onValueChange={(value) => setUserData(prev => ({ ...prev, gender: value }))}
                placeholder="Select your gender"
              />
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={userData?.bio || sampleBio}
              onChangeText={(text) => setUserData(prev => ({ ...prev, bio: text }))}
              placeholder="Professional Bio"
              multiline
              numberOfLines={4}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Experience</Text>
            <Dropdown
              value={selectedExp}
              options={EXPERIENCE_LEVELS}
              onValueChange={setSelectedExp}
              placeholder="Select your experience level"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Certifications</Text>
            <MultiSelectDropdown
              value={selectedCerts}
              options={CERTIFICATIONS}
              onValueChange={setSelectedCerts}
              placeholder="Select your certifications"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specializations </Text>
            <MultiSelectDropdown
              value={selectedSpecs}
              options={SPECIALIZATIONS}
              onValueChange={setSelectedSpecs}
              placeholder="Select your specializations"
            />
          </View>
        </View>
      </ScrollView>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C23',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#21262F',
    borderBottomWidth: 1,
    borderBottomColor: '#353D45',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  imageUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#21262F',
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    color: '#94A3B8',
    marginTop: 8,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#353D45',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    marginTop: 12,
  },



});