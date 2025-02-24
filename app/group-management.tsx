import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

const GROUP_MEMBERS = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Trainer',
    joinDate: '2023-12-01',
    attendance: 95,
    performance: 98,
  },
  {
    id: '2',
    name: 'Mike Ross',
    role: 'Member',
    joinDate: '2023-12-15',
    attendance: 88,
    performance: 92,
  },
  // Add more members...
];

export default function GroupManagement() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Group Management</Text>
        <Pressable style={styles.addButton}>
          <Ionicons name="person-add" size={20} color="#22C55E" />
          <Text style={styles.addButtonText}>Add Member</Text>
        </Pressable>
      </View>

      <View style={styles.membersList}>
        {GROUP_MEMBERS.map((member) => (
          <BlurView key={member.id} intensity={80} style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <View style={styles.memberHeader}>
                <Text style={styles.memberName}>{member.name}</Text>
                <BlurView intensity={80} style={styles.roleBadge}>
                  <Text style={styles.roleText}>{member.role}</Text>
                </BlurView>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Attendance</Text>
                  <Text style={styles.statValue}>{member.attendance}%</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Performance</Text>
                  <Text style={styles.statValue}>{member.performance}%</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Joined</Text>
                  <Text style={styles.statValue}>
                    {new Date(member.joinDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.memberActions}>
              {member.role === 'Trainer' ? (
                <Pressable style={styles.actionButton}>
                  <Ionicons name="create" size={20} color="#6B7280" />
                  <Text style={styles.actionButtonText}>Edit Workouts</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.actionButton}>
                  <Ionicons name="stats-chart" size={20} color="#6B7280" />
                  <Text style={styles.actionButtonText}>View Progress</Text>
                </Pressable>
              )}
            </View>
          </BlurView>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  addButtonText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
  },
  membersList: {
    padding: 20,
    gap: 16,
  },
  memberCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  memberInfo: {
    marginBottom: 16,
  },
  memberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  memberActions: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
});