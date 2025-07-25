import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { getMembers, createOrEditSquad } from '@/utils/firebase';
import SchedulePicker from '../components/SchedulePicker';

export default function CreateSquad() {
  const [members, setMembers] = useState([]);
  const [squadName, setSquadName] = useState('');
  const [squadDescription, setSquadDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const members = await getMembers("");
      console.log("Fetched members:", members);
      setMembers(members.data as [] || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };



  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedServiceType || member.serviceType === selectedServiceType;
    return matchesSearch && matchesType;
  });

  const handleCreate = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const ack = await createOrEditSquad(
        squadName, squadDescription, selectedDays, selectedMembers, null);
      console.log("Squad created:", ack);
      alert("Squad created successfully");
      router.back();
    } catch (error) {
      console.error('Error creating squad:', error);
      alert("Failed to create squad. Please try again.");
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>Create Squad</Text>
          <Pressable 
            style={[
              styles.createButton,
              (!squadName || selectedMembers.length === 0 || isLoading) && styles.disabledButton
            ]}
            onPress={handleCreate}
            disabled={!squadName || selectedMembers.length === 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
            )}
          </Pressable>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Squad Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Squad Name"
              value={squadName}
              onChangeText={setSquadName}
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={squadDescription}
              onChangeText={setSquadDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#94A3B8"
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.section}>
            <SchedulePicker
              selectedDays={selectedDays}
              onSelectedDaysChange={setSelectedDays}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Members</Text>
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
                      <Text style={styles.memberName}>{member.display_name}</Text>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#21262F',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21262F',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  filterContainer: {
    paddingBottom: 16,
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
  memberCard: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#374151',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  serviceTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
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
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 12,
  },
  performanceLabel: {
    fontSize: 14,
    color: '#94A3B8',
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});