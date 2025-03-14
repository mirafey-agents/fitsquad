import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';
import { router } from 'expo-router';

const MOTIVATIONAL_MESSAGES = [
  "Let's crush today's goals! 💪",
  "Don't break our streak! 🔥",
  "You've got this! 🌟",
  "Ready for another win? 🏆",
  "Together we're stronger! 🤝",
];

const QUICK_REACTIONS = [
  "👏", "💪", "🎯", "🔥", "⭐", "🌟", "💯", "🏆"
];

interface Partner {
  id: string;
  name: string;
  streak: number;
  lastCheckIn?: string;
  status: 'active' | 'pending' | 'inactive';
  habits: {
    id: string;
    name: string;
    completed: boolean;
    streak: number;
  }[];
}

export default function AccountabilityPartner({ preview = false }) {
  const [partner, setPartner] = useState<Partner | null>({
    id: '1',
    name: 'Sarah Chen',
    streak: 7,
    lastCheckIn: new Date().toISOString(),
    status: 'active',
    habits: [
      {
        id: '1',
        name: 'Morning Workout',
        completed: true,
        streak: 5,
      },
      {
        id: '2',
        name: 'Meditation',
        completed: false,
        streak: 3,
      },
      {
        id: '3',
        name: 'Healthy Eating',
        completed: true,
        streak: 7,
      },
    ],
  });
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    type: 'message' | 'reaction';
    sender: 'me' | 'partner';
    timestamp: string;
  }>>([
    {
      id: '1',
      text: "Great job on your workout! 💪",
      type: 'message',
      sender: 'partner',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '2',
      text: "Thanks! You're crushing it too! 🔥",
      type: 'message',
      sender: 'me',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    Alert.alert(
      'Invitation Sent',
      'We\'ll notify you when your partner accepts the invitation.',
      [
        {
          text: 'OK',
          onPress: () => setShowInvite(false),
        },
      ]
    );
  };

  const sendQuickMessage = (message: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text: message,
      type: 'message' as const,
      sender: 'me' as const,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendReaction = (reaction: string) => {
    const newMessage = {
      id: Date.now().toString(),
      text: reaction,
      type: 'reaction' as const,
      sender: 'me' as const,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  if (preview) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Accountability Partner</Text>
          <Pressable
            style={styles.viewAllButton}
            onPress={() => router.push('/accountability')}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.primary.dark} />
          </Pressable>
        </View>

        {partner ? (
          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={styles.partnerPreviewCard}>
              <View style={styles.partnerHeader}>
                <View style={styles.partnerInfo}>
                  <View style={styles.partnerAvatar}>
                    <Text style={styles.partnerInitials}>
                      {partner.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                   </View>
                  <View>
                    <Text style={styles.partnerName}>{partner.name}</Text>
                    <View style={styles.streakBadge}>
                      <Ionicons name="flame" size={16} color={colors.accent.coral} />
                      <Text style={styles.streakText}>{partner.streak} day streak</Text>
                    </View>
                  </View>
                </View>
                <BlurView intensity={80} style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                    {partner.lastCheckIn ? 'Checked In' : 'Not Checked In'}
                  </Text>
                </BlurView>
              </View>

              <View style={styles.partnerHabits}>
                {partner.habits.slice(0, 2).map((habit) => (
                  <View key={habit.id} style={styles.habitPreview}>
                    <Ionicons
                      name={habit.completed ? "checkmark-circle" : "timer-outline"}
                      size={20}
                      color={habit.completed ? colors.semantic.success : colors.gray[400]}
                    />
                    <Text style={styles.habitPreviewText}>{habit.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyStateText}>No Partner Yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Find an accountability partner to stay motivated
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Accountability Partner</Text>
        {!partner && (
          <Pressable
            style={styles.inviteButton}
            onPress={() => setShowInvite(true)}
          >
            <Ionicons name="person-add" size={20} color={colors.primary.dark} />
            <Text style={styles.inviteButtonText}>Find Partner</Text>
          </Pressable>
        )}
      </View>

      {partner ? (
        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.partnerCard}>
            <View style={styles.partnerHeader}>
              <View style={styles.partnerInfo}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerInitials}>
                    {partner.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={16} color={colors.accent.coral} />
                    <Text style={styles.streakText}>{partner.streak} day streak</Text>
                  </View>
                </View>
              </View>
              <BlurView intensity={80} style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {partner.lastCheckIn ? 'Checked In' : 'Not Checked In'}
                </Text>
              </BlurView>
            </View>

            <View style={styles.partnerHabits}>
              <Text style={styles.habitsTitle}>Partner's Habits</Text>
              {partner.habits.map((habit) => (
                <View key={habit.id} style={styles.habitItem}>
                  <View style={styles.habitStatus}>
                    <Ionicons
                      name={habit.completed ? "checkmark-circle" : "timer-outline"}
                      size={24}
                      color={habit.completed ? colors.semantic.success : colors.gray[400]}
                    />
                    <Text style={styles.habitName}>{habit.name}</Text>
                  </View>
                  <View style={styles.habitStreak}>
                    <Ionicons name="flame" size={16} color={colors.accent.coral} />
                    <Text style={styles.habitStreakText}>{habit.streak} days</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.reactionSection}>
              <Text style={styles.reactionTitle}>Quick Reactions</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.reactionScroll}
              >
                {QUICK_REACTIONS.map((reaction) => (
                  <Pressable
                    key={reaction}
                    style={styles.reactionButton}
                    onPress={() => sendReaction(reaction)}
                  >
                    <Text style={styles.reactionText}>{reaction}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.quickActions}>
              <Text style={styles.quickActionsTitle}>Motivational Messages</Text>
              <View style={styles.messageButtons}>
                {MOTIVATIONAL_MESSAGES.slice(0, 3).map((message, index) => (
                  <Pressable
                    key={index}
                    style={styles.messageButton}
                    onPress={() => sendQuickMessage(message)}
                  >
                    <Text style={styles.messageButtonText}>{message}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.chatSection}>
              <Text style={styles.chatTitle}>Recent Messages</Text>
              <ScrollView style={styles.chatMessages}>
                {messages.map((msg) => (
                  <View 
                    key={msg.id}
                    style={[
                      styles.messageContainer,
                      msg.sender === 'me' ? styles.myMessage : styles.partnerMessage
                    ]}
                  >
                    {msg.type === 'reaction' ? (
                      <Text style={styles.reactionMessage}>{msg.text}</Text>
                    ) : (
                      <Text style={[
                        styles.messageText,
                        msg.sender === 'me' ? styles.myMessageText : styles.partnerMessageText
                      ]}>{msg.text}</Text>
                    )}
                    <Text style={styles.messageTime}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.chatInput}>
                <TextInput
                  style={styles.messageInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.gray[400]}
                />
                <Pressable
                  style={styles.sendButton}
                  onPress={() => {
                    if (message.trim()) {
                      sendQuickMessage(message);
                      setMessage('');
                    }
                  }}
                >
                  <Ionicons name="send" size={20} color={colors.primary.light} />
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="people" size={48} color={colors.gray[300]} />
          <Text style={styles.emptyStateText}>No Partner Yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Find an accountability partner to stay motivated and achieve your goals together
          </Text>
        </View>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <BlurView intensity={80} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Find a Partner</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowInvite(false)}
              >
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Enter your partner's email</Text>
              <TextInput
                style={styles.input}
                value={inviteEmail}
                onChangeText={setInviteEmail}
                placeholder="partner@example.com"
                placeholderTextColor={colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.modalHelp}>
                We'll send them an invitation to join you as an accountability partner
              </Text>
              <Pressable
                style={styles.sendInviteButton}
                onPress={handleInvite}
              >
                <Text style={styles.sendInviteButtonText}>Send Invitation</Text>
              </Pressable>
            </View>
          </View>
        </BlurView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewAllText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  inviteButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  partnerCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  partnerPreviewCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  partnerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerInitials: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.light,
  },
  partnerName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  streakText: {
    fontSize: typography.size.sm,
    color: colors.accent.coral,
    fontWeight: typography.weight.medium as any,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success + '20',
  },
  statusText: {
    fontSize: typography.size.sm,
    color: colors.semantic.success,
    fontWeight: typography.weight.medium as any,
  },
  partnerHabits: {
    marginTop: spacing.md,
  },
  habitsTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  habitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  habitName: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  habitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  habitStreakText: {
    fontSize: typography.size.sm,
    color: colors.accent.coral,
  },
  habitPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  habitPreviewText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  reactionSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  reactionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  reactionScroll: {
    marginBottom: spacing.sm,
  },
  reactionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  reactionText: {
    fontSize: typography.size.lg,
  },
  quickActions: {
    marginTop: spacing.md,
  },
  quickActionsTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  messageButtons: {
    gap: spacing.sm,
  },
  messageButton: {
    backgroundColor: colors.gray[100],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  messageButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  chatSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  chatTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  chatMessages: {
    maxHeight: 200,
  },
  messageContainer: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  partnerMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: typography.size.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  myMessageText: {
    backgroundColor: colors.primary.dark,
    color: colors.primary.light,
  },
  partnerMessageText: {
    backgroundColor: colors.gray[100],
    color: colors.primary.dark,
  },
  reactionMessage: {
    fontSize: typography.size.xl,
    textAlign: 'center',
  },
  messageTime: {
    fontSize: typography.size.xs,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  chatInput: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  messageInput: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  emptyStateText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  emptyStateSubtext: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  closeButton: {
    padding: spacing.sm,
  },
  modalBody: {
    padding: spacing.md,
  },
  modalLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  modalHelp: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  sendInviteButton: {
    backgroundColor: colors.primary.dark,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  sendInviteButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
  },
});