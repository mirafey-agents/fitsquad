import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';

type AssignmentType = 'personal' | 'squad';

interface Member {
  id: string;
  display_name: string;
  email: string;
  service_type: string;
}

interface Squad {
  id: string;
  name: string;
  description: string;
  member_count: number;
}

export default function AssignWorkoutPlan() {
  const { id } = useLocalSearchParams();
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedSquads, setSelectedSquads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch workout plan details
      const { data: plan, error: planError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', id)
        .single();

      if (planError) throw planError;

      // Fetch all personal training members
      const { data: allMembers, error: membersError } = await supabase
        .from('users')
        .select('id, display_name, email, service_type')
        .eq('service_type', 'Personal Training');

      if (membersError) throw membersError;

      // Fetch all squads with member count
      const { data: allSquads, error: squadsError } = await supabase
        .from('squads')
        .select(`
          id,
          name,
          description,
          member_count:squad_members(count)
        `);

      if (squadsError) throw squadsError;

      // Fetch already assigned members
      const { data: assignedMembers, error: assignedMembersError } = await supabase
        .from('workout_plan_assignments')
        .select('user_id')
        .eq('workout_plan_id', id);

      if (assignedMembersError) throw assignedMembersError;

      // Fetch already assigned squads
      const { data: assignedSquads, error: assignedSquadsError } = await supabase
        .from('squad_workout_plans')
        .select('squad_id')
        .eq('workout_plan_id', id);

      if (assignedSquadsError) throw assignedSquadsError;

      setWorkoutPlan(plan);
      setMembers(allMembers || []);
      setSquads(allSquads || []);
      setSelectedMembers(assignedMembers?.map(m => m.user_id) || []);
      setSelectedSquads(assignedSquads?.map(s => s.squad_id) || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleSquad = (squadId: string) => {
    setSelectedSquads(prev => 
      prev.includes(squadId)
        ? prev.filter(id => id !== squadId)
        : [...prev, squadId]
    );
  };

  const handleSave = async () => {
    try {
      setError(null);

      // Handle personal training assignments
      if (selectedMembers.length > 0) {
        // Remove existing assignments
        await supabase
          .from('workout_plan_assignments')
          .delete()
          .eq('workout_plan_id', id);

        // Add new assignments
        const memberAssignments = selectedMembers.map(memberId => ({
          workout_plan_id: id,
          user_id: memberId,
          assigned_by: '00000000-0000-0000-0000-000000000000' // Demo user ID
        }));

        const { error: memberAssignError } = await supabase
          .from('workout_plan_assignments')
          .insert(memberAssignments);

        if (memberAssignError) throw memberAssignError;
      }

      // Handle squad assignments
      if (selectedSquads.length > 0) {
        // Remove existing assignments
        await supabase
          .from('squad_workout_plans')
          .delete()
          .eq('workout_plan_id', id);

        // Add new assignments
        const squadAssignments = selectedSquads.map(squadId => ({
          squad_id: squadId,
          workout_plan_id: id,
          assigned_by: '00000000-0000-0000-0000-000000000000' // Demo user ID
        }));

        const { error: squadAssignError } = await supabase
          .from('squad_workout_plans')
          .insert(squadAssignments);

        if (squadAssignError) throw squadAssignError;
      }

      Alert.alert('Success', 'Workout plan assignments updated successfully');
      router.back();
    } catch (error) {
      console.error('Error saving assignments:', error);
      setError('Failed to save assignments');
    }
  };

  const filteredMembers = members.filter(member =>
    member.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSquads = squads.filter(squad =>
    squad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    squad.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Assign Workout Plan</Text>
        <Pressable 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${assignmentType === 'personal' ? 'members' : 'squads'}`}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      <View style={styles.assignmentTypeSection}>
        <Pressable
          style={[
            styles.typeButton,
            assignmentType === 'personal' && styles.selectedType
          ]}
          onPress={() => setAssignmentType('personal')}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={assignmentType === 'personal' ? '#FFFFFF' : '#64748B'} 
          />
          <Text style={[
            styles.typeText,
            assignmentType === 'personal' && styles.selectedTypeText
          ]}>Personal Training</Text>
        </Pressable>
        <Pressable
          style={[
            styles.typeButton,
            assignmentType === 'squad' && styles.selectedType
          ]}
          onPress={() => setAssignmentType('squad')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={assignmentType === 'squad' ? '#FFFFFF' : '#64748B'} 
          />
          <Text style={[
            styles.typeText,
            assignmentType === 'squad' && styles.selectedTypeText
          ]}>Squads</Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        {assignmentType === 'personal' ? (
          filteredMembers.map((member, index) => (
            <Animated.View
              key={member.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <Pressable
                style={[
                  styles.memberCard,
                  selectedMembers.includes(member.id) && styles.selectedCard
                ]}
                onPress={() => toggleMember(member.id)}
              >
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.display_name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                </View>
                {selectedMembers.includes(member.id) && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))
        ) : (
          filteredSquads.map((squad, index) => (
            <Animated.View
              key={squad.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <Pressable
                style={[
                  styles.squadCard,
                  selectedSquads.includes(squad.id) && styles.selectedCard
                ]}
                onPress={() => toggleSquad(squad.id)}
              >
                <View style={styles.squadInfo}>
                  <Text style={styles.squadName}>{squad.name}</Text>
                  <Text style={styles.squadDescription}>{squad.description}</Text>
                  <View style={styles.memberCount}>
                    <Ionicons name="people" size={16} color="#64748B" />
                    <Text style={styles.memberCountText}>
                      {squad.member_count} members
                    </Text>
                  </View>
                </View>
                {selectedSquads.includes(squad.id) && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  </View>
                )}
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  saveButtonText: {
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
  assignmentTypeSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  selectedType: {
    backgroundColor: '#4F46E5',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedTypeText: {
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    margin: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  squadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: '#4F46E5',
  },
  memberInfo: {
    flex: 1,
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
  squadInfo: {
    flex: 1,
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
    marginBottom: 8,
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCountText: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedIndicator: {
    marginLeft: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 40,
  },
});