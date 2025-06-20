import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TabView, TabBar } from 'react-native-tab-view';
import { supabase } from '@/utils/supabase';
import { getSquads, getMembers, getExercises, createSession } from '@/utils/firebase';
import FilterableList from './components/FilterableList';

interface Squad {
  id: string;
  name: string;
  description: string;
}

interface User {
  id: string;
  display_name: string;
  email: string;
}

interface Exercise {
  id: string;
  name: string;
  module_type: string;
  level: string;
  sets?: number;
  reps?: string;
}

export default function CreateSession() {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    selectedSquads: [] as Squad[],
    selectedUsers: [] as User[],
    selectedExercises: [] as Exercise[],
  });
  const [squads, setSquads] = useState<Squad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'squads', title: 'Squads' },
    { key: 'members', title: 'Members' },
    { key: 'exercises', title: 'Exercises' },
  ]);

  useEffect(() => {
    fetchSquads();
    fetchUsers();
    fetchExercises();
  }, []);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      const { data } = await getSquads(null);
      setSquads(data as Squad[]);
    } catch (error) {
      console.error('Error fetching squads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const {data} = await getMembers(null);
      setUsers(data as User[] || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const {data} = await getExercises();
      setExercises(data as Exercise[] || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Session title is required');
      return;
    }

    if (formData.selectedSquads.length === 0 && formData.selectedUsers.length === 0) {
      Alert.alert('Error', 'Please select at least one squad or user');
      return;
    }

    if (formData.selectedExercises.length === 0) {
      Alert.alert('Error', 'Please select at least one exercise');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }
      const result = await createSession(
        formData.title,
        formData.date.toISOString(),
        formData.selectedSquads[0].id,
        formData.selectedUsers.map(u => u.id),
        formData.selectedExercises
      );
      if (!result.data || !(result.data as any).success) {
        throw new Error('Failed to create session');
      }
      
      alert('Session created successfully');
      router.back();
    } catch (error) {
      console.log('Error creating session:', error);
      setError('Failed to create session');
      alert('Some error occurred while creating the session');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseUpdate = useCallback((exerciseId: string, field: 'sets' | 'reps', value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, [field]: value || "" }
          : ex
      )
    }));
  }, []);

  const renderScene = useCallback(({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case 'squads':
        return (
          <FilterableList
            tabKey="squads"
            placeholder="Search squads"
            items={squads}
            selectedItems={formData.selectedSquads}
            onSelectionChange={(selectedSquads) => setFormData(prev => ({ ...prev, selectedSquads }))}
            getItemId={(squad) => squad.id}
            getItemName={(squad) => squad.name}
            getItemDescription={(squad) => squad.description}
          />
        );
      case 'members':
        return (
          <FilterableList
            tabKey="members"
            placeholder="Search members"
            items={users}
            selectedItems={formData.selectedUsers}
            onSelectionChange={(selectedUsers) => setFormData(prev => ({ ...prev, selectedUsers }))}
            getItemId={(user) => user.id}
            getItemName={(user) => user.display_name}
            getItemDescription={(user) => user.email}
          />
        );
      case 'exercises':
        return (
          <FilterableList
            tabKey="exercises"
            placeholder="Search exercises"
            items={exercises}
            selectedItems={formData.selectedExercises}
            onSelectionChange={(selectedExercises) => setFormData(prev => ({ ...prev, selectedExercises }))}
            getItemId={(exercise) => exercise.id}
            getItemName={(exercise) => exercise.name}
            getItemDescription={(exercise) => exercise.module_type}
          />
        );
      default:
        return null;
    }
  }, [squads, users, exercises, formData.selectedSquads, formData.selectedUsers, formData.selectedExercises]);

  const renderTabBar = useCallback((props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#4F46E5"
      inactiveColor="#64748B"
    />
  ), []);

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
      <View style={[styles.header, loading && styles.disabled]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Create Session</Text>
        <Pressable 
          style={[
            styles.createButton,
            (!formData.title || (formData.selectedSquads.length === 0 && formData.selectedUsers.length === 0)) && styles.disabledButton
          ]}
          onPress={handleCreate}
          disabled={!formData.title || (formData.selectedSquads.length === 0 && formData.selectedUsers.length === 0)}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </Pressable>
      </View>

      <ScrollView style={[styles.content, loading && styles.disabled]}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Session Title"
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholderTextColor="#64748B"
          />
          <View style={styles.datePickerContainer}>
            <input
              type="datetime-local"
              value={formData.date.toLocaleString('sv', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T')}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setFormData(prev => ({ ...prev, date }));
              }}
              style={{
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #21262F',
                fontSize: '16px',
                color: '#FFFFFF',
                backgroundColor: '#21262F',
              }}
            />
          </View>

          {(formData.selectedSquads.length > 0 || formData.selectedUsers.length > 0) && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedTitle}>Selected Participants</Text>
              {formData.selectedSquads.map(squad => (
                <View key={squad.id} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>Squad: {squad.name}</Text>
                  <Pressable onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    selectedSquads: prev.selectedSquads.filter(s => s.id !== squad.id) 
                  }))}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
              {formData.selectedUsers.map(user => (
                <View key={user.id} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>Member: {user.display_name}</Text>
                  <Pressable onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    selectedUsers: prev.selectedUsers.filter(u => u.id !== user.id) 
                  }))}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {formData.selectedExercises.length > 0 && (
            <View style={styles.exercisesTable}>
              <Text style={styles.selectedTitle}>Selected Exercises</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 2 }]}>Exercise</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Reps</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Sets</Text>
                <View style={{ width: 20 }} />
              </View>
              {formData.selectedExercises.map(exercise => (
                <View key={exercise.id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{exercise.name}</Text>
                  <TextInput
                    style={[styles.tableCell, styles.numberInput, { width: 80 }]}
                    value={exercise.reps?.toString() || ''}
                    onChangeText={(value) => handleExerciseUpdate(exercise.id, 'reps', value)}
                    placeholder="0"
                    placeholderTextColor="#64748B"
                  />
                  <TextInput
                    style={[styles.tableCell, styles.numberInput, { width: 80 }]}
                    value={exercise.sets?.toString() || ''}
                    onChangeText={(value) => handleExerciseUpdate(exercise.id, 'sets', value)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#64748B"
                  />
                  <Pressable onPress={() => setFormData(prev => ({ 
                    ...prev, 
                    selectedExercises: prev.selectedExercises.filter(e => e.id !== exercise.id) 
                  }))}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Participants & Exercises</Text>
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            renderTabBar={renderTabBar}
            style={styles.tabView}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#060712",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#060712",
    borderBottomWidth: 1,
    borderBottomColor: "#21262F",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
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
    color: "#FFFFFF",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#21262F",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#3C4148",
    marginBottom: 12,
  },
  datePickerContainer: {
    marginBottom: 16,
    width: 'auto',
    alignSelf: 'flex-start',
  },
  selectionList: {
    gap: 12,
  },
  selectionCard: {
    backgroundColor: "#21262F",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#3C4148",
  },
  selectedCard: {
    borderColor: "#4F46E5",
  },
  selectionInfo: {
    flex: 1,
  },
  selectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: "#FFFFFF",
    marginBottom: 4,
  },
  selectionDescription: {
    fontSize: 14,
    color: "#9AAABD",
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  tabView: {
    height: 400,
    zIndex: 1,
  },
  tabBar: {
    backgroundColor: "#060712",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#21262F",
  },
  tabIndicator: {
    backgroundColor: "#4F46E5",
    height: 3,
  },
  tabLabel: {
    textTransform: 'none',
    fontWeight: '600',
    color: "#FFFFFF",
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#060712",
  },
  selectedContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#21262F",
    borderRadius: 12,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: "#FFFFFF",
    marginBottom: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3C4148",
  },
  selectedItemText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  exercisesTable: {
    marginTop: 16,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  numberInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    marginHorizontal: 4,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: "#21262F",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3C4148",
  },
  dateText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
}); 