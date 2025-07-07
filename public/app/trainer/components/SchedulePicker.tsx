import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface DaySchedule {
  day: string;
  hour: number;
  minute: number;
}

interface SchedulePickerProps {
  selectedDays: string[]; // Array of crontab schedules
  onSelectedDaysChange: (schedules: string[]) => void;
}

export default function SchedulePicker({ 
  selectedDays, 
  onSelectedDaysChange
}: SchedulePickerProps) {
  // Parse crontab schedules to DaySchedule objects for UI
  const parseCronSchedule = (cronString: string): DaySchedule | null => {
    try {
      // Parse cron format: "minute hour * * day"
      const parts = cronString.split(' ');
      if (parts.length === 5) {
        const minute = parseInt(parts[0]);
        const hour = parseInt(parts[1]);
        const day = parts[4];
        
        // Convert lowercase day to capitalized format
        const dayMap: { [key: string]: string } = {
          'mon': 'Mon',
          'tue': 'Tue',
          'wed': 'Wed',
          'thu': 'Thu',
          'fri': 'Fri',
          'sat': 'Sat',
          'sun': 'Sun'
        };
        
        const capitalizedDay = dayMap[day.toLowerCase()];
        if (capitalizedDay && !isNaN(minute) && !isNaN(hour)) {
          return { day: capitalizedDay, hour, minute };
        }
      }
    } catch (error) {
      console.error('Error parsing cron schedule:', error);
    }
    return null;
  };

  // Generate crontab schedule from DaySchedule object
  const generateCronSchedule = (daySchedule: DaySchedule): string => {
    const dayMap: { [key: string]: string } = {
      'Mon': 'mon',
      'Tue': 'tue', 
      'Wed': 'wed',
      'Thu': 'thu',
      'Fri': 'fri',
      'Sat': 'sat',
      'Sun': 'sun'
    };
    return `${daySchedule.minute} ${daySchedule.hour} * * ${dayMap[daySchedule.day]}`;
  };

  // Convert crontab schedules to DaySchedule objects for UI
  const getDaySchedules = (): DaySchedule[] => {
    const daySchedules: DaySchedule[] = [];
    selectedDays.forEach((cronString: string) => {
      const schedule = parseCronSchedule(cronString);
      if (schedule) {
        daySchedules.push(schedule);
      }
    });
    return daySchedules;
  };

  // Update the crontab schedules array
  const updateCronSchedules = (daySchedules: DaySchedule[]) => {
    const cronSchedules = daySchedules.map(generateCronSchedule);
    onSelectedDaysChange(cronSchedules);
  };

  const toggleDay = (day: string) => {
    const currentDaySchedules = getDaySchedules();
    const existingDay = currentDaySchedules.find(d => d.day === day);
    
    if (existingDay) {
      // Remove the day
      const updatedSchedules = currentDaySchedules.filter(d => d.day !== day);
      updateCronSchedules(updatedSchedules);
    } else {
      // Add the day with default time (9:00 AM)
      const newSchedule = { day, hour: 9, minute: 0 };
      const updatedSchedules = [...currentDaySchedules, newSchedule];
      updateCronSchedules(updatedSchedules);
    }
  };

  const updateDayTime = (day: string, hour: number, minute: number) => {
    const currentDaySchedules = getDaySchedules();
    const updatedSchedules = currentDaySchedules.map(d => 
      d.day === day ? { ...d, hour, minute } : d
    );
    updateCronSchedules(updatedSchedules);
  };

  const isDaySelected = (day: string) => {
    const daySchedules = getDaySchedules();
    return daySchedules.some(d => d.day === day);
  };

  const daySchedules = getDaySchedules();

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Schedule</Text>
      <Text style={styles.sectionSubtitle}>Select days and set times for squad sessions</Text>
      
      <View style={styles.daysGrid}>
        {WEEK_DAYS.map((day) => (
          <Pressable
            key={day}
            style={[
              styles.dayButton,
              isDaySelected(day) && styles.selectedDay
            ]}
            onPress={() => toggleDay(day)}
          >
            <Text style={[
              styles.dayText,
              isDaySelected(day) && styles.selectedDayText
            ]}>{day}</Text>
          </Pressable>
        ))}
      </View>

      {daySchedules.length > 0 && (
        <View style={styles.timeSelectionContainer}>
          <Text style={styles.timeSelectionTitle}>Session Times</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.dayHeader}>Day</Text>
            <Text style={styles.hourHeader}>Hour</Text>
            <Text style={styles.minuteHeader}>Minute</Text>
          </View>

          {/* Table Rows */}
          {daySchedules.map((daySchedule) => (
            <View key={daySchedule.day} style={styles.tableRow}>
              <Text style={styles.dayLabel}>{daySchedule.day}</Text>
              <TextInput
                style={styles.timeInput}
                value={daySchedule.hour.toString()}
                onChangeText={(text) => {
                  // Allow empty string for better UX
                  if (text === '') {
                    updateDayTime(daySchedule.day, 0, daySchedule.minute);
                    return;
                  }
                  
                  const hour = parseInt(text);
                  if (!isNaN(hour) && hour >= 0 && hour <= 23) {
                    updateDayTime(daySchedule.day, hour, daySchedule.minute);
                  }
                }}
                keyboardType="numeric"
                maxLength={2}
                placeholderTextColor="#94A3B8"
                placeholder="9"
                editable={true}
              />
              <TextInput
                style={styles.timeInput}
                value={daySchedule.minute.toString()}
                onChangeText={(text) => {
                  // Allow empty string for better UX
                  if (text === '') {
                    updateDayTime(daySchedule.day, daySchedule.hour, 0);
                    return;
                  }
                  
                  const minute = parseInt(text);
                  if (!isNaN(minute) && minute >= 0 && minute <= 59) {
                    updateDayTime(daySchedule.day, daySchedule.hour, minute);
                  }
                }}
                keyboardType="numeric"
                maxLength={2}
                placeholderTextColor="#94A3B8"
                placeholder="00"
                editable={true}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#21262F',
    borderWidth: 1,
    borderColor: '#374151',
  },
  selectedDay: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  dayText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  timeSelectionContainer: {
    backgroundColor: '#21262F',
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  timeSelectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'left',
  },
  hourHeader: {
    width: 60,
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  minuteHeader: {
    width: 60,
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  dayLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  timeInput: {
    width: 60,
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4B5563',
    textAlign: 'center',
    marginHorizontal: 4,
    minHeight: 40,
  },
}); 