import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { supabase } from '../../utils/supabase';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';

interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled' | 'refunded';
  payment_method: string | null;
  payment_date: string | null;
  due_date: string;
  description: string;
  invoice_number: string;
  service_type: string;
  user?: {
    display_name: string;
    email: string;
  };
}

type Filter = 'all' | 'pending' | 'completed' | 'overdue';
type SortField = 'due_date' | 'amount' | 'client';
type SortOrder = 'asc' | 'desc';

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'thisMonth' | 'lastMonth' | 'thisYear'>('all');
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    completedCount: 0,
    pendingCount: 0,
    overdueCount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          user:users(display_name, email)
        `)
        .order('due_date', { ascending: false });

      if (fetchError) throw fetchError;
      
      setPayments(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentData: Payment[]) => {
    const totalRevenue = paymentData
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingAmount = paymentData
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const overdueAmount = paymentData
      .filter(p => p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const completedCount = paymentData.filter(p => p.status === 'completed').length;
    const pendingCount = paymentData.filter(p => p.status === 'pending').length;
    const overdueCount = paymentData.filter(p => p.status === 'overdue').length;

    setStats({
      totalRevenue,
      pendingAmount,
      overdueAmount,
      completedCount,
      pendingCount,
      overdueCount,
    });
  };

  const handleSendReminder = async (paymentId: string) => {
    try {
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) return;

      Alert.alert(
        'Send Payment Reminder',
        `Send a reminder to ${payment.user?.display_name} for ${payment.currency} ${payment.amount}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Send',
            onPress: async () => {
              // In a real app, this would send an actual reminder
              Alert.alert('Success', 'Payment reminder sent successfully');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error sending reminder:', error);
      Alert.alert('Error', 'Failed to send reminder');
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          payment_date: new Date().toISOString(),
          payment_method: 'Cash', // Default to cash for manual payments
        })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Update local state
      setPayments(prev => 
        prev.map(p => 
          p.id === paymentId 
            ? { 
                ...p, 
                status: 'completed', 
                payment_date: new Date().toISOString(),
                payment_method: 'Cash'
              } 
            : p
        )
      );

      // Recalculate stats
      calculateStats(payments.map(p => 
        p.id === paymentId 
          ? { 
              ...p, 
              status: 'completed', 
              payment_date: new Date().toISOString(),
              payment_method: 'Cash'
            } 
          : p
      ));

      Alert.alert('Success', 'Payment marked as completed');
    } catch (error) {
      console.error('Error updating payment:', error);
      Alert.alert('Error', 'Failed to update payment');
    }
  };

  const handleBulkAction = (action: 'remind' | 'markPaid' | 'delete') => {
    if (selectedPayments.length === 0) {
      Alert.alert('No Payments Selected', 'Please select at least one payment to perform this action.');
      return;
    }

    switch (action) {
      case 'remind':
        Alert.alert(
          'Send Reminders',
          `Send reminders for ${selectedPayments.length} payments?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Send',
              onPress: () => {
                // In a real app, this would send actual reminders
                Alert.alert('Success', `Reminders sent for ${selectedPayments.length} payments`);
                setSelectedPayments([]);
              },
            },
          ]
        );
        break;
      
      case 'markPaid':
        Alert.alert(
          'Mark as Paid',
          `Mark ${selectedPayments.length} payments as paid?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Mark as Paid',
              onPress: async () => {
                try {
                  const { error: updateError } = await supabase
                    .from('payments')
                    .update({
                      status: 'completed',
                      payment_date: new Date().toISOString(),
                      payment_method: 'Cash',
                    })
                    .in('id', selectedPayments);

                  if (updateError) throw updateError;

                  // Update local state
                  setPayments(prev => 
                    prev.map(p => 
                      selectedPayments.includes(p.id)
                        ? { 
                            ...p, 
                            status: 'completed', 
                            payment_date: new Date().toISOString(),
                            payment_method: 'Cash'
                          } 
                        : p
                    )
                  );

                  // Recalculate stats
                  calculateStats(payments.map(p => 
                    selectedPayments.includes(p.id)
                      ? { 
                          ...p, 
                          status: 'completed', 
                          payment_date: new Date().toISOString(),
                          payment_method: 'Cash'
                        } 
                      : p
                  ));

                  Alert.alert('Success', `${selectedPayments.length} payments marked as completed`);
                  setSelectedPayments([]);
                } catch (error) {
                  console.error('Error updating payments:', error);
                  Alert.alert('Error', 'Failed to update payments');
                }
              },
            },
          ]
        );
        break;
      
      case 'delete':
        Alert.alert(
          'Delete Payments',
          `Are you sure you want to delete ${selectedPayments.length} payments? This action cannot be undone.`,
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
                  const { error: deleteError } = await supabase
                    .from('payments')
                    .delete()
                    .in('id', selectedPayments);

                  if (deleteError) throw deleteError;

                  // Update local state
                  const updatedPayments = payments.filter(p => !selectedPayments.includes(p.id));
                  setPayments(updatedPayments);
                  calculateStats(updatedPayments);

                  Alert.alert('Success', `${selectedPayments.length} payments deleted`);
                  setSelectedPayments([]);
                } catch (error) {
                  console.error('Error deleting payments:', error);
                  Alert.alert('Error', 'Failed to delete payments');
                }
              },
            },
          ]
        );
        break;
    }
  };

  const togglePaymentSelection = (paymentId: string) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const toggleAllPayments = () => {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(filteredPayments.map(p => p.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#22C55E';
      case 'pending':
        return '#F59E0B';
      case 'overdue':
        return '#EF4444';
      case 'cancelled':
        return '#64748B';
      case 'refunded':
        return '#6366F1';
      default:
        return '#64748B';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Apply filters
  let filteredPayments = [...payments];

  // Status filter
  if (filter !== 'all') {
    filteredPayments = filteredPayments.filter(p => p.status === filter);
  }

  // Date filter
  if (dateFilter !== 'all') {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const thisYear = new Date(now.getFullYear(), 0, 1);

    filteredPayments = filteredPayments.filter(p => {
      const paymentDate = p.payment_date ? new Date(p.payment_date) : null;
      const dueDate = new Date(p.due_date);
      
      switch (dateFilter) {
        case 'thisMonth':
          return (paymentDate && paymentDate >= thisMonth) || 
                 (dueDate >= thisMonth);
        case 'lastMonth':
          return (paymentDate && paymentDate >= lastMonth && paymentDate < thisMonth) || 
                 (dueDate >= lastMonth && dueDate < thisMonth);
        case 'thisYear':
          return (paymentDate && paymentDate >= thisYear) || 
                 (dueDate >= thisYear);
        default:
          return true;
      }
    });
  }

  // Search filter
  if (searchQuery) {
    filteredPayments = filteredPayments.filter(p => 
      p.user?.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  filteredPayments.sort((a, b) => {
    if (sortField === 'due_date') {
      return sortOrder === 'asc' 
        ? new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        : new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
    } else if (sortField === 'amount') {
      return sortOrder === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortField === 'client') {
      const nameA = a.user?.display_name || '';
      const nameB = b.user?.display_name || '';
      return sortOrder === 'asc' 
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    }
    return 0;
  });

  // Chart data
  const monthlyRevenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [
          payments.filter(p => p.status === 'completed' && p.payment_date?.includes('2025-01')).reduce((sum, p) => sum + p.amount, 0),
          payments.filter(p => p.status === 'completed' && p.payment_date?.includes('2025-02')).reduce((sum, p) => sum + p.amount, 0),
          payments.filter(p => p.status === 'completed' && p.payment_date?.includes('2025-03')).reduce((sum, p) => sum + p.amount, 0),
          payments.filter(p => p.status === 'completed' && p.payment_date?.includes('2025-04')).reduce((sum, p) => sum + p.amount, 0),
          payments.filter(p => p.status === 'completed' && p.payment_date?.includes('2025-05')).reduce((sum, p) => sum + p.amount, 0),
          payments.filter(p => p.status === 'completed' && p.payment_date?.includes('2025-06')).reduce((sum, p) => sum + p.amount, 0),
        ],
      },
    ],
  };

  const paymentMethodData = {
    labels: ['UPI', 'Bank', 'Cash', 'Card', 'Other'],
    datasets: [
      {
        data: [
          payments.filter(p => p.payment_method === 'UPI').length,
          payments.filter(p => p.payment_method === 'Bank Transfer').length,
          payments.filter(p => p.payment_method === 'Cash').length,
          payments.filter(p => p.payment_method?.includes('Card')).length,
          payments.filter(p => p.payment_method && !['UPI', 'Bank Transfer', 'Cash'].includes(p.payment_method) && !p.payment_method.includes('Card')).length,
        ],
      },
    ],
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Payment Management</Text>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.createButton}
            onPress={() => router.push('/trainer-dashboard/payments/pricing')}
          >
            <Text style={styles.createButtonText}>Pricing</Text>
          </Pressable>
          <Pressable 
            style={styles.createButton}
            onPress={() => router.push('/trainer-dashboard/payments/create')}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.dashboardSection}>
          <View style={styles.dashboardHeader}>
            <Text style={styles.dashboardTitle}>Financial Dashboard</Text>
            <Pressable 
              style={styles.analyticsButton}
              onPress={() => router.push('/trainer-dashboard/payments/analytics')}
            >
              <Ionicons name="stats-chart" size={16} color="#4F46E5" />
              <Text style={styles.analyticsButtonText}>Full Analytics</Text>
            </Pressable>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.statsContainer}
          >
            <Animated.View entering={FadeInUp.delay(100)}>
              <View style={[styles.statCard, { backgroundColor: '#E8FFE1' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="cash" size={24} color="#22C55E" />
                  <Text style={styles.statTitle}>Total Revenue</Text>
                </View>
                <Text style={[styles.statValue, { color: '#22C55E' }]}>
                  {formatCurrency(stats.totalRevenue)}
                </Text>
                <Text style={styles.statSubtext}>{stats.completedCount} payments</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200)}>
              <View style={[styles.statCard, { backgroundColor: '#FFF7E1' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="time" size={24} color="#F59E0B" />
                  <Text style={styles.statTitle}>Pending</Text>
                </View>
                <Text style={[styles.statValue, { color: '#F59E0B' }]}>
                  {formatCurrency(stats.pendingAmount)}
                </Text>
                <Text style={styles.statSubtext}>{stats.pendingCount} payments</Text>
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300)}>
              <View style={[styles.statCard, { backgroundColor: '#FFE1E1' }]}>
                <View style={styles.statHeader}>
                  <Ionicons name="alert-circle" size={24} color="#EF4444" />
                  <Text style={styles.statTitle}>Overdue</Text>
                </View>
                <Text style={[styles.statValue, { color: '#EF4444' }]}>
                  {formatCurrency(stats.overdueAmount)}
                </Text>
                <Text style={styles.statSubtext}>{stats.overdueCount} payments</Text>
              </View>
            </Animated.View>
          </ScrollView>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Monthly Revenue</Text>
            <LineChart
              data={monthlyRevenueData}
              width={Dimensions.get('window').width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#4F46E5',
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Payment Methods</Text>
            <BarChart
              data={paymentMethodData}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                barPercentage: 0.5,
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/trainer-dashboard/payments/reminders')}
          >
            <Ionicons name="notifications" size={16} color="#4F46E5" />
            <Text style={styles.actionButtonText}>Reminders</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/trainer-dashboard/payments/templates')}
          >
            <Ionicons name="document-text" size={16} color="#4F46E5" />
            <Text style={styles.actionButtonText}>Templates</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/trainer-dashboard/payments/export')}
          >
            <Ionicons name="download" size={16} color="#4F46E5" />
            <Text style={styles.actionButtonText}>Export</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/trainer-dashboard/payments/settings')}
          >
            <Ionicons name="settings" size={16} color="#4F46E5" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search payments"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#64748B"
            />
          </View>
        </View>

        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <Pressable
              style={[
                styles.filterChip,
                filter === 'all' && styles.selectedFilter
              ]}
              onPress={() => setFilter('all')}
            >
              <Text style={[
                styles.filterText,
                filter === 'all' && styles.selectedFilterText
              ]}>All</Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterChip,
                filter === 'pending' && styles.selectedFilter
              ]}
              onPress={() => setFilter('pending')}
            >
              <Text style={[
                styles.filterText,
                filter === 'pending' && styles.selectedFilterText
              ]}>Pending</Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterChip,
                filter === 'completed' && styles.selectedFilter
              ]}
              onPress={() => setFilter('completed')}
            >
              <Text style={[
                styles.filterText,
                filter === 'completed' && styles.selectedFilterText
              ]}>Completed</Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterChip,
                filter === 'overdue' && styles.selectedFilter
              ]}
              onPress={() => setFilter('overdue')}
            >
              <Text style={[
                styles.filterText,
                filter === 'overdue' && styles.selectedFilterText
              ]}>Overdue</Text>
            </Pressable>
          </ScrollView>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <Pressable
              style={[
                styles.filterChip,
                dateFilter === 'all' && styles.selectedFilter
              ]}
              onPress={() => setDateFilter('all')}
            >
              <Text style={[
                styles.filterText,
                dateFilter === 'all' && styles.selectedFilterText
              ]}>All Time</Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterChip,
                dateFilter === 'thisMonth' && styles.selectedFilter
              ]}
              onPress={() => setDateFilter('thisMonth')}
            >
              <Text style={[
                styles.filterText,
                dateFilter === 'thisMonth' && styles.selectedFilterText
              ]}>This Month</Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterChip,
                dateFilter === 'lastMonth' && styles.selectedFilter
              ]}
              onPress={() => setDateFilter('lastMonth')}
            >
              <Text style={[
                styles.filterText,
                dateFilter === 'lastMonth' && styles.selectedFilterText
              ]}>Last Month</Text>
            </Pressable>
            <Pressable
              style={[
                styles.filterChip,
                dateFilter === 'thisYear' && styles.selectedFilter
              ]}
              onPress={() => setDateFilter('thisYear')}
            >
              <Text style={[
                styles.filterText,
                dateFilter === 'thisYear' && styles.selectedFilterText
              ]}>This Year</Text>
            </Pressable>
          </ScrollView>
        </View>

        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <Pressable
            style={styles.sortButton}
            onPress={() => {
              if (sortField === 'due_date') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField('due_date');
                setSortOrder('desc');
              }
            }}
          >
            <Text style={[
              styles.sortButtonText,
              sortField === 'due_date' && styles.activeSortButton
            ]}>Date</Text>
            {sortField === 'due_date' && (
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color={sortField === 'due_date' ? '#4F46E5' : '#64748B'} 
              />
            )}
          </Pressable>
          <Pressable
            style={styles.sortButton}
            onPress={() => {
              if (sortField === 'amount') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField('amount');
                setSortOrder('desc');
              }
            }}
          >
            <Text style={[
              styles.sortButtonText,
              sortField === 'amount' && styles.activeSortButton
            ]}>Amount</Text>
            {sortField === 'amount' && (
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color={sortField === 'amount' ? '#4F46E5' : '#64748B'} 
              />
            )}
          </Pressable>
          <Pressable
            style={styles.sortButton}
            onPress={() => {
              if (sortField === 'client') {
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              } else {
                setSortField('client');
                setSortOrder('asc');
              }
            }}
          >
            <Text style={[
              styles.sortButtonText,
              sortField === 'client' && styles.activeSortButton
            ]}>Client</Text>
            {sortField === 'client' && (
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color={sortField === 'client' ? '#4F46E5' : '#64748B'} 
              />
            )}
          </Pressable>
        </View>

        {selectedPayments.length > 0 && (
          <View style={styles.bulkActionBar}>
            <Text style={styles.selectedCount}>{selectedPayments.length} selected</Text>
            <View style={styles.bulkActions}>
              <Pressable 
                style={styles.bulkActionButton}
                onPress={() => handleBulkAction('remind')}
              >
                <Ionicons name="mail" size={16} color="#4F46E5" />
                <Text style={styles.bulkActionText}>Remind</Text>
              </Pressable>
              <Pressable 
                style={styles.bulkActionButton}
                onPress={() => handleBulkAction('markPaid')}
              >
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={styles.bulkActionText}>Mark Paid</Text>```typescript
              </Pressable>
              <Pressable 
                style={[styles.bulkActionButton, styles.deleteButton]}
                onPress={() => handleBulkAction('delete')}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
                <Text style={[styles.bulkActionText, styles.deleteText]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}

        {loading ? (
          <Text style={styles.loadingText}>Loading payments...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : filteredPayments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cash" size={48} color="#E2E8F0" />
            <Text style={styles.emptyText}>No payments found</Text>
            <Text style={styles.emptySubtext}>
              Create your first payment by clicking the "Create" button above.
            </Text>
            <Pressable 
              style={styles.createFirstButton}
              onPress={() => router.push('/trainer-dashboard/payments/create')}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createFirstButtonText}>Create First Payment</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.tableHeader}>
              <Pressable 
                style={styles.selectAllCheckbox}
                onPress={toggleAllPayments}
              >
                <Ionicons 
                  name={selectedPayments.length === filteredPayments.length ? "checkbox" : "square-outline"} 
                  size={20} 
                  color="#4F46E5" 
                />
              </Pressable>
              <Text style={[styles.tableHeaderText, { flex: 2 }]}>Client/Invoice</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Amount</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Due Date</Text>
              <Text style={[styles.tableHeaderText, { flex: 1 }]}>Status</Text>
              <Text style={[styles.tableHeaderText, { width: 50 }]}></Text>
            </View>

            {filteredPayments.map((payment, index) => (
              <Animated.View
                key={payment.id}
                entering={FadeInUp.delay(index * 50)}
              >
                <Pressable 
                  style={[
                    styles.paymentRow,
                    selectedPayments.includes(payment.id) && styles.selectedRow
                  ]}
                  onPress={() => router.push(`/trainer-dashboard/payments/${payment.id}`)}
                >
                  <Pressable 
                    style={styles.checkbox}
                    onPress={(e) => {
                      e.stopPropagation();
                      togglePaymentSelection(payment.id);
                    }}
                  >
                    <Ionicons 
                      name={selectedPayments.includes(payment.id) ? "checkbox" : "square-outline"} 
                      size={20} 
                      color="#4F46E5" 
                    />
                  </Pressable>
                  
                  <View style={{ flex: 2 }}>
                    <Text style={styles.clientName}>{payment.user?.display_name || 'Unknown Client'}</Text>
                    <Text style={styles.invoiceNumber}>{payment.invoice_number}</Text>
                  </View>
                  
                  <Text style={[styles.amount, { flex: 1 }]}>{formatCurrency(payment.amount, payment.currency)}</Text>
                  
                  <Text style={[styles.dueDate, { flex: 1 }]}>{formatDate(payment.due_date)}</Text>
                  
                  <View style={[styles.statusContainer, { flex: 1 }]}>
                    <BlurView intensity={80} style={[
                      styles.statusBadge, 
                      { backgroundColor: `${getStatusColor(payment.status)}20` }
                    ]}>
                      <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Text>
                    </BlurView>
                  </View>
                  
                  <View style={{ width: 50 }}>
                    <Pressable
                      style={styles.actionIcon}
                      onPress={(e) => {
                        e.stopPropagation();
                        if (payment.status === 'pending' || payment.status === 'overdue') {
                          handleMarkAsPaid(payment.id);
                        } else if (payment.status === 'completed') {
                          router.push(`/trainer-dashboard/payments/${payment.id}`);
                        }
                      }}
                    >
                      <Ionicons 
                        name={payment.status === 'pending' || payment.status === 'overdue' ? "checkmark-circle" : "chevron-forward"} 
                        size={24} 
                        color={payment.status === 'pending' || payment.status === 'overdue' ? "#22C55E" : "#64748B"} 
                      />
                    </Pressable>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </>
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
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
  content: {
    flex: 1,
  },
  dashboardSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F0FF',
    borderRadius: 20,
  },
  analyticsButtonText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    width: 180,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  chartContainer: {
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
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
  searchContainer: {
    padding: 16,
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
  filterSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  selectedFilter: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sortLabel: {
    fontSize: 14,
    color: '#64748B',
    marginRight: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  activeSortButton: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  bulkActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F0FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  selectedCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bulkActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  bulkActionText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FFF1F2',
  },
  deleteText: {
    color: '#EF4444',
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createFirstButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  selectAllCheckbox: {
    width: 40,
    alignItems: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  selectedRow: {
    backgroundColor: '#F0F0FF',
  },
  checkbox: {
    width: 40,
    alignItems: 'center',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#64748B',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  dueDate: {
    fontSize: 14,
    color: '#64748B',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionIcon: {
    padding: 4,
  },
});