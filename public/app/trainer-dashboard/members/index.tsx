import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';

interface Member {
  id: string;
  display_name: string;
  email: string;
  phone_number: string;
  service_type: string;
  onboarding_status: string;
  primary_goal: string;
  created_at: string;
}

type Filter = 'all' | 'personal' | 'group' | 'pending' | 'active';

export default function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'member')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      console.log("Fetched members:", data?.length || 0);
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    Alert.alert(
      'Delete Member',
      'Are you sure you want to delete this member? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              // Delete member from squad_members first
              const { error: squadMemberError } = await supabase
                .from('squad_members')
                .delete()
                .eq('user_id', memberId);

              if (squadMemberError) throw squadMemberError;

              // Delete member from workout_participants
              const { error: workoutParticipantError } = await supabase
                .from('workout_participants')
                .delete()
                .eq('user_id', memberId);

              if (workoutParticipantError) throw workoutParticipantError;

              // Finally delete the member
              const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .eq('id', memberId);

              if (deleteError) throw deleteError;
              
              // Update local state
              setMembers(prev => prev.filter(member => member.id !== memberId));
              Alert.alert('Success', 'Member deleted successfully');
            } catch (error) {
              console.error('Error deleting member:', error);
              Alert.alert('Error', 'Failed to delete member');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone_number?.includes(searchQuery);
    
    let matchesFilter = true;
    if (filter === 'personal') {
      matchesFilter = member.service_type === 'Personal Training';
    } else if (filter === 'group') {
      matchesFilter = member.service_type === 'Group Training';
    } else if (filter === 'pending') {
      matchesFilter = member.onboarding_status === 'pending';
    } else if (filter === 'active') {
      matchesFilter = member.onboarding_status === 'completed';
    }
    
    return matchesSearch && matchesFilter;
  });

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

  // Add a demo member if none exist
  const addDemoMember = async () => {
    try {
      const { data: existingMembers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'member')
        .limit(1);
      
      if (checkError) throw checkError;
      
      if (!existingMembers || existingMembers.length === 0) {
        const { data: member, error: memberError } = await supabase
          .from('users')
          .insert({
            display_name: 'Alex Wong',
            email: 'alex@example.com',
            phone_number: '+91 98765 43210',
            role: 'member',
            service_type: 'Personal Training',
            primary_goal: 'Weight Loss',
            onboarding_status: 'completed',
            notes: 'Demo member for testing',
          })
          .select()
          .single();

        if (memberError) throw memberError;
        
        // Refresh the member list
        fetchMembers();
      }
    } catch (error) {
      console.error('Error adding demo member:', error);
    }
  };

  // Check for members and add a demo one if none exist
  useEffect(() => {
    if (!loading && members.length === 0) {
      addDemoMember();
    }
  }, [loading, members]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Member Management</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/trainer-dashboard/members/add')}
        >
          <Text style={styles.addButtonText}>Add Member</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <Pressable
            style={[
              styles.filterChip,
              filter === 'all' && styles.selectedFilter
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterText,
              filter === 'all' && styles.selectedFilterText
            ]}>All Members</Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              filter === 'personal' && styles.selectedFilter
            ]}
            onPress={() => setFilter('personal')}
          >
            <Text style={[
              styles.filterText,
              filter === 'personal' && styles.selectedFilterText
            ]}>Personal Training</Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              filter === 'group' && styles.selectedFilter
            ]}
            onPress={() => setFilter('group')}
          >
            <Text style={[
              styles.filterText,
              filter === 'group' && styles.selectedFilterText
            ]}>Group Training</Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              filter === 'pending' && styles.selectedFilter
            ]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[
              styles.filterText,
              filter === 'pending' && styles.selectedFilterText
            ]}>Pending</Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              filter === 'active' && styles.selectedFilter
            ]}
            onPress={() => setFilter('active')}
          >
            <Text style={[
              styles.filterText,
              filter === 'active' && styles.selectedFilterText
            ]}>Active</Text>
          </Pressable>
        </ScrollView>
      </View>

      <View style={styles.actionsRow}>
        <Pressable 
          style={styles.invitationsButton}
          onPress={() => router.push('/trainer-dashboard/members/invitations')}
        >
          <Ionicons name="mail" size={16} color="#4F46E5" />
          <Text style={styles.invitationsText}>Manage Invitations</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading members...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredMembers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people" size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>No members found</Text>
            <Text style={styles.emptySubtext}>
              Add your first member by clicking the "Add Member" button above.
            </Text>
            <Pressable 
              style={styles.addFirstMemberButton}
              onPress={() => router.push('/trainer-dashboard/members/add')}
            >
              <Ionicons name="person-add" size={20} color="#FFFFFF" />
              <Text style={styles.addFirstMemberText}>Add First Member</Text>
            </Pressable>
          </View>
        ) : (
          filteredMembers.map((member, index) => (
            <Animated.View
              key={member.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <Pressable 
                style={styles.memberCard}
                onPress={() => router.push(`/trainer-dashboard/members/${member.id}`)}
              >
                <View style={styles.memberHeader}>
                  <View>
                    <Text style={styles.memberName}>{member.display_name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    {member.phone_number && (
                      <Text style={styles.memberPhone}>{member.phone_number}</Text>
                    )}
                  </View>
                  <View style={styles.memberBadges}>
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

                <View style={styles.memberDetails}>
                  {member.primary_goal && (
                    <View style={styles.detailItem}>
                      <Ionicons name="flag" size={16} color="#64748B" />
                      <Text style={styles.detailText}>Goal: {member.primary_goal}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.memberActions}>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`/trainer-dashboard/members/${member.id}/edit`)}
                  >
                    <Ionicons name="create" size={20} color="#4F46E5" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </Pressable>
                  {member.onboarding_status === 'completed' && (
                    <Pressable 
                      style={styles.actionButton}
                      onPress={() => router.push(`/trainer-dashboard/members/${member.id}/assessment`)}
                    >
                      <Ionicons name="fitness" size={20} color="#4F46E5" />
                      <Text style={styles.actionButtonText}>Assessment</Text>
                    </Pressable>
                  )}
                  <Pressable 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteMember(member.id)}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                    <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                  </Pressable>
                </View>
              </Pressable>
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
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  selectedFilter: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  invitationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0FF',
    borderRadius: 20,
  },
  invitationsText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
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
    marginBottom: 20,
  },
  addFirstMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstMemberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  memberCard: {
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
  memberHeader: {
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
  memberBadges: {
    alignItems: 'flex-end',
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
  memberDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
  },
  memberActions: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteButtonText: {
    color: '#EF4444',
  },
});