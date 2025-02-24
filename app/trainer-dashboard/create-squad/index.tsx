import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../utils/supabase';

// Demo data - replace with actual data from Supabase
const AVAILABLE_MEMBERS = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    serviceType: 'Personal Training',
    performance: 95,
  },
  {
    id: '2',
    name: 'Mike Ross',
    email: 'mike@example.com',
    serviceType: 'Group Training',
    performance: 88,
  },
  {
    id: '3',
    name: 'Alex Wong',
    email: 'alex@example.com',
    serviceType: 'Personal Training',
    performance: 92,
  },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CreateSquad() {
  const [squadName, setSquadName] = useState('');
  const [squadDescription, setSquadDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const filteredMembers = AVAILABLE_MEMBERS.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedServiceType || member.serviceType === selectedServiceType;
    return matchesSearch && matchesType;
  });

  const handleCreate = async () => {
    try {
      const { data: squad, error: squadError } = await supabase
        .from('squads')
        .insert({
          name: squadName,
          description: squadDescription,
          is_private: isPrivate,
          schedule: selectedDays,
          created_by: '00000000-0000-0000-0000-000000000000' // Demo user ID
        })
        .select()
        .single();

      if (squadError) throw squadError;

      const membersData = selectedMembers.map(memberId => ({
        squad_id: squad.id,
        user_id: memberId,
        role: 'member'
      }));

      const { error: membersError } = await supabase
        .from('squad_members')
        .insert(membersData);

      if (membersError) throw membersError;

      router.back();
    } catch (error) {
      console.error('Error creating squad:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Create Squad</Text>
        <Pressable 
          style={[
            styles.createButton,
            (!squadName || selectedMembers.length === 0) && styles.disabledButton
          ]}
          onPress={handleCreate}
          disabled={!squadName || selectedMembers.length === 0}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Squad Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Squad Name"
            value={squadName}
            onChangeText={setSquadName}
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={squadDescription}
            onChangeText={setSquadDescription}
            multiline
            numberOfLines={4}
            placeholderTextColor="#64748B"
          />
          <View style={styles.privacyToggle}>
            <Text style={styles.privacyLabel}>Private Squad</Text>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#E2E8F0', true: '#818CF8' }}
              thumbColor={isPrivate ? '#4F46E5' : '#FFFFFF'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.daysGrid}>
            {WEEK_DAYS.map((day) => (
              <Pressable
                key={day}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.selectedDay
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  selectedDays.includes(day) && styles.selectedDayText
                ]}>{day}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Members</Text>
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

          {filteredMembers.map((member, index) => (
            <Animated.View
              key={member.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <Pressable
                style={[
                  styles.memberCard,
                  selectedMembers.includes(member.id) && styles.selectedMember
                ]}
                onPress={() => toggleMember(member.id)}
              >
                <View style={styles.memberInfo}>
                  <View>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  </View>
                  <BlurView intensity={80} style={styles.serviceTypeBadge}>
                    <Text style={styles.serviceTypeText}>{member.serviceType}</Text>
                  </BlurView>
                </View>
                <View style={styles.memberPerformance}>
                  <Text style={styles.performanceLabel}>Performance</Text>
                  <Text style={styles.performanceValue}>{member.performance}%</Text>
                </View>
                {selectedMembers.includes(member.id) && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))}
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
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  privacyLabel: {
    fontSize: 16,
    color: '#1E293B',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedDay: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  dayText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  filterContainer: {
    paddingBottom: 16,
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
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedMember: {
    borderColor: '#4F46E5',
  },
  memberInfo: {
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
  memberPerformance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});