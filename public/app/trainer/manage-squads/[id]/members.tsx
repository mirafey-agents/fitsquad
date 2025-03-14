import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../../../../constants/theme';
import { supabase } from '../../../../utils/supabase';

interface Member {
  id: string;
  user_id: string;
  role: 'member' | 'trainer';
  joined_at: string;
  user: {
    display_name: string;
    email: string;
    service_type: string;
  };
  attendance_rate?: number;
  performance_score?: number;
}

interface Squad {
  id: string;
  name: string;
  description: string;
}

export default function SquadMembers() {
  const { id } = useLocalSearchParams();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchSquadDetails(id);
    }
  }, [id]);

  const fetchSquadDetails = async (squadId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch squad details
      const { data: squadData, error: squadError } = await supabase
        .from('squads')
        .select('*')
        .eq('id', squadId)
        .single();

      if (squadError) throw squadError;
      setSquad(squadData);

      // Fetch squad members with user details
      const { data: membersData, error: membersError } = await supabase
        .from('squad_members')
        .select(`
          *,
          user:users(
            display_name,
            email,
            service_type
          )
        `)
        .eq('squad_id', squadId);

      if (membersError) throw membersError;

      // Calculate attendance and performance
      const membersWithStats = await Promise.all((membersData || []).map(async (member) => {
        const { data: stats } = await supabase
          .from('workout_participants')
          .select(`
            attendance_status,
            performance_score
          `)
          .eq('user_id', member.user_id)
          .in('attendance_status', ['present', 'absent']);

        const attendance = stats?.length ? 
          stats.filter(s => s.attendance_status === 'present').length / stats.length * 100 : 
          0;

        const performance = stats?.length ?
          stats.reduce((acc, curr) => acc + (curr.performance_score || 0), 0) / stats.length :
          0;

        return {
          ...member,
          attendance_rate: attendance,
          performance_score: performance,
        };
      }));

      setMembers(membersWithStats);
    } catch (error) {
      console.error('Error fetching squad details:', error);
      setError('Failed to load squad details');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    Alert.alert(
      'Remove Member',
      `Are you sure you want to remove ${memberName} from this squad?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const { error: removeError } = await supabase
                .from('squad_members')
                .delete()
                .eq('id', memberId);

              if (removeError) throw removeError;

              setMembers(prev => prev.filter(m => m.id !== memberId));
              Alert.alert('Success', 'Member removed successfully');
            } catch (error) {
              console.error('Error removing member:', error);
              Alert.alert('Error', 'Failed to remove member');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredMembers = members.filter(member =>
    member?.user?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </Pressable>
        <Text style={styles.title}>Squad Members</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push(`/trainer/manage-squads/${id}/members/add`)}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {squad && (
        <View style={styles.squadInfo}>
          <Text style={styles.squadName}>{squad?.name || 'Loading...'}</Text>
          <Text style={styles.squadDescription}>{squad?.description || ''}</Text>
          <View style={styles.squadStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {members?.length || 0}
              </Text>
              <Text style={styles.statLabel}>Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {members?.length ? Math.round(members.reduce((acc, m) => acc + (m.attendance_rate || 0), 0) / members.length) : 0}%
              </Text>
              <Text style={styles.statLabel}>Avg Attendance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {members?.length ? Math.round(members.reduce((acc, m) => acc + (m.performance_score || 0), 0) / members.length) : 0}%
              </Text>
              <Text style={styles.statLabel}>Avg Performance</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search members"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray[400]}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading members...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.membersList}>
          {filteredMembers.map((member, index) => (
            <Animated.View
              key={member?.id || index}
              entering={FadeInUp.delay(index * 100)}
            >
              <View style={styles.memberCard}>
                <View style={styles.memberHeader}>
                  <View>
                    <Text style={styles.memberName}>{member?.user?.display_name || 'Unknown Member'}</Text>
                    <Text style={styles.memberEmail}>{member?.user?.email || ''}</Text>
                  </View>
                  <BlurView intensity={80} style={styles.roleBadge}>
                    <Text style={styles.roleText}>
                      {member?.role || 'member'}
                    </Text>
                  </BlurView>
                </View>

                <View style={styles.memberStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Attendance</Text>
                    <Text style={[styles.statValue, { color: (member?.attendance_rate || 0) >= 80 ? colors.semantic.success : colors.semantic.warning }]}>
                      {Math.round(member?.attendance_rate || 0)}%
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Performance</Text>
                    <Text style={[styles.statValue, { color: (member?.performance_score || 0) >= 80 ? colors.semantic.success : colors.semantic.warning }]}>
                      {Math.round(member?.performance_score || 0)}%
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Joined</Text>
                    <Text style={styles.statValue}>
                      {member?.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </View>

                <View style={styles.memberActions}>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`/trainer/members/${member.user_id}`, {relativeToDirectory: true})}
                  >
                    <Ionicons name="person" size={20} color={colors.primary.dark} />
                    <Text style={styles.actionButtonText}>Profile</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`/trainer/members/${member.user_id}/assessment`, {relativeToDirectory: true})}
                  >
                    <Ionicons name="analytics" size={20} color={colors.primary.dark} />
                    <Text style={styles.actionButtonText}>Assessment</Text>
                  </Pressable>
                  <Pressable 
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveMember(member.id, member?.user?.display_name || 'Unknown Member')}
                  >
                    <Ionicons name="person-remove" size={20} color={colors.semantic.error} />
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.xl * 2 : spacing.xl,
    backgroundColor: colors.primary.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  addButton: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
    color: colors.primary.light,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  squadInfo: {
    padding: spacing.md,
    backgroundColor: colors.primary.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  squadName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  squadDescription: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  squadStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.primary.light,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.size.md,
    color: colors.primary.dark,
  },
  membersList: {
    padding: spacing.md,
  },
  memberCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  memberName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  memberEmail: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.dark + '20',
  },
  roleText: {
    fontSize: typography.size.xs,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
    textTransform: 'capitalize',
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  memberActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  removeButton: {
    marginLeft: 'auto',
  },
  removeButtonText: {
    color: colors.semantic.error,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.gray[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    textAlign: 'center',
  },
});