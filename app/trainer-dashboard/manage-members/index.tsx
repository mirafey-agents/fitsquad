import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../utils/supabase';

// Demo data - replace with actual data from Supabase
const MEMBERS = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    serviceType: 'Personal Training',
    squads: ['Morning Warriors'],
    joinDate: '2024-02-01',
    status: 'active',
    attendance: 95,
    progress: 92,
  },
  {
    id: '2',
    name: 'Mike Ross',
    email: 'mike@example.com',
    serviceType: 'Group Training',
    squads: ['Power Squad', 'Morning Warriors'],
    joinDate: '2024-02-15',
    status: 'active',
    attendance: 88,
    progress: 85,
  },
  {
    id: '3',
    name: 'Alex Wong',
    email: 'alex@example.com',
    serviceType: 'Personal Training',
    squads: ['Power Squad'],
    joinDate: '2024-02-10',
    status: 'active',
    attendance: 90,
    progress: 88,
  },
];

const SQUADS = [
  {
    id: '1',
    name: 'Morning Warriors',
    members: 12,
    type: 'Mixed',
  },
  {
    id: '2',
    name: 'Power Squad',
    members: 8,
    type: 'Group Training',
  },
];

export default function ManageMembers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);

  const filteredMembers = MEMBERS.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedServiceType || member.serviceType === selectedServiceType;
    return matchesSearch && matchesType;
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Manage Members</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/trainer-dashboard/manage-members/add')}
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
              !selectedServiceType && styles.selectedFilter
            ]}
            onPress={() => setSelectedServiceType(null)}
          >
            <Text style={[
              styles.filterText,
              !selectedServiceType && styles.selectedFilterText
            ]}>All</Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              selectedServiceType === 'Personal Training' && styles.selectedFilter
            ]}
            onPress={() => setSelectedServiceType('Personal Training')}
          >
            <Text style={[
              styles.filterText,
              selectedServiceType === 'Personal Training' && styles.selectedFilterText
            ]}>Personal Training</Text>
          </Pressable>
          <Pressable
            style={[
              styles.filterChip,
              selectedServiceType === 'Group Training' && styles.selectedFilter
            ]}
            onPress={() => setSelectedServiceType('Group Training')}
          >
            <Text style={[
              styles.filterText,
              selectedServiceType === 'Group Training' && styles.selectedFilterText
            ]}>Group Training</Text>
          </Pressable>
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {filteredMembers.map((member, index) => (
          <Animated.View
            key={member.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable 
              style={styles.memberCard}
              onPress={() => router.push(`/trainer-dashboard/manage-members/${member.id}`)}
            >
              <View style={styles.memberHeader}>
                <View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
                <BlurView intensity={80} style={styles.serviceTypeBadge}>
                  <Text style={styles.serviceTypeText}>{member.serviceType}</Text>
                </BlurView>
              </View>

              <View style={styles.memberStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Attendance</Text>
                  <Text style={styles.statValue}>{member.attendance}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Progress</Text>
                  <Text style={styles.statValue}>{member.progress}%</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Joined</Text>
                  <Text style={styles.statValue}>
                    {new Date(member.joinDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.squadsSection}>
                <Text style={styles.squadsLabel}>Squads:</Text>
                <View style={styles.squadsList}>
                  {member.squads.map((squad) => (
                    <View key={squad} style={styles.squadBadge}>
                      <Text style={styles.squadText}>{squad}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.actionButtons}>
                <Pressable 
                  style={styles.actionButton}
                  onPress={() => router.push(`/trainer-dashboard/manage-members/${member.id}/edit`)}
                >
                  <Ionicons name="create" size={20} color="#4F46E5" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>
                <Pressable 
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    // Implement delete functionality
                    console.log('Delete member:', member.id);
                  }}
                >
                  <Ionicons name="trash" size={20} color="#EF4444" />
                  <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Remove</Text>
                </Pressable>
              </View>
            </Pressable>
          </Animated.View>
        ))}
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
  content: {
    padding: 20,
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
    marginBottom: 16,
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
  },
  serviceTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  serviceTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  squadsSection: {
    marginBottom: 16,
  },
  squadsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  squadsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  squadBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  squadText: {
    fontSize: 12,
    color: '#1E293B',
  },
  actionButtons: {
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