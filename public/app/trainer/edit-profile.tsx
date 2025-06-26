import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from 'buffer';
import { getMedia, uploadMedia, updateUserProfile } from '@/utils/firebase';
import { getLoggedInUser } from '@/utils/auth';

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
  '5-10 years',
  '10+ years',
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

const sampleBio = 'Certified personal trainer with 8 years of experience helping clients achieve their fitness goals through personalized training programs. Students include The Furious Five & the dragon warrior, Po Ping.';

export default function EditTrainerProfile() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState(null);
  const [showCertDropdown, setShowCertDropdown] = useState(false);
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const [selectedCert, setSelectedCert] = useState('NASM (National Academy of Sports Medicine)');
  const [selectedExp, setSelectedExp] = useState('5-10 years');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(['HIIT', 'Strength Training', 'Nutrition']);

  const getProfilePic = async (id: string) => {
    if (id) {
      const data = await getMedia(id, 'profilepic', null, null);
      const b64 = Buffer.from(Object.values(data.data)).toString('base64');
      setProfileImage(b64);
    }
  }

  useEffect(() => {
    setUserData(getLoggedInUser().profile);
    getProfilePic(getLoggedInUser().user.id);
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
      getProfilePic(userData.id);
    }
  };

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const handleSave = async () => {
    if (!userData?.id) return;
    await updateUserProfile({ display_name: userData.display_name, bio: userData.bio });
    // Refresh userData after update
    setUserData(getLoggedInUser().profile);
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
              {profileImage ? (
                <Image 
                  source={{uri:`data:image/jpeg;base64,${profileImage}`}}
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color="#94A3B8" />
                  <Text style={styles.uploadText}>Change Photo</Text>
                </View>
              )}
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
            <Text style={styles.label}>Credentials</Text>
            <View style={styles.dropdownContainer}>
              <Pressable 
                style={styles.dropdown}
                onPress={() => {
                  setShowCertDropdown(!showCertDropdown);
                  setShowExpDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{selectedCert}</Text>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </Pressable>
              {showCertDropdown && (
                <ScrollView 
                  style={styles.dropdownOverlay}
                  nestedScrollEnabled={true}
                  contentContainerStyle={styles.dropdownScrollContent}
                >
                  <View style={styles.dropdownList}>
                    {CERTIFICATIONS.map((cert) => (
                      <Pressable
                        key={cert}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedCert(cert);
                          setShowCertDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{cert}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>

            <View style={[styles.dropdownContainer, { marginTop: 12 }]}>
              <Pressable 
                style={styles.dropdown}
                onPress={() => {
                  setShowExpDropdown(!showExpDropdown);
                  setShowCertDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{selectedExp}</Text>
                <Ionicons name="chevron-down" size={20} color="#94A3B8" />
              </Pressable>
              {showExpDropdown && (
                <ScrollView 
                  style={styles.dropdownOverlay}
                  nestedScrollEnabled={true}
                  contentContainerStyle={styles.dropdownScrollContent}
                >
                  <View style={styles.dropdownList}>
                    {EXPERIENCE_LEVELS.map((exp) => (
                      <Pressable
                        key={exp}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setSelectedExp(exp);
                          setShowExpDropdown(false);
                        }}
                      >
                        <Text style={styles.dropdownItemText}>{exp}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specializations</Text>
            <Text style={styles.subtitle}>Select all that apply</Text>
            <View style={styles.specializationsGrid}>
              {SPECIALIZATIONS.map((specialization) => (
                <Pressable
                  key={specialization}
                  style={[
                    styles.specializationChip,
                    selectedSpecs.includes(specialization) && styles.selectedChip
                  ]}
                  onPress={() => toggleSpecialization(specialization)}
                >
                  <Text 
                    style={[
                      styles.specializationText,
                      selectedSpecs.includes(specialization) && styles.selectedChipText
                    ]}
                  >
                    {specialization}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {(showCertDropdown || showExpDropdown) && (
        <Pressable 
          style={styles.backdrop}
          onPress={() => {
            setShowCertDropdown(false);
            setShowExpDropdown(false);
          }}
        />
      )}
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
  dropdownContainer: {
    position: 'relative',
    zIndex: 1000,
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
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    zIndex: 1001,
  },
  dropdownScrollContent: {
    flexGrow: 1,
  },
  dropdownList: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#353D45',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#353D45',
    backgroundColor: '#21262F',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  specializationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  specializationChip: {
    backgroundColor: '#21262F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#353D45',
  },
  selectedChip: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  specializationText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});