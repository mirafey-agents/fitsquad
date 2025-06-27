import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '@/utils/supabase';
import { deleteMember, getMembers } from '@/utils/firebase';
import { getProfilePicThumbNailURL } from '@/utils/mediaUtils';
import ConfirmModal from '@/components/ConfirmModal';
import { getSquads } from '@/utils/firebase';

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
  medical_conditions: string | null;
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

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
      const {data: memberData} = await getMembers(memberId);
      console.log(memberData[0]);
      setMember(memberData[0]);

      const {data: allSquads} = await getSquads(null);
      const squads = (allSquads as []).filter((squad: any) => squad.squad_members.some((member: any) => member.users.id === memberId));
      setSquads(squads);
    } catch (error) {
      console.error('Error fetching member details:', error);
      setError('Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const {data: deletedMember} = await deleteMember(member?.id);
      console.log(deletedMember);
      alert("Member deleted!");
      router.back();
    } catch (error) {
      console.error('Error deleting member:', error);
      alert("Failed to delete member. Please try again.");
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
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
        <LinearGradient
          colors={['#21262F', '#353D45']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.title}>Member Details</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading member details...</Text>
        </View>
      </View>
    );
  }

  if (error || !member) {
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
            <Text style={styles.title}>Member Details</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>
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
      <LinearGradient
        colors={['#21262F', '#353D45']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.title}>Member Details</Text>
          <Pressable 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={24} color="#EF4444" />
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              {!imageError ? (
                <Image
                  source={{ uri: getProfilePicThumbNailURL(member.id) }}
                  style={styles.avatarImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {member.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              )}
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
              </View>
            </View>
          </View>
        </Animated.View>


        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoItem}>
                <Ionicons name="mail" size={20} color="#94A3B8" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{member.email}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="call" size={20} color="#94A3B8" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone (WhatsApp)</Text>
                  <Text style={styles.infoValue}>{member.phone_number}</Text>
                </View>
              </View>
              {member.emergency_contact_name && (
                <View style={styles.infoItem}>
                  <Ionicons name="alert-circle" size={20} color="#94A3B8" />
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
                <Ionicons name="fitness" size={20} color="#94A3B8" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Membership Type</Text>
                  <Text style={styles.infoValue}>{member.service_type}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="flag" size={20} color="#94A3B8" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Primary Goal</Text>
                  <Text style={styles.infoValue}>{member.primary_goal}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="calendar" size={20} color="#94A3B8" />
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

        {squads.length > 0 && (
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
                      {member.height ? `${member.height} cm` : 'NA'}
                    </Text>
                  </View>
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Weight</Text>
                    <Text style={styles.measurementValue}>
                      {member.weight ? `${member.weight} kg` : 'NA'}
                    </Text>
                  </View>
                  <View style={styles.measurementItem}>
                    <Text style={styles.measurementLabel}>Body Fat</Text>
                    <Text style={styles.measurementValue}>
                      {member.body_fat ? `${member.body_fat}%` : 'NA'}
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
                      <Ionicons name="medkit" size={20} color="#94A3B8" />
                      <View style={styles.infoContent}>
                        <Text style={styles.infoLabel}>Medical Conditions</Text>
                        <Text style={styles.medicalCondition}>{member.medical_conditions}</Text>
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
                        <Ionicons name="moon" size={20} color="#94A3B8" />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Sleep</Text>
                          <Text style={styles.infoValue}>{member.lifestyle_habits.sleep}</Text>
                        </View>
                      </View>
                    )}
                    {member.lifestyle_habits.diet && (
                      <View style={styles.infoItem}>
                        <Ionicons name="nutrition" size={20} color="#94A3B8" />
                        <View style={styles.infoContent}>
                          <Text style={styles.infoLabel}>Diet</Text>
                          <Text style={styles.infoValue}>{member.lifestyle_habits.diet}</Text>
                        </View>
                      </View>
                    )}
                    {member.lifestyle_habits.activity_level && (
                      <View style={styles.infoItem}>
                        <Ionicons name="walk" size={20} color="#94A3B8" />
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
                        <Ionicons name="download" size={20} color="#94A3B8" />
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
      </ScrollView>

      {showDeleteConfirm && (
        <ConfirmModal
          displayText="Are you sure you want to delete this member? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
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
  deleteButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
  invitationCard: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
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
    color: '#94A3B8',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoCard: {
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
    color: '#94A3B8',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  squadsContainer: {
    gap: 8,
  },
  squadCard: {
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
  squadName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  squadDescription: {
    fontSize: 14,
    color: '#94A3B8',
  },
  measurementsCard: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  medicalCondition: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 4,
  },
  experienceText: {
    fontSize: 14,
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
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
  documentName: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  notesText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
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