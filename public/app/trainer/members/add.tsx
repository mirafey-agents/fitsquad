import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { createUser, getSquads } from '@/utils/firebase';
import * as Yup from 'yup';

interface Squad {
  id: string;
  name: string;
  description: string;
}

const validationSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phoneNumber: Yup.string().required('Phone number is required'),
  serviceType: Yup.string().required('Service type is required'),
  primaryGoal: Yup.string().required('Primary goal is required'),
});

const FITNESS_GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Improved Fitness',
  'Strength Training',
  'Endurance Building',
  'Flexibility',
  'Sports Performance',
  'Rehabilitation',
  'General Health',
  'Other'
];

export default function AddMember() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    serviceType: 'Personal Training',
    primaryGoal: '',
    notes: '',
  });
  
  const [squads, setSquads] = useState<Squad[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    const {data} = await getSquads(null);
    setSquads(data as Squad[]);
  }

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      return true;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors: Record<string, string> = {};
        error.inner.forEach(err => {
          if (err.path) {
            newErrors[err.path] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      // Generate a unique invitation code
      const invitationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Create the member in the database
      const {data, error} = await createUser({
        email: formData.email,
        password: formData.phoneNumber,
        name: formData.fullName,
        phone_number: formData.phoneNumber,
      });

      console.log('Create Member Response:', data, error);

      if(!error) {
        console.log('no Error')
        router.push('../', {relativeToDirectory: true});
        alert('Member added successfully');
      } else {
        console.log('Error:', error);
        alert('Failed to add member: ' + error.message);
      }
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#21262F', '#353D45']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.title}>Add New Member</Text>
          <Pressable 
            style={[styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Creating...' : 'Create'}
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={formData.fullName}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, fullName: text }));
                  if (errors.fullName) {
                    setErrors(prev => ({ ...prev, fullName: '' }));
                  }
                }}
                placeholder="Enter member's full name"
                placeholderTextColor="#94A3B8"
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, email: text }));
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
                placeholder="Enter email address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number (WhatsApp)</Text>
              <TextInput
                style={[styles.input, errors.phoneNumber && styles.inputError]}
                value={formData.phoneNumber}
                onChangeText={(text) => {
                  setFormData(prev => ({ ...prev, phoneNumber: text }));
                  if (errors.phoneNumber) {
                    setErrors(prev => ({ ...prev, phoneNumber: '' }));
                  }
                }}
                placeholder="Enter WhatsApp number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />
              {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Membership Type</Text>
              <View style={styles.serviceTypeContainer}>
                <Pressable
                  style={[
                    styles.serviceTypeButton,
                    formData.serviceType === 'Personal Training' && styles.selectedServiceType
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, serviceType: 'Personal Training' }))}
                >
                  <Ionicons 
                    name="person" 
                    size={20} 
                    color={formData.serviceType === 'Personal Training' ? '#FFFFFF' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.serviceTypeText,
                    formData.serviceType === 'Personal Training' && styles.selectedServiceTypeText
                  ]}>Personal Training</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.serviceTypeButton,
                    formData.serviceType === 'Group Training' && styles.selectedServiceType
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, serviceType: 'Group Training' }))}
                >
                  <Ionicons 
                    name="people" 
                    size={20} 
                    color={formData.serviceType === 'Group Training' ? '#FFFFFF' : '#94A3B8'} 
                  />
                  <Text style={[
                    styles.serviceTypeText,
                    formData.serviceType === 'Group Training' && styles.selectedServiceTypeText
                  ]}>Group Training</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Primary Fitness Goal</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.goalsContainer}
              >
                {FITNESS_GOALS.map((goal) => (
                  <Pressable
                    key={goal}
                    style={[
                      styles.goalChip,
                      formData.primaryGoal === goal && styles.selectedGoal
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, primaryGoal: goal }))}
                  >
                    <Text style={[
                      styles.goalText,
                      formData.primaryGoal === goal && styles.selectedGoalText
                    ]}>{goal}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              {errors.primaryGoal && <Text style={styles.errorText}>{errors.primaryGoal}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Any additional information about the member"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#4F46E5" />
              <Text style={styles.infoTitle}>What happens next?</Text>
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                • An email and WhatsApp message will be sent to the member with their login credentials
              </Text>
              <Text style={styles.infoText}>
                • The member can choose to sign up with MyFitWave or continue without the app
              </Text>
              <Text style={styles.infoText}>
                • You can still log sessions, track progress, and send payment reminders regardless of their app usage
              </Text>
              <Text style={styles.infoText}>
                • All member data and progress will be managed through your trainer dashboard
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C23',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  serviceTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedServiceType: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  selectedServiceTypeText: {
    color: '#FFFFFF',
  },
  goalsContainer: {
    marginBottom: 8,
  },
  goalChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedGoal: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  goalText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  selectedGoalText: {
    color: '#FFFFFF',
  },
  infoSection: {
    marginBottom: 24,
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  infoContent: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
});