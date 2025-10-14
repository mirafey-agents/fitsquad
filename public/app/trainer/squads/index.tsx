import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { getSquads } from '@/utils/firebase';

interface Squad {
  id: string;
  name: string;
  description: string;
  schedule: string[];
  members: any[];
  createdAt: string;
}

export default function ManageSquads() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    try {
      setLoading(true);
      setError(null);

      const {data} = await getSquads(null);
      console.log('getSquads', data);
      setSquads(data as Squad[] || []);
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
          onPress={() => router.push('./create', {relativeToDirectory: true})}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
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
                onPress={() => router.push(`./${squad.id}/edit`, {relativeToDirectory: true})}
              >
                <View style={styles.squadHeader}>
                  <View>
                    <Text style={styles.squadName}>{squad.name}</Text>
                    <Text style={styles.squadDescription}>{squad.description}</Text>
                  </View>
                  <BlurView intensity={80} style={styles.memberCount}>
                    <Ionicons name="people" size={16} color="#000000" />
                    <Text style={styles.memberCountText}>{squad.members.length}</Text>
                  </BlurView>
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
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#4F46E5",
    borderRadius: 6,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#21262F",
  },
  searchContainer: {
    padding: 20,
    backgroundColor: "#060712",
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#21262F",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#FFFFFF",
  },
  content: {
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#9AAABD",
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#9AAABD",
    textAlign: 'center',
    marginTop: 20,
  },
  squadCard: {
    backgroundColor: "#21262F",
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
    color: "#FFFFFF",
    marginBottom: 4,
  },
  squadDescription: {
    fontSize: 14,
    color: "#9AAABD",
    maxWidth: '80%',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  memberCountText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  squadActions: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#21262F",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: '500',
  },
});