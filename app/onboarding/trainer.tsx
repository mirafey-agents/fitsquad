import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useState } from 'react';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';

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

export default function TrainerOnboarding() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showCertDropdown, setShowCertDropdown] = useState(false);
  const [showExpDropdown, setShowExpDropdown] = useState(false);
  const [selectedCert, setSelectedCert] = useState('');
  const [selectedExp, setSelectedExp] = useState('');
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const toggleSpecialization = (spec: string) => {
    setSelectedSpecs(prev => 
      prev.includes(spec)
        ? prev.filter(s => s !== spec)
        : [...prev, spec]
    );
  };

  const handleComplete = () => {
    // Here you would typically save the profile data
    router.replace('/trainer-dashboard');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Trainer Profile</Text>
          <Text style={styles.subtitle}>Set up your professional profile</Text>
        </View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profile Photo</Text>
            <Pressable style={styles.imageUpload} onPress={pickImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color="#94A3B8" />
                  <Text style={styles.uploadText}>Upload Photo</Text>
                </View>
              )}
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Basic Information</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Professional Bio"
              multiline
              numberOfLines={4}
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Credentials</Text>
            <View style={styles.dropdownWrapper}>
              <Pressable 
                style={styles.dropdown}
                onPress={() => {
                  setShowCertDropdown(!showCertDropdown);
                  setShowExpDropdown(false);
                }}
              >
                <Text style={selectedCert ? styles.dropdownText : styles.placeholder}>
                  {selectedCert || 'Select Certification'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748B" />
              </Pressable>
              {showCertDropdown && (
                <View style={styles.dropdownOverlay}>
                  <View style={styles.dropdownListContainer}>
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
                </View>
              )}
            </View>

            <View style={[styles.dropdownWrapper, { marginTop: 12 }]}>
              <Pressable 
                style={styles.dropdown}
                onPress={() => {
                  setShowExpDropdown(!showExpDropdown);
                  setShowCertDropdown(false);
                }}
              >
                <Text style={selectedExp ? styles.dropdownText : styles.placeholder}>
                  {selectedExp || 'Years of Experience'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#64748B" />
              </Pressable>
              {showExpDropdown && (
                <View style={styles.dropdownOverlay}>
                  <View style={styles.dropdownListContainer}>
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
                </View>
              )}
            </View>

            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              placeholder="Hourly Rate ($)"
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
            />
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

          <Pressable style={styles.createButton} onPress={handleComplete}>
            <Text style={styles.createButtonText}>Complete Profile</Text>
          </Pressable>
        </Animated.View>
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
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    marginTop: 60,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
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
    color: '#1E293B',
    marginBottom: 8,
  },
  imageUpload: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
    marginTop: 12,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1E293B',
  },
  placeholder: {
    fontSize: 16,
    color: '#94A3B8',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1001,
  },
  dropdownListContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1E293B',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  specializationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  specializationChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedChip: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  specializationText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});