import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../../utils/supabase';

interface Squad {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  schedule: any;
  member_count: {
    count: number;
  };
  created_at: string;
}

export default function ManageSquads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteSquad = async (squadId: string) => {
    Alert.alert(
      'Delete Squad',
      'Are you sure you want to delete this squad? This will remove all members and workout plans associated with this squad.',
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
              
              const { error: deleteError } = await supabase
                .from('squads')
                .delete()
                .eq('id', squadId);

              if (deleteError) throw deleteError;
              
              // Update local state
              setSquads(prev => prev.filter(squad => squad.id !== squadId));
              Alert.alert('Success', 'Squad deleted successfully');
            } catch (error) {
              console.error('Error deleting squad:', error);
              Alert.alert('Error', 'Failed to delete squad');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('squads')
        .select(`
          *,
          member_count:squad_members(count)
        `)
        .eq('created_by', '00000000-0000-0000-0000-000000000000');

      if (fetchError) throw fetchError;
      setSquads(data || []);
    } catch (error) {
      console.error('Error fetching squads:', error);
      setError('Failed to load squads');
    } finally {
      setLoading(false);
    }
  };

  const filteredSquads = squads.filter(squad =>
    squad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    squad.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Manage Squads</Text>
        <Pressable 
          style={styles.createButton}
          onPress={() => router.push('/trainer-dashboard/manage-squads/create')}
        >
          <Text style={styles.createButtonText}>Create Squad</Text>
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

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading squads...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredSquads.length === 0 ? (
          <Text style={styles.emptyText}>No squads found</Text>
        ) : (
          filteredSquads.map((squad, index) => (
            <Animated.View
              key={squad.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <Pressable 
                style={styles.squadCard}
                onPress={() => router.push(`/trainer-dashboard/manage-squads/${squad.id}`)}
              >
                <View style={styles.squadHeader}>
                  <View>
                    <Text style={styles.squadName}>{squad.name}</Text>
                    <Text style={styles.squadDescription}>{squad.description}</Text>
                  </View>
                  <BlurView intensity={80} style={styles.memberCount}>
                    <Ionicons name="people" size={16} color="#000000" />
                    <Text style={styles.memberCountText}>{squad.member_count.count}</Text>
                  </BlurView>
                </View>

                <View style={styles.squadActions}>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`/trainer-dashboard/manage-squads/${squad.id}/edit`)}
                  >
                    <Ionicons name="create" size={20} color="#4F46E5" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`/trainer-dashboard/manage-squads/${squad.id}/calendar`)}
                  >
                    <Ionicons name="calendar" size={20} color="#4F46E5" />
                    <Text style={styles.actionButtonText}>Schedule</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`/trainer-dashboard/manage-squads/${squad.id}/members`)}
                  >
                    <Ionicons name="people" size={20} color="#4F46E5" />
                    <Text style={styles.actionButtonText}>Members</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => {
                      handleDeleteSquad(squad.id);
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#EF4444" />
                    <Text style={styles.actionButtonText}>Delete</Text>
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
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
  },
  squadCard: {
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
  squadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  squadName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  squadDescription: {
    fontSize: 14,
    color: '#64748B',
    maxWidth: '80%',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  memberCountText: {
    fontSize: 14,
    color: '#000000',
  },
  squadActions: {
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
});