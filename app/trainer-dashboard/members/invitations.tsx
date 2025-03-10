import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../utils/supabase';

interface Invitation {
  id: string;
  user_id: string;
  invitation_code: string;
  status: string;
  created_at: string;
  expiry_date: string;
  reminder_date: string | null;
  reminded_at: string | null;
  accepted_at: string | null;
  user: {
    display_name: string;
    email: string;
    phone_number: string;
  };
}

export default function ManageInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('member_invitations')
        .select(`
          *,
          user:users(display_name, email, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvitation = async (invitation: Invitation) => {
    try {
      // Set expiry date to 48 hours from now
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 48);
      
      // Set reminder date to 24 hours from now
      const reminderDate = new Date();
      reminderDate.setHours(reminderDate.getHours() + 24);

      // Update invitation
      const { error: updateError } = await supabase
        .from('member_invitations')
        .update({
          status: 'sent',
          expiry_date: expiryDate.toISOString(),
          reminder_date: reminderDate.toISOString(),
          reminded_at: null,
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // In a real app, you would send the invitation via WhatsApp and email here
      console.log(`Invitation resent to ${invitation.user.email} and ${invitation.user.phone_number}`);

      // Refresh invitations
      fetchInvitations();

      Alert.alert('Success', 'Invitation has been resent');
    } catch (error) {
      console.error('Error resending invitation:', error);
      Alert.alert('Error', 'Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitation: Invitation) => {
    Alert.alert(
      'Cancel Invitation',
      'Are you sure you want to cancel this invitation?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              // Update invitation status
              const { error: updateError } = await supabase
                .from('member_invitations')
                .update({
                  status: 'expired',
                })
                .eq('id', invitation.id);

              if (updateError) throw updateError;

              // Update member status
              const { error: memberUpdateError } = await supabase
                .from('users')
                .update({
                  onboarding_status: 'pending',
                })
                .eq('id', invitation.user_id);

              if (memberUpdateError) throw memberUpdateError;

              // Refresh invitations
              fetchInvitations();

              Alert.alert('Success', 'Invitation has been cancelled');
            } catch (error) {
              console.error('Error cancelling invitation:', error);
              Alert.alert('Error', 'Failed to cancel invitation');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'sent':
        return '#4F46E5';
      case 'accepted':
        return '#22C55E';
      case 'expired':
        return '#EF4444';
      default:
        return '#64748B';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Manage Invitations</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading invitations...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : invitations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail" size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>No invitations found</Text>
            <Text style={styles.emptySubtext}>
              Invitations will appear here when you add new members and choose to send them an invitation.
            </Text>
          </View>
        ) : (
          invitations.map((invitation, index) => (
            <Animated.View
              key={invitation.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <View style={styles.invitationCard}>
                <View style={styles.invitationHeader}>
                  <View>
                    <Text style={styles.memberName}>{invitation.user.display_name}</Text>
                    <Text style={styles.memberEmail}>{invitation.user.email}</Text>
                    {invitation.user.phone_number && (
                      <Text style={styles.memberPhone}>{invitation.user.phone_number}</Text>
                    )}
                  </View>
                  <BlurView intensity={80} style={[
                    styles.statusBadge, 
                    { backgroundColor: `${getStatusColor(invitation.status)}20` }
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(invitation.status) }]}>
                      {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                    </Text>
                  </BlurView>
                </View>

                <View style={styles.invitationDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={16} color="#64748B" />
                    <Text style={styles.detailText}>
                      Sent: {formatDate(invitation.created_at)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={16} color={isExpired(invitation.expiry_date) ? '#EF4444' : '#64748B'} />
                    <Text style={[
                      styles.detailText,
                      isExpired(invitation.expiry_date) && styles.expiredText
                    ]}>
                      Expires: {formatDate(invitation.expiry_date)}
                      {isExpired(invitation.expiry_date) && ' (Expired)'}
                    </Text>
                  </View>
                  {invitation.reminded_at && (
                    <View style={styles.detailItem}>
                      <Ionicons name="notifications" size={16} color="#64748B" />
                      <Text style={styles.detailText}>
                        Reminder sent: {formatDate(invitation.reminded_at)}
                      </Text>
                    </View>
                  )}
                  {invitation.accepted_at && (
                    <View style={styles.detailItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                      <Text style={styles.detailText}>
                        Accepted: {formatDate(invitation.accepted_at)}
                      </Text>
                    </View>
                  )}
                </View>

                {invitation.status !== 'accepted' && (
                  <View style={styles.invitationActions}>
                    {(invitation.status === 'sent' || invitation.status === 'pending') && (
                      <Pressable 
                        style={styles.resendButton}
                        onPress={() => handleResendInvitation(invitation)}
                      >
                        <Ionicons name="mail" size={16} color="#FFFFFF" />
                        <Text style={styles.resendButtonText}>Resend</Text>
                      </Pressable>
                    )}
                    {invitation.status !== 'expired' && (
                      <Pressable 
                        style={styles.cancelButton}
                        onPress={() => handleCancelInvitation(invitation)}
                      >
                        <Ionicons name="close-circle" size={16} color="#EF4444" />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            </Animated.View>
          ))
        )}
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
  content: {
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  invitationCard: {
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
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 14,
    color: '#64748B',
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
  invitationDetails: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  expiredText: {
    color: '#EF4444',
  },
  invitationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
});