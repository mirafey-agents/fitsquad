import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';

export default function AssignWorkoutPlan() {
  const { id } = useLocalSearchParams();
  const [workoutPlan, setWorkoutPlan] = useState<any>(null);
  const [squads, setSquads] = useState<any[]>([]);
  const [selectedSquads, setSelectedSquads] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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

      // Fetch all squads
      const { data: allSquads, error: squadsError } = await supabase
        .from('squads')
        .select('*');

      if (squadsError) throw squadsError;

      // Fetch already assigned squads
      const { data: assignedSquads, error: assignedError } = await supabase
        .from('squad_workout_plans')
        .select('squad_id')
        .eq('workout_plan_id', id);

      if (assignedError) throw assignedError;

      setWorkoutPlan(plan);
      setSquads(allSquads || []);
      setSelectedSquads(assignedSquads?.map(s => s.squad_id) || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
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

      // Remove all existing assignments
      await supabase
        .from('squad_workout_plans')
        .delete()
        .eq('workout_plan_id', id);

      // Add new assignments
      if (selectedSquads.length > 0) {
        const assignmentsData = selectedSquads.map(squadId => ({
          squad_id: squadId,
          workout_plan_id: id,
          assigned_by: '00000000-0000-0000-0000-000000000000' // Demo user ID
        }));

        const { error: insertError } = await supabase
          .from('squad_workout_plans')
          .insert(assignmentsData);

        if (insertError) throw insertError;
      }

      router.back();
    } catch (error) {
      console.error('Error saving assignments:', error);
      setError('Failed to save assignments');
    }
  };

  const filteredSquads = squads.filter(squad =>
    squad.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            placeholder="Search squads"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        {filteredSquads.map((squad, index) => (
          <Animated.View
            key={squad.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[
                styles.squadCard,
                selectedSquads.includes(squad.id) && styles.selectedSquad
              ]}
              onPress={() => toggleSquad(squad.id)}
            >
              <View style={styles.squadInfo}>
                <Text style={styles.squadName}>{squad.name}</Text>
                <Text style={styles.squadDescription}>{squad.description}</Text>
              </View>
              {selectedSquads.includes(squad.id) && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                </View>
              )}
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
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  content: {
    padding: 20,
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
  selectedSquad: {
    borderColor: '#4F46E5',
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