import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { getMembers, getSquads, createOrEditSquad, deleteSquad } from '@/utils/firebase';
import ConfirmModal from '@/components/ConfirmModal';
import SchedulePicker from '../../components/SchedulePicker';

export default function EditSquad() {
  const { id } = useLocalSearchParams();
  const [members, setMembers] = useState([]);
  const [squadName, setSquadName] = useState('');
  const [squadDescription, setSquadDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchMembers();
    if (typeof id === 'string') {
      fetchSquadDetails(id);
    }
  }, [id]);



  const fetchSquadDetails = async (id: string) => {
    try {
      const squad: any = (await getSquads(id)).data[0];
      console.log("Squad:", squad);
      setSquadName(squad.name);
      setSquadDescription(squad.description);
      
      // Set schedule directly as it's already in crontab format
      if (squad.schedule && Array.isArray(squad.schedule)) {
        setSelectedDays(squad.schedule);
      }
      
      setSelectedMembers(squad.members.map((member: any) => member?.userId));
    } catch (error) {
      console.error('Error fetching squad:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    return matchesSearch;
  });

  const selectedMembersList = members.filter(member => selectedMembers.includes(member.id));

  const handleEdit = async () => {
    try {
      setIsLoading(true);
      const ack = await createOrEditSquad(
        squadName, squadDescription, selectedDays, selectedMembers, id);
      console.log("Squad Edited:", ack);
      alert("Squad Saved successfully");
      setIsLoading(false);
      router.push('/trainer/squads');
    } catch (error) {
      console.error('Error creating squad:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const ack = await deleteSquad(id as string);
      console.log("Squad Deleted:", ack);
      alert("Squad Deleted successfully");
      router.back();
    } catch (error) {
      console.error('Error deleting squad:', error);
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
          <Text style={styles.title}>Edit Squad</Text>
          
          <View style={styles.headerButtons}>
            <Pressable 
              style={[styles.saveButton, (!squadName || selectedMembers.length === 0) && styles.disabledButton]}
              onPress={handleEdit}
              disabled={!squadName || selectedMembers.length === 0}
            >
              {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="save-outline" size={20} color="#FFFFFF" />}
            </Pressable>
            <Pressable 
              style={[styles.saveButton, styles.deleteButton]}
              onPress={() => setShowDeleteModal(true)}
            >
              {isLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Ionicons name="trash-outline" size={20} color="#FFFFFF" />}
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      {showDeleteModal && (
        <ConfirmModal
          displayText="Are you sure you want to delete this squad? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

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

        {selectedMembersList.length > 0 && (
          <Animated.View entering={FadeInUp.delay(250)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Selected Members ({selectedMembersList.length})</Text>
              <View style={styles.selectedMembersContainer}>
                {selectedMembersList.map((member, index) => (
                  <View key={member.id} style={styles.selectedMemberCard}>
                    <View style={styles.selectedMemberInfo}>
                      <Text style={styles.selectedMemberName}>{member.display_name}</Text>
                      <Text style={styles.selectedMemberEmail}>{member.email}</Text>
                    </View>
                    <Pressable 
                      style={styles.removeButton}
                      onPress={() => toggleMember(member.id)}
                    >
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </Pressable>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

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
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
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
  selectedMembersContainer: {
    gap: 8,
  },
  selectedMemberCard: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
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
  selectedMemberInfo: {
    flex: 1,
  },
  selectedMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedMemberEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  removeButton: {
    padding: 4,
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
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});