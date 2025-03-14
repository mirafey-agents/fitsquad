import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';
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
  
  const [selectedSquads, setSelectedSquads] = useState<string[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sendInvitation, setSendInvitation] = useState(true);

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    try {
      const { data, error } = await supabase
        .from('squads')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      setSquads(data || []);
    } catch (error) {
      console.error('Error fetching squads:', error);
      Alert.alert('Error', 'Failed to load squads');
    }
  };

  const toggleSquad = (squadId: string) => {
    setSelectedSquads(prev => 
      prev.includes(squadId)
        ? prev.filter(id => id !== squadId)
        : [...prev, squadId]
    );
  };

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
      const { data: member, error: memberError } = await supabase
        .from('users')
        .insert({
          display_name: formData.fullName,
          email: formData.email,
          phone_number: formData.phoneNumber,
          role: 'member',
          service_type: formData.serviceType,
          primary_goal: formData.primaryGoal,
          notes: formData.notes,
          onboarding_status: sendInvitation ? 'invited' : 'pending',
        })
        .select()
        .single();

      if (memberError) throw memberError;

      // If it's group training, add to selected squads
      if (formData.serviceType === 'Group Training' && selectedSquads.length > 0) {
        const squadMembersData = selectedSquads.map(squadId => ({
          squad_id: squadId,
          user_id: member.id,
          role: 'member',
        }));

        const { error: squadError } = await supabase
          .from('squad_members')
          .insert(squadMembersData);

        if (squadError) throw squadError;
      }

      // If sending invitation, create an invitation record
      if (sendInvitation) {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 48); // 48 hours from now
        
        const reminderDate = new Date();
        reminderDate.setHours(reminderDate.getHours() + 24); // 24 hours from now

        const { error: invitationError } = await supabase
          .from('member_invitations')
          .insert({
            user_id: member.id,
            invitation_code: invitationCode,
            status: 'sent',
            expiry_date: expiryDate.toISOString(),
            reminder_date: reminderDate.toISOString(),
          });

        if (invitationError) throw invitationError;

        // In a real app, you would send the invitation via WhatsApp and email here
        console.log(`Invitation sent to ${formData.email} and ${formData.phoneNumber}`);
      }

      Alert.alert(
        'Success',
        `Member added successfully${sendInvitation ? ' and invitation sent' : ''}`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error adding member:', error);
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Add New Member</Text>
        <Pressable 
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

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
                    color={formData.serviceType === 'Personal Training' ? '#FFFFFF' : '#64748B'} 
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
                    color={formData.serviceType === 'Group Training' ? '#FFFFFF' : '#64748B'} 
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

        {formData.serviceType === 'Group Training' && (
          <Animated.View entering={FadeInUp.delay(300)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Squad Assignment</Text>
              <Text style={styles.sectionSubtitle}>Select squads for this member</Text>
              
              {squads.length === 0 ? (
                <Text style={styles.emptyText}>No squads available</Text>
              ) : (
                squads.map((squad, index) => (
                  <Pressable
                    key={squad.id}
                    style={[
                      styles.squadCard,
                      selectedSquads.includes(squad.id) && styles.selectedSquad
                    ]}
                    onPress={() => toggleSquad(squad.id)}
                  >
                    <View style={styles.squadInfo}>
                      <Text style={styles.squadName}>{squad.name}</Text>
                      {squad.description && (
                        <Text style={styles.squadDescription}>{squad.description}</Text>
                      )}
                    </View>
                    {selectedSquads.includes(squad.id) && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                      </View>
                    )}
                  </Pressable>
                ))
              )}
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(400)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invitation Settings</Text>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Send Invitation</Text>
                <Text style={styles.switchDescription}>
                  Automatically send an invitation to the member via WhatsApp and email
                </Text>
              </View>
              <Switch
                value={sendInvitation}
                onValueChange={setSendInvitation}
                trackColor={{ false: '#E2E8F0', true: '#818CF8' }}
                thumbColor={sendInvitation ? '#4F46E5' : '#FFFFFF'}
              />
            </View>

            {sendInvitation && (
              <View style={styles.invitationInfo}>
                <Ionicons name="information-circle" size={20} color="#4F46E5" />
                <Text style={styles.invitationInfoText}>
                  An invitation will be sent to the member with a unique registration link that expires in 48 hours. 
                  A reminder will be sent if they don't respond within 24 hours.
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedServiceType: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  serviceTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
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
    backgroundColor: '#F8FAFC',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedGoal: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  goalText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedGoalText: {
    color: '#FFFFFF',
  },
  squadCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedSquad: {
    borderColor: '#4F46E5',
    backgroundColor: '#F0F0FF',
  },
  squadInfo: {
    flex: 1,
  },
  squadName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  squadDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedIndicator: {
    marginLeft: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  invitationInfo: {
    flexDirection: 'row',
    backgroundColor: '#F0F0FF',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  invitationInfoText: {
    flex: 1,
    fontSize: 14,
    color: '#4F46E5',
  },
});