import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { getTrainerSessions } from '@/utils/firebase';
type ViewMode = 'day' | 'week' | 'month';
type Session = {
  id: string;
  title: string;
  type: 'group' | 'personal' | 'online';
  startTime: string;
  endTime: string;
  location?: {
    name: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  client?: {
    name: string;
    avatar?: string;
  };
  squad?: {
    name: string;
    memberCount: number;
  };
  isPrimeTime: boolean;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled';
};

const PRIME_TIME_SLOTS = [
  { start: '06:00', end: '09:00' },
  { start: '17:00', end: '20:00' },
];

const SESSION_TYPES = {
  group: {
    color: colors.semantic.info,
    icon: 'people',
  },
  personal: {
    color: colors.semantic.success,
    icon: 'person',
  },
  online: {
    color: colors.accent.mint,
    icon: 'videocam',
  },
};

export default function Schedule() {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [selectedDate, viewMode]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      let startDate, endDate;

      switch (viewMode) {
        case 'day':
          startDate = selectedDate;
          endDate = selectedDate;
          break;
        case 'week':
          startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
          endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
          break;
        case 'month':
          startDate = startOfMonth(selectedDate);
          endDate = endOfMonth(selectedDate);
          break;
      }

      const data = await getTrainerSessions(startDate, endDate);
      console.log('Fetched sessions:', data);

      // Transform data
      const formattedSessions = data?.map(session => ({
        id: session.id,
        title: session.title,
        type: session.squad ? 'group' : session.client ? 'personal' : 'online',
        startTime: session.start_time,
        // endTime: new Date(new Date(session.scheduled_time).getTime() + parseDuration(session.duration)).toISOString(),
        location: session.location ? {
          name: session.location.name,
          address: session.location.address,
          coordinates: session.location.coordinates,
        } : undefined,
        client: session.client ? {
          name: session.client.display_name,
        } : undefined,
        squad: session.squad ? {
          name: session.squad.name,
          memberCount: session.squad.member_count?.count || 0,
        } : undefined,
        isPrimeTime: session.is_prime_time,
        price: session.price,
        status: session.status,
      }));

      setSessions(formattedSessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const isPrimeTimeSlot = (date: Date) => {
    const time = format(date, 'HH:mm');
    return PRIME_TIME_SLOTS.some(slot => 
      time >= slot.start && time <= slot.end
    );
  };

  const calculateSessionPrice = (session: any) => {
    let basePrice = session.squad ? 2500 : 5000; // Group vs Personal training
    
    // Prime time surcharge
    if (isPrimeTimeSlot(new Date(session.scheduled_time))) {
      basePrice *= 1.2; // 20% surcharge
    }
    
    // Location surcharge (if applicable)
    if (session.location?.premium) {
      basePrice *= 1.1; // 10% surcharge
    }
    
    return basePrice;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(prev => 
          direction === 'next' 
            ? new Date(prev.setDate(prev.getDate() + 1))
            : new Date(prev.setDate(prev.getDate() - 1))
        );
        break;
      case 'week':
        setSelectedDate(prev => 
          direction === 'next' 
            ? addWeeks(prev, 1)
            : subWeeks(prev, 1)
        );
        break;
      case 'month':
        setSelectedDate(prev => 
          direction === 'next' 
            ? addMonths(prev, 1)
            : subMonths(prev, 1)
        );
        break;
    }
  };

  const renderDateHeader = () => {
    let dateText = '';
    switch (viewMode) {
      case 'day':
        dateText = format(selectedDate, 'MMMM d, yyyy');
        break;
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
        dateText = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
        break;
      case 'month':
        dateText = format(selectedDate, 'MMMM yyyy');
        break;
    }

    return (
      <View style={styles.dateHeader}>
        <Pressable 
          style={styles.dateNavButton}
          onPress={() => navigateDate('prev')}
        >
          <Ionicons name="chevron-back" size={24} color={colors.primary.light} />
        </Pressable>
        <Text style={styles.dateText}>{dateText}</Text>
        <Pressable 
          style={styles.dateNavButton}
          onPress={() => navigateDate('next')}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.primary.light} />
        </Pressable>
      </View>
    );
  };

  const renderDayView = () => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(6, 0, 0, 0); // Start at 6 AM
    
    const timeSlots = Array.from({ length: 32 }, (_, i) => { // 16 hours * 2 (30-min slots)
      const slotTime = new Date(dayStart);
      slotTime.setMinutes(slotTime.getMinutes() + (i * 30));
      return slotTime;
    });

    return (
      <ScrollView style={styles.dayView}>
        {timeSlots.map((time, index) => {
          const slotSessions = sessions.filter(session => {
            const sessionStart = new Date(session.startTime);
            return format(sessionStart, 'HH:mm') === format(time, 'HH:mm');
          });

          const isPrime = isPrimeTimeSlot(time);

          return (
            <View 
              key={index}
              style={[
                styles.timeSlot,
                isPrime && styles.primeTimeSlot
              ]}
            >
              <View style={styles.timeLabel}>
                {time.getMinutes() === 0 && (
                  <Text style={styles.timeLabelText}>
                    {format(time, 'h:mm a')}
                  </Text>
                )}
              </View>
              <View style={styles.slotContent}>
                {slotSessions.map(session => (
                  <Pressable
                    key={session.id}
                    style={[
                      styles.sessionCard,
                      { backgroundColor: SESSION_TYPES[session.type].color + '20' }
                    ]}
                    onPress={() => router.push(`/trainer/sessions/${session.id}`)}
                  >
                    <View style={styles.sessionHeader}>
                      <View style={styles.sessionType}>
                        
                        <Text style={[
                          styles.sessionTypeText,
                          { color: SESSION_TYPES[session.type].color }
                        ]}>
                          {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
                        </Text>
                      </View>
                      {session.isPrimeTime && (
                        <BlurView intensity={80} style={styles.primeTimeBadge}>
                          <Ionicons name="star" size={12} color={colors.semantic.warning} />
                          <Text style={styles.primeTimeText}>Prime</Text>
                        </BlurView>
                      )}
                    </View>

                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    
                    <View style={styles.sessionDetails}>
                      <View style={styles.sessionTime}>
                        <Ionicons name="time" size={14} color={colors.gray[500]} />
                        <Text style={styles.sessionTimeText}>
                          {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                        </Text>
                      </View>

                      {session.location && (
                        <View style={styles.sessionLocation}>
                          <Ionicons name="location" size={14} color={colors.gray[500]} />
                          <Text style={styles.sessionLocationText}>
                            {session.location.name}
                          </Text>
                        </View>
                      )}

                      {session.type === 'personal' && session.client && (
                        <View style={styles.clientInfo}>
                          <Ionicons name="person" size={14} color={colors.gray[500]} />
                          <Text style={styles.clientName}>{session.client.name}</Text>
                        </View>
                      )}

                      {session.type === 'group' && session.squad && (
                        <View style={styles.squadInfo}>
                          <Ionicons name="people" size={14} color={colors.gray[500]} />
                          <Text style={styles.squadText}>
                            {session.squad.name} ({session.squad.memberCount} members)
                          </Text>
                        </View>
                      )}

                      <View style={styles.sessionPrice}>
                        <Ionicons name="cash" size={14} color={colors.semantic.success} />
                        <Text style={styles.priceText}>₹{session.price}</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
    });

    return (
      <ScrollView style={styles.weekView}>
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDay}>
              <Text style={styles.weekDayName}>{format(day, 'EEE')}</Text>
              <Text style={[
                styles.weekDayNumber,
                isSameDay(day, new Date()) && styles.currentDay
              ]}>{format(day, 'd')}</Text>
            </View>
          ))}
        </View>

        <View style={styles.weekSessions}>
          {weekDays.map((day, index) => {
            const daySessions = sessions.filter(session => 
              isSameDay(new Date(session.startTime), day)
            );

            return (
              <View key={index} style={styles.weekDayColumn}>
                {daySessions.map((session, sessionIndex) => (
                  <Animated.View
                    key={session.id}
                    entering={FadeInUp.delay(sessionIndex * 100)}
                  >
                    <Pressable
                      style={[
                        styles.weekSessionCard,
                        { backgroundColor: SESSION_TYPES[session.type].color + '20' }
                      ]}
                      onPress={() => router.push(`/trainer/sessions/${session.id}`)}
                    >
                      <View style={styles.weekSessionHeader}>
                        <View style={styles.sessionType}>
                          
                          <Text style={styles.weekSessionTime}>
                            {format(new Date(session.startTime), 'h:mm a')}
                          </Text>
                        </View>
                        {session.isPrimeTime && (
                          <Ionicons name="star" size={14} color={colors.semantic.warning} />
                        )}
                      </View>
                      <Text style={styles.weekSessionTitle}>{session.title}</Text>
                      {session.location && (
                        <Text style={styles.weekSessionLocation}>
                          {session.location.name}
                        </Text>
                      )}
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <View style={styles.monthView}>
        <View style={styles.monthHeader}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <Text key={day} style={styles.monthDayName}>{day}</Text>
          ))}
        </View>

        <View style={styles.monthGrid}>
          {monthDays.map((day, index) => {
            const daySessions = sessions.filter(session => 
              isSameDay(new Date(session.startTime), day)
            );

            return (
              <Pressable
                key={index}
                style={[
                  styles.monthDay,
                  isSameDay(day, new Date()) && styles.currentMonthDay
                ]}
                onPress={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
              >
                <Text style={[
                  styles.monthDayNumber,
                  isSameDay(day, new Date()) && styles.currentMonthDayText
                ]}>{format(day, 'd')}</Text>
                
                {daySessions.length > 0 && (
                  <View style={styles.monthDaySessions}>
                    {daySessions.slice(0, 3).map((session, i) => (
                      <View
                        key={i}
                        style={[
                          styles.monthSessionDot,
                          { backgroundColor: SESSION_TYPES[session.type].color }
                        ]}
                      />
                    ))}
                    {daySessions.length > 3 && (
                      <Text style={styles.monthMoreSessions}>
                        +{daySessions.length - 3}
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </Pressable>
        <Text style={styles.title}>Schedule</Text>
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('./locations', {relativeToDirectory: true})}
          >
            <Ionicons name="location" size={24} color={colors.primary.dark} />
          </Pressable>
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('./analytics', {relativeToDirectory: true})}
          >
            <Ionicons name="stats-chart" size={24} color={colors.primary.dark} />
          </Pressable>
          <Pressable 
            style={styles.createButton}
            onPress={() => router.push('/trainer/sessions/create')}
          >
            <Text style={styles.createButtonText}>New Session</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.viewSelector}>
        <Pressable
          style={[styles.viewOption, viewMode === 'day' && styles.activeViewOption]}
          onPress={() => setViewMode('day')}
        >
          <Text style={[
            styles.viewOptionText,
            viewMode === 'day' && styles.activeViewOptionText
          ]}>Day</Text>
        </Pressable>
        <Pressable
          style={[styles.viewOption, viewMode === 'week' && styles.activeViewOption]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[
            styles.viewOptionText,
            viewMode === 'week' && styles.activeViewOptionText
          ]}>Week</Text>
        </Pressable>
        <Pressable
          style={[styles.viewOption, viewMode === 'month' && styles.activeViewOption]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[
            styles.viewOptionText,
            viewMode === 'month' && styles.activeViewOptionText
          ]}>Month</Text>
        </Pressable>
      </View>

      {renderDateHeader()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading schedule...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
      )}
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
    padding: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.xl * 2 : spacing.xl,
    backgroundColor: "#060712",
    borderBottomWidth: 1,
    borderBottomColor: "#21262F",
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold as any,
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  createButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  viewSelector: {
    flexDirection: 'row',
    padding: spacing.sm,
    backgroundColor: "#21262F",
    margin: spacing.md,
    borderRadius: borderRadius.full,
  },
  viewOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.full,
  },
  activeViewOption: {
    backgroundColor: "#4F46E5",
    ...shadows.sm,
  },
  viewOptionText: {
    fontSize: typography.size.sm,
    color: "#9AAABD",
    fontWeight: typography.weight.medium as any,
  },
  activeViewOptionText: {
    color: "#FFFFFF",
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  dateNavButton: {
    padding: spacing.sm,
  },
  dateText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: "#FFFFFF",
  },
  dayView: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#21262F",
  },
  primeTimeSlot: {
    backgroundColor: "rgba(255, 193, 7, 0.08)",
  },
  timeLabel: {
    width: 80,
    paddingHorizontal: spacing.sm,
    justifyContent: 'flex-start',
    paddingTop: spacing.xs,
  },
  timeLabelText: {
    fontSize: typography.size.sm,
    color: "#9AAABD",
  },
  slotContent: {
    flex: 1,
    padding: spacing.xs,
  },
  sessionCard: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sessionType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionTypeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  primeTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: "rgba(255, 193, 7, 0.2)",
  },
  primeTimeText: {
    fontSize: typography.size.xs,
    color: "#FFC107",
    fontWeight: typography.weight.medium as any,
  },
  sessionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold as any,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  sessionDetails: {
    gap: spacing.xs,
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionTimeText: {
    fontSize: typography.size.xs,
    color: "#9AAABD",
  },
  sessionLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionLocationText: {
    fontSize: typography.size.xs,
    color: "#9AAABD",
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  clientName: {
    fontSize: typography.size.xs,
    color: "#9AAABD",
  },
  squadInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  squadText: {
    fontSize: typography.size.xs,
    color: "#9AAABD",
  },
  sessionPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  priceText: {
    fontSize: typography.size.xs,
    color: "#22C55E",
    fontWeight: typography.weight.medium as any,
  },
  weekView: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayName: {
    fontSize: typography.size.sm,
    color: "#9AAABD",
    marginBottom: spacing.xs,
  },
  weekDayNumber: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: "#FFFFFF",
  },
  currentDay: {
    color: "#22C55E",
  },
  weekSessions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  weekDayColumn: {
    flex: 1,
    gap: spacing.sm,
  },
  weekSessionCard: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  weekSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  weekSessionTime: {
    fontSize: typography.size.xs,
    color: "#FFFFFF",
    marginLeft: spacing.xs,
  },
  weekSessionTitle: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
    color: "#FFFFFF",
    marginBottom: spacing.xs,
  },
  weekSessionLocation: {
    fontSize: typography.size.xs,
    color: "#9AAABD",
  },
  monthView: {
    flex: 1,
    padding: spacing.md,
  },
  monthHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  monthDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.size.sm,
    color: "#9AAABD",
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: "#21262F",
  },
  currentMonthDay: {
    backgroundColor: "#4F46E5",
  },
  monthDayNumber: {
    fontSize: typography.size.sm,
    color: "#FFFFFF",
  },
  currentMonthDayText: {
    color: "#FFFFFF",
  },
  monthDaySessions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  monthSessionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  monthMoreSessions: {
    fontSize: typography.size.xs,
    color: "#9AAABD",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.md,
    color: "#9AAABD",
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.md,
    color: "#EF4444",
    textAlign: 'center',
  },
});