import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { getMembers } from '@/utils/firebase';

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

export default function MemberManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchMembers();
    }, [])
  );

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const {data} = await getMembers("");
      console.log("Fetched members:", data);
      setMembers(data as Member[] || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };


  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone_number?.includes(searchQuery);
    
    return matchesSearch;
  });

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
          <Text style={styles.title}>Member Management</Text>
          <Pressable 
            style={styles.addButton}
            onPress={() => router.push('./add', {relativeToDirectory: true})}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search members"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>
        </Animated.View>

        {loading ? (
          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={styles.centerContainer}>
              <Text style={styles.loadingText}>Loading members...</Text>
            </View>
          </Animated.View>
        ) : error ? (
          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </Animated.View>
        ) : filteredMembers.length === 0 ? (
          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No members found</Text>
              {members.length === 0 && (
              <Pressable 
                style={styles.addFirstMemberButton}
                onPress={() => router.push('./add', {relativeToDirectory: true})}
              >
                <Ionicons name="person-add" size={20} color="#FFFFFF" />
                <Text style={styles.addFirstMemberText}>Add First Member</Text>
              </Pressable>
              )}
            </View>
          </Animated.View>
        ) : (
          filteredMembers.map((member, index) => (
            <Animated.View
              key={member.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <View style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <View>
                    <Text style={styles.memberName}>{member.display_name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    {member.phone_number && (
                      <Text style={styles.memberPhone}>{member.phone_number}</Text>
                    )}
                  </View>
                  <Pressable 
                    style={styles.chevronButton}
                    onPress={() => router.push(`./${member.id}`, {relativeToDirectory: true})}
                  >
                    <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
                  </Pressable>
                  {/* <View style={styles.memberBadges}>
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
                  </View> */}
                </View>
              </View>
            </Animated.View>
          ))
        )}
      </View>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#21262F',
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedFilter: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
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
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 14,
    color: '#94A3B8',
  },
  chevronButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
});