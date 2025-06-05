import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { getFunctions, httpsCallable } from 'firebase/functions';
// import "react-datepicker/dist/react-datepicker.css";
import { supabase } from '@/utils/supabase';
import { getExercises, getMembers, getSquads, createSession } from '@/utils/firebase';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [squads, setSquads] = useState<Squad[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  // const [showDatePicker, setShowDatePicker] = useState(false);
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
    setLoading(false);
  }, []);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      const { data } = await getSquads(null);
      console.log("Fetched squads:", data);
      setSquads(data as Squad[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching squads:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const {data} = await getMembers(null);
      console.log("Fetched members:", data);
      await setUsers(data as User[] || []);
      console.log("Users:", users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const {data} = await getExercises();
      console.log("Fetched exercises:", data);
      await setExercises(data as Exercise[] || []);
      console.log("Exercises:", exercises);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching exercises:', error);
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
      if (!result.data?.success) {
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

  const toggleSquad = (squad: Squad) => {
    setFormData(prev => ({
      ...prev,
      selectedSquads: prev.selectedSquads.some(s => s.id === squad.id)
        ? prev.selectedSquads.filter(s => s.id !== squad.id)
        : [...prev.selectedSquads, squad]
    }));
  };

  const toggleUser = (user: User) => {
    setFormData(prev => ({
      ...prev,
      selectedUsers: prev.selectedUsers.some(u => u.id === user.id)
        ? prev.selectedUsers.filter(u => u.id !== user.id)
        : [...prev.selectedUsers, user]
    }));
  };

  const toggleExercise = (exercise: Exercise) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.some(e => e.id === exercise.id)
        ? prev.selectedExercises.filter(e => e.id !== exercise.id)
        : [...prev.selectedExercises, exercise]
    }));
  };

  const handleExerciseUpdate = (exerciseId: string, field: 'sets' | 'reps', value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, [field]: value || "" }
          : ex
      )
    }));
  };

  const filteredSquads = squads.filter(squad => 
    squad.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExercises = exercises.filter(exercise => 
    exercise.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.module_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.level?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSquadsTab = () => (
    <View style={styles.tabContent}>
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
      <ScrollView style={styles.selectionList}>
        {filteredSquads.map((squad, index) => (
          <Animated.View
            key={squad.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[
                styles.selectionCard,
                formData.selectedSquads.some(s => s.id === squad.id) && styles.selectedCard
              ]}
              onPress={() => toggleSquad(squad)}
            >
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionName}>{squad.name}</Text>
                <Text style={styles.selectionDescription}>{squad.description}</Text>
              </View>
              {formData.selectedSquads.some(s => s.id === squad.id) && (
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

  const renderMembersTab = () => (
    <View style={styles.tabContent}>
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
      <ScrollView style={styles.selectionList}>
        {filteredUsers.map((user, index) => (
          <Animated.View
            key={user.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[
                styles.selectionCard,
                formData.selectedUsers.some(u => u.id === user.id) && styles.selectedCard
              ]}
              onPress={() => toggleUser(user)}
            >
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionName}>{user.display_name}</Text>
                <Text style={styles.selectionDescription}>{user.email}</Text>
              </View>
              {formData.selectedUsers.some(u => u.id === user.id) && (
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

  const renderExercisesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#64748B"
        />
      </View>
      <ScrollView style={styles.selectionList}>
        {filteredExercises.map((exercise, index) => (
          <Animated.View
            key={exercise.id}
            entering={FadeInUp.delay(index * 100)}
          >
            <Pressable
              style={[
                styles.selectionCard,
                formData.selectedExercises.some(e => e.id === exercise.id) && styles.selectedCard
              ]}
              onPress={() => toggleExercise(exercise)}
            >
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionName}>{exercise.name}</Text>
                <Text style={styles.selectionDescription}>{exercise.module_type}</Text>
              </View>
              {formData.selectedExercises.some(e => e.id === exercise.id) && (
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

  const renderScene = SceneMap({
    squads: renderSquadsTab,
    members: renderMembersTab,
    exercises: renderExercisesTab,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      labelStyle={styles.tabLabel}
      activeColor="#4F46E5"
      inactiveColor="#64748B"
    />
  );

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
              min={new Date().toLocaleString('sv', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                fontSize: '16px',
                color: '#1E293B',
                backgroundColor: '#FFFFFF',
              }}
            />
          </View>

          {(formData.selectedSquads.length > 0 || formData.selectedUsers.length > 0) && (
            <View style={styles.selectedContainer}>
              <Text style={styles.selectedTitle}>Selected Participants</Text>
              {formData.selectedSquads.map(squad => (
                <View key={squad.id} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>Squad: {squad.name}</Text>
                  <Pressable onPress={() => toggleSquad(squad)}>
                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
              {formData.selectedUsers.map(user => (
                <View key={user.id} style={styles.selectedItem}>
                  <Text style={styles.selectedItemText}>Member: {user.display_name}</Text>
                  <Pressable onPress={() => toggleUser(user)}>
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
                <Text style={styles.tableHeaderText}>Exercise</Text>
                <Text style={styles.tableHeaderText}>Reps</Text>
                <Text style={styles.tableHeaderText}>Sets</Text>
                <Text style={styles.tableHeaderText}></Text>
              </View>
              {formData.selectedExercises.map(exercise => (
                <View key={exercise.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{exercise.name}</Text>
                  <TextInput
                    style={[styles.tableCell, styles.numberInput]}
                    value={exercise.reps?.toString() || ''}
                    onChangeText={(value) => handleExerciseUpdate(exercise.id, 'reps', value)}
                    placeholder="0"
                  />
                  <TextInput
                    style={[styles.tableCell, styles.numberInput]}
                    value={exercise.sets?.toString() || ''}
                    onChangeText={(value) => handleExerciseUpdate(exercise.id, 'sets', value)}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                  <Pressable onPress={() => toggleExercise(exercise)}>
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
    marginBottom: 12,
    position: 'relative',
    zIndex: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#21262F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
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
    padding: 12,
    backgroundColor: "#21262F",
    borderRadius: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3C4148",
  },
  tableHeaderText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: "#FFFFFF",
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#3C4148",
  },
  tableCell: {
    flex: 1,
    fontSize: 14,
    color: "#FFFFFF",
  },
  numberInput: {
    backgroundColor: "#3C4148",
    borderRadius: 6,
    padding: 8,
    marginHorizontal: 4,
    textAlign: 'center',
    color: "#FFFFFF",
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