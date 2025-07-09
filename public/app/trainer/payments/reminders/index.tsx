import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { supabase } from '@/utils/supabase';

interface Reminder {
  id: string;
  payment_id: string;
  reminder_date: string;
  status: 'pending' | 'sent' | 'cancelled';
  message: string;
  delivery_method: 'email' | 'sms' | 'whatsapp';
  sent_at: string | null;
  payment: {
    amount: number;
    currency: string;
    due_date: string;
    user: {
      display_name: string;
      email: string;
      phone_number: string;
    };
  };
}

export default function PaymentReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date(),
    time: new Date(),
    description: '',
    priority: 'medium',
    repeat: 'none',
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('payment_reminders')
        .select(`
          *,
          payment:payments(
            amount,
            currency,
            due_date,
            user:users(
              display_name,
              email,
              phone_number
            )
          )
        `)
        .order('reminder_date', { ascending: true });

      if (fetchError) throw fetchError;
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setError('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (reminder: Reminder) => {
    try {
      // Update reminder status
      const { error: updateError } = await supabase
        .from('payment_reminders')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', reminder.id);

      if (updateError) throw updateError;

      // Refresh reminders
      fetchReminders();

      // Show success message
      Alert.alert('Success', 'Reminder sent successfully');
    } catch (error) {
      console.error('Error sending reminder:', error);
      Alert.alert('Error', 'Failed to send reminder');
    }
  };

  const handleCancelReminder = async (reminder: Reminder) => {
    Alert.alert(
      'Cancel Reminder',
      'Are you sure you want to cancel this reminder?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error: updateError } = await supabase
                .from('payment_reminders')
                .update({
                  status: 'cancelled'
                })
                .eq('id', reminder.id);

              if (updateError) throw updateError;

              fetchReminders();
              Alert.alert('Success', 'Reminder cancelled');
            } catch (error) {
              console.error('Error cancelling reminder:', error);
              Alert.alert('Error', 'Failed to cancel reminder');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return colors.semantic.success;
      case 'pending':
        return colors.semantic.warning;
      case 'cancelled':
        return colors.semantic.error;
      default:
        return colors.gray[500];
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </Pressable>
        <Text style={styles.title}>Payment Reminders</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading reminders...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : reminders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Reminders</Text>
            <Text style={styles.emptyDescription}>
              Set up payment reminders to automatically notify clients about upcoming or overdue payments.
            </Text>
          </View>
        ) : (
          reminders.map((reminder, index) => (
            <Animated.View
              key={reminder.id}
              entering={FadeInUp.delay(index * 100)}
            >
              <View style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <View>
                    <Text style={styles.clientName}>
                      {reminder.payment.user.display_name}
                    </Text>
                    <Text style={styles.paymentAmount}>
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: reminder.payment.currency
                      }).format(reminder.payment.amount)}
                    </Text>
                  </View>
                  <BlurView intensity={80} style={[
                    styles.statusBadge,
                    { backgroundColor: `${getStatusColor(reminder.status)}20` }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(reminder.status) }
                    ]}>
                      {reminder.status.charAt(0).toUpperCase() + reminder.status.slice(1)}
                    </Text>
                  </BlurView>
                </View>

                <View style={styles.reminderDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>
                      Due: {formatDate(reminder.payment.due_date)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="notifications" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>
                      Reminder: {formatDate(reminder.reminder_date)}
                    </Text>
                  </View>
                  {reminder.sent_at && (
                    <View style={styles.detailItem}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.semantic.success} />
                      <Text style={styles.detailText}>
                        Sent: {formatDate(reminder.sent_at)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.reminderMessage}>
                  <Text style={styles.messageLabel}>Message:</Text>
                  <Text style={styles.messageText}>{reminder.message}</Text>
                </View>

                <View style={styles.deliveryMethod}>
                  <BlurView intensity={80} style={styles.methodBadge}>
                    <Ionicons 
                      name={
                        reminder.delivery_method === 'email' ? 'mail' :
                        reminder.delivery_method === 'sms' ? 'chatbubble' :
                        'logo-whatsapp'
                      } 
                      size={16} 
                      color={colors.primary.dark} 
                    />
                    <Text style={styles.methodText}>
                      {reminder.delivery_method.toUpperCase()}
                    </Text>
                  </BlurView>
                </View>

                {reminder.status === 'pending' && (
                  <View style={styles.reminderActions}>
                    <Pressable 
                      style={styles.sendButton}
                      onPress={() => handleSendReminder(reminder)}
                    >
                      <Ionicons name="send" size={16} color={colors.primary.light} />
                      <Text style={styles.sendButtonText}>Send Now</Text>
                    </Pressable>
                    <Pressable 
                      style={styles.cancelButton}
                      onPress={() => handleCancelReminder(reminder)}
                    >
                      <Ionicons name="close-circle" size={16} color={colors.semantic.error} />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>

      {/* Add Reminder Form Modal */}
      {showAddForm && (
        <BlurView intensity={80} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Reminder</Text>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setShowAddForm(false)}
              >
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Form fields will go here */}
              <Text>Form coming soon...</Text>
            </ScrollView>
          </View>
        </BlurView>
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
  content: {
    padding: spacing.md,
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
  },
  reminderCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  clientName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  paymentAmount: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold as any,
    color: colors.semantic.success,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
  },
  reminderDetails: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailText: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
  },
  reminderMessage: {
    marginBottom: spacing.md,
  },
  messageLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
  },
  deliveryMethod: {
    marginBottom: spacing.md,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    alignSelf: 'flex-start',
  },
  methodText: {
    fontSize: typography.size.xs,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  sendButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary.light,
    fontWeight: typography.weight.medium as any,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.semantic.error + '10',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  cancelButtonText: {
    fontSize: typography.size.sm,
    color: colors.semantic.error,
    fontWeight: typography.weight.medium as any,
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
    maxWidth: 500,
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
    maxHeight: '80%',
  },
});