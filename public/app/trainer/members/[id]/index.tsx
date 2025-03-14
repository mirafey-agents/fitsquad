import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../../utils/supabase';

interface Member {
  id: string;
  display_name: string;
  email: string;
  phone_number: string;
  service_type: string;
  primary_goal: string;
  start_date: string;
  onboarding_status: string;
  height: number | null;
  weight: number | null;
  body_fat: number | null;
  medical_conditions: string[] | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  lifestyle_habits: Record<string, any> | null;
  fitness_experience: string | null;
  preferred_workout_times: string[] | null;
  documents: string[] | null;
  notes: string | null;
  created_at: string;
}

interface Squad {
  id: string;
  name: string;
  description: string;
}

export default function MemberDetails() {
  const { id } = useLocalSearchParams();
  const [member, setMember] = useState<Member | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchMemberDetails(id);
    }
  }, [id]);

  const fetchMemberDetails = async (memberId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch member details
      const { data: memberData, error: memberError } = await supabase
        .from('users')
        .select('*')
        .eq('id', memberId)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);

      // Fetch squads the member belongs to
      const { data: squadData, error: squadError } = await supabase
        .from('squad_members')
        .select(`
          squad:squads(
            id,
            name,
            description
          )
        `)
        .eq('user_id', memberId);

      if (squadError) throw squadError;
      setSquads(squadData.map(item => item.squad));

    } catch (error) {
      console.error('Error fetching member details:', error);
      setError('Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async () => {
    if (!member) return;

    try {
      // Generate a new invitation code
      const invitationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Set expiry date to 48 hours from now
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 48);
      
      // Set reminder date to 24 hours from now
      const reminderDate = new Date();
      reminderDate.setHours(reminderDate.getHours() + 24);

      // Check if there's an existing invitation
      const { data: existingInvitation } = await supabase
        .from('member_invitations')
        .select('id')
        .eq('user_id', member.id)
        .single();

      if (existingInvitation) {
        // Update existing invitation
        const { error: updateError } = await supabase
          .from('member_invitations')
          .update({
            invitation_code: invitationCode,
            status: 'sent',
            expiry_date: expiryDate.toISOString(),
            reminder_date: reminderDate.toISOString(),
          })
          .eq('id', existingInvitation.id);

        if (updateError) throw updateError;
      } else {
        // Create new invitation
        const { error: createError } = await supabase
          .from('member_invitations')
          .insert({
            user_id: member.id,
            invitation_code: invitationCode,
            status: 'sent',
            expiry_date: expiryDate.toISOString(),
            reminder_date: reminderDate.toISOString(),
          });

        if (createError) throw createError;
      }

      // Update member status
      const { error: memberUpdateError } = await supabase
        .from('users')
        .update({
          onboarding_status: 'invited',
        })
        .eq('id', member.id);

      if (memberUpdateError) throw memberUpdateError;

      // Refresh member data
      fetchMemberDetails(member.id);

      // In a real app, you would send the invitation via WhatsApp and email here
      console.log(`Invitation resent to ${member.email} and ${member.phone_number}`);

      Alert.alert('Success', 'Invitation has been resent');
    } catch (error) {
      console.error('Error resending invitation:', error);
      Alert.alert('Error', 'Failed to resend invitation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'completed':
        return '#22C55E';
      case 'invited':
        return '#4F46E5';
      default:
        return '#64748B';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.title}>Member Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading member details...</Text>
        </View>
      </View>
    );
  }

  if (error || !member) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.title}>Member Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Member not found'}</Text>
          <Pressable style={styles.backToMembersButton} onPress={() => router.back()}>
            <Text style={styles.backToMembersText}>Back to Members</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Member Details</Text>
        <Pressable 
          style={styles.editButton}
          onPress={() => router.push(`./edit`, {relativeToDirectory: true})}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.avatarText}>
                {member.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{member.display_name}</Text>
              <View style={styles.profileBadges}>
                <BlurView intensity={80} style={[styles.statusBadge, { backgroundColor: `${getStatusColor(member.onboarding_status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(member.onboarding_status) }]}>
                    {member.onboarding_status === 'pending' ? 'Pending' : 
                     member.onboarding_status === 'invited' ? 'Invited' : 'Active'}
                  </Text>
                </BlurView>
                <BlurView intensity={80} style={styles.typeBadge}>
                  <Text style={styles.typeText}>
                    {member.service_type === 'Personal Training' ? 'Personal' : 'Group'}
                  </Text>
                </BlurView>
              </View>
            </View>
          </View>
        </Animated.View>

        {member.onboarding_status === 'invited' && (
          <Animated.View entering={FadeInUp.delay(150)}>
            <View style={styles.invitationCard}>
              <View style={styles.invitationHeader}>
                <Ionicons name="mail" size={24} color="#4F46E5" />
                <Text style={styles.invitationTitle}>Invitation Sent</Text>
              </View>
              <Text style={styles.invitationText}>
                An invitation has been sent to this member. They will need to complete their profile setup.
              </Text>
              <Pressable 
                style={styles.resendButton}
                onPress={handleResendInvitation}
              >
                <Text style={styles.resendButtonText}>Resend Invitation</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={20} color="#64748B" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{member.email}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="call" size={20} color="#64748B" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone (WhatsApp)</Text>
                  <Text style={styles.infoValue}>{member.phone_number}</Text>
                </View>
              </View>
              {member.emergency_contact_name && (
                <View style={styles.infoItem}>
                  <Ionicons name="alert-circle" size={20} color="#64748B" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Emergency Contact</Text>
                    <Text style={styles.infoValue}>
                      {member.emergency_contact_name} ({member.emergency_contact_phone})
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Membership Details</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="fitness" size={20} color="#64748B" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Membership Type</Text>
                  <Text style={styles.infoValue}>{member.service_type}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="flag" size={20} color="#64748B" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Primary Goal</Text>
                  <Text style={styles.infoValue}>{member.primary_goal}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color="#64748B" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Start Date</Text>
                  <Text style={styles.infoValue}>
                    {new Date(member.start_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {member.service_type === 'Group Training' && squads.length > 0 && (
          <Animated.View entering={FadeInUp.delay(400)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assigned Squads</Text>
              <View style={styles.squadsContainer}>
                {squads.map((squad, index) => (
                  <View key={squad.id} style={styles.squadCard}>
                    <Text style={styles.squadName}>{squad.name}</Text>
                    {squad.description && (
                      <Text style={styles.squadDescription}>{squad.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {member.onboarding_status === 'completed' && (
          <>
            <Animated.View entering={FadeInUp.delay(500)}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Body Measurements</Text>
                <View style={styles.measurementsCard}>
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Height</Text>
                    <Text style={styles.measurementValue}>
                      {member.height ? `${member.height} cm` : 'Not provided'}
                    </Text>
                  </View>
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Weight</Text>
                    <Text style={styles.measurementValue}>
                      {member.weight ? `${member.weight} kg` : 'Not provided'}
                    </Text>
                  </View>
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Body Fat</Text>
                    <Text style={styles.measurementValue}>
                      {member.body_fat ? `${member.body_fat}%` : 'Not provided'}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {member.medical_conditions && member.medical_conditions.length > 0 && (
              <Animated.View entering={FadeInUp.delay(600)}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Medical Information</Text>
                  <View style={styles.infoCard}>
                    <View style={styles.infoItem}>
                      <Ionicons name="medkit" size={20} color="#64748B" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Medical Conditions</Text>
                        {member.medical_conditions.map((condition, index) => (
                          <Text key={index} style={styles.medicalCondition}>• {condition}</Text>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            )}

            {member.lifestyle_habits && (
              <Animated.View entering={FadeInUp.delay(700)}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Lifestyle Habits</Text>
                  <View style={styles.infoCard}>
                    {member.lifestyle_habits.sleep && (
                      <View style={styles.infoItem}>
                        <Ionicons name="moon" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Sleep</Text>
                          <Text style={styles.infoValue}>{member.lifestyle_habits.sleep}</Text>
                        </View>
                      </View>
                    )}
                    {member.lifestyle_habits.diet && (
                      <View style={styles.infoItem}>
                        <Ionicons name="nutrition" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Diet</Text>
                          <Text style={styles.infoValue}>{member.lifestyle_habits.diet}</Text>
                        </View>
                      </View>
                    )}
                    {member.lifestyle_habits.activity_level && (
                      <View style={styles.infoItem}>
                        <Ionicons name="walk" size={20} color="#64748B" />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Activity Level</Text>
                          <Text style={styles.infoValue}>{member.lifestyle_habits.activity_level}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </Animated.View>
            )}

            {member.fitness_experience && (
              <Animated.View entering={FadeInUp.delay(800)}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Fitness Experience</Text>
                  <View style={styles.infoCard}>
                    <Text style={styles.experienceText}>{member.fitness_experience}</Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {member.preferred_workout_times && member.preferred_workout_times.length > 0 && (
              <Animated.View entering={FadeInUp.delay(900)}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Preferred Workout Times</Text>
                  <View style={styles.timesContainer}>
                    {member.preferred_workout_times.map((time, index) => (
                      <View key={index} style={styles.timeChip}>
                        <Ionicons name="time" size={16} color="#4F46E5" />
                        <Text style={styles.timeText}>{time}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {member.documents && member.documents.length > 0 && (
              <Animated.View entering={FadeInUp.delay(1000)}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Documents</Text>
                  <View style={styles.documentsContainer}>
                    {member.documents.map((doc, index) => (
                      <Pressable key={index} style={styles.documentCard}>
                        <Ionicons name="document-text" size={24} color="#4F46E5" />
                        <Text style={styles.documentName}>
                          {doc.split('/').pop() || `Document ${index + 1}`}
                        </Text>
                        <Ionicons name="download" size={20} color="#64748B" />
                      </Pressable>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}
          </>
        )}

        {member.notes && (
          <Animated.View entering={FadeInUp.delay(1100)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Additional Notes</Text>
              <View style={styles.infoCard}>
                <Text style={styles.notesText}>{member.notes}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={styles.actionButtons}>
          {member.onboarding_status === 'completed' && (
            <Pressable 
              style={styles.assessmentButton}
              onPress={() => router.push(`./assessment`, {relativeToDirectory: true})}
            >
              <Ionicons name="analytics" size={20} color="#FFFFFF" />
              <Text style={styles.assessmentButtonText}>Schedule Assessment</Text>
            </Pressable>
          )}
        </View>
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
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  profileBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
  invitationCard: {
    backgroundColor: '#F0F0FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  invitationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  invitationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 8,
  },
  invitationText: {
    fontSize: 14,
    color: '#4F46E5',
    marginBottom: 16,
  },
  resendButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  infoCard: {
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
  infoItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1E293B',
  },
  squadsContainer: {
    gap: 8,
  },
  squadCard: {
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
  squadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  squadDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  measurementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  medicalCondition: {
    fontSize: 14,
    color: '#1E293B',
    marginTop: 4,
  },
  experienceText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  timesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timeText: {
    fontSize: 14,
    color: '#4F46E5',
  },
  documentsContainer: {
    gap: 8,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 16,
    marginBottom: 40,
  },
  assessmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
  },
  assessmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backToMembersButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backToMembersText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});