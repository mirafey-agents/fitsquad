'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';
import { router } from 'expo-router';
import { useHabits } from '@/app/context/HabitsContext';

type IconName = keyof typeof Ionicons.glyphMap;

interface HabitData {
  icon: IconName;
  title: string;
  description: string;
  frequency: 'daily' | 'schedule';
  selectedDays?: string[]; // Full day names like 'Mon', 'Tue', etc.
}

const predefinedHabits: Array<{ icon: IconName; title: string; description: string }> = [
  { icon: 'restaurant', title: 'Healthy meal', description: 'Eat a low-carb, high protein, high fiber meal' },
  { icon: 'water', title: 'Drink water', description: '8 glasses of water' },
  { icon: 'barbell', title: 'Weight training', description: '30 minutes of weight training' },
  { icon: 'moon', title: 'Sleep early', description: 'Sleep by 10pm' },
  { icon: 'body', title: 'Meditate', description: '10 minutes of meditation' },
  { icon: 'body', title: 'Stretch', description: '15 minutes of stretching' },
  { icon: 'heart', title: 'Cardio', description: '30 minutes of cardio' },
  { icon: 'book', title: 'Read', description: 'Read for 30 minutes' },
  { icon: 'person', title: 'Yoga', description: '30 minutes of yoga' },
  { icon: 'add-circle', title: 'Medication', description: 'Take medication' },
  { icon: 'flash', title: 'Vitamins', description: 'Take vitamins' },
  { icon: 'ban', title: 'No alcohol', description: 'No alcohol for 30 days' },
  { icon: 'logo-no-smoking', title: 'No smoking', description: 'No smoking for 30 days' },
  { icon: 'musical-notes', title: 'Play Guitar', description: 'Play guitar for 30 minutes' },
  { icon: 'file-tray', title: 'Clear emails', description: 'Clear your inbox' },
  { icon: 'checkmark-circle', title: 'Check in', description: 'Check in to your day' },
];

// Get all unique icons from predefinedHabits
const uniqueIcons: IconName[] = Array.from(new Set(predefinedHabits.map(h => h.icon)));

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const fullDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Convert frequency and selected days to cron schedule
const frequencyToCronSchedule = (frequency: 'daily' | 'schedule', selectedDays?: string[]): string => {
  if (frequency === 'schedule' && selectedDays && selectedDays.length > 0) {
    // Schedule: convert day names to lowercase for cron format
    const cronDays = selectedDays.map(day => day.toLowerCase()).join(',');
    
    // Run at 3 AM on selected days
    return `0 3 * * ${cronDays}`;
  }
  
  // Default: daily at 9 AM
  return '0 3 * * *';
};

// Step 1: Title/Preset Selection View
const Step1View = ({ 
  onClose, 
  onNext, 
  habitData, 
  setHabitData 
}: {
  onClose: () => void;
  onNext: () => void;
  habitData: HabitData;
  setHabitData: (data: HabitData) => void;
}) => {
  const [customTitle, setCustomTitle] = useState('');

  const handlePresetSelect = (habit: { icon: IconName; title: string; description: string }) => {
    setHabitData({
      ...habitData,
      icon: habit.icon,
      title: habit.title,
      description: habit.description,
    });
    setCustomTitle(''); // Clear custom title when preset is selected
  };

  const handleCustomTitle = () => {
    if (customTitle.trim()) {
      setHabitData({
        ...habitData,
        title: customTitle.trim(),
        description: '', // Clear description when custom title is used
      });
    }
  };

  const handleCustomTitleChange = (text: string) => {
    setCustomTitle(text);
    if (text.trim()) {
      setHabitData({
        ...habitData,
        title: text.trim(),
        description: '', // Clear description when custom title is used
      });
    }
  };

  const handleDeselectPreset = () => {
    setHabitData({
      ...habitData,
      title: '',
      description: '',
    });
    setCustomTitle('');
  };

  const canProceed = (habitData.title.trim() !== '') || (customTitle.trim() !== '');

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 1: Choose Title</Text>
        <Pressable 
          onPress={onNext} 
          style={[styles.headerButton, !canProceed && styles.disabledButton]}
          disabled={!canProceed}
        >
          <Text style={styles.headerButtonText}>Next</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Type a custom title</Text>
            <TextInput
              style={styles.input}
              value={customTitle}
              onChangeText={handleCustomTitleChange}
              placeholder="Enter habit title..."
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.predefinedSection}>
            <Text style={styles.sectionTitle}>Or choose from presets</Text>
            {predefinedHabits.map((habit, index) => (
              <Pressable
                key={index}
                style={[
                  styles.habitRow,
                  habitData.title === habit.title && styles.selectedHabitRow
                ]}
                onPress={() => {
                  if (habitData.title === habit.title) {
                    // Toggle selection - deselect if already selected
                    handleDeselectPreset();
                  } else {
                    // Select new preset
                    handlePresetSelect(habit);
                  }
                }}
              >
                <Ionicons name={habit.icon} size={24} color="#FFFFFF" />
                <Text style={styles.habitName}>{habit.title}</Text>
                <Text style={styles.habitDesc}>{habit.description}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
  );
};

// Step 2: Edit Details View
const Step2View = ({ 
  onClose, 
  onNext, 
  habitData, 
  setHabitData 
}: {
  onClose: () => void;
  onNext: () => void;
  habitData: HabitData;
  setHabitData: (data: HabitData) => void;
}) => {
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleFrequencyChange = (frequency: 'daily' | 'schedule') => {
    setHabitData({
      ...habitData,
      frequency,
      selectedDays: frequency === 'daily' ? undefined : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], // Default to weekdays
    });
  };

  const toggleDay = (dayIndex: number) => {
    if (habitData.frequency === 'schedule' && habitData.selectedDays) {
      const dayName = fullDayNames[dayIndex];
      const newDays = habitData.selectedDays.includes(dayName)
        ? habitData.selectedDays.filter(d => d !== dayName)
        : [...habitData.selectedDays, dayName];
      setHabitData({
        ...habitData,
        selectedDays: newDays,
      });
    }
  };

  const canProceed = habitData.title.trim() !== '' &&
  (habitData.frequency === 'daily' || (habitData.selectedDays && habitData.selectedDays.length > 0));

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 2: Edit Details</Text>
        <Pressable 
          onPress={onNext} 
          style={[styles.headerButton, !canProceed && styles.disabledButton]}
          disabled={!canProceed}
        >
          <Text style={styles.headerButtonText}>Next</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
          <View style={styles.iconHeaderContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={habitData.icon} size={48} color="#fff" />
              <Pressable 
                style={styles.editIconButton}
                onPress={() => setShowIconPicker(true)}
              >
                <Ionicons name="pencil" size={16} color="#fff" />
              </Pressable>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.input}
              value={habitData.title}
              onChangeText={(text) => setHabitData({ ...habitData, title: text })}
              placeholder="Enter habit title..."
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={habitData.description}
              onChangeText={(text) => setHabitData({ ...habitData, description: text })}
              placeholder="Enter habit description..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.sectionTitle}>Frequency</Text>
            <View style={styles.frequencyContainer}>
              <Pressable
                style={[
                  styles.frequencyButton,
                  habitData.frequency === 'daily' && styles.selectedFrequencyButton
                ]}
                onPress={() => handleFrequencyChange('daily')}
              >
                <Text style={[
                  styles.frequencyButtonText,
                  habitData.frequency === 'daily' && styles.selectedFrequencyButtonText
                ]}>
                  Daily
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.frequencyButton,
                  habitData.frequency === 'schedule' && styles.selectedFrequencyButton
                ]}
                onPress={() => handleFrequencyChange('schedule')}
              >
                <Text style={[
                  styles.frequencyButtonText,
                  habitData.frequency === 'schedule' && styles.selectedFrequencyButtonText
                ]}>
                  Schedule
                </Text>
              </Pressable>
            </View>

            {habitData.frequency === 'schedule' && (
              <View style={styles.daysContainer}>
                <Text style={styles.daysLabel}>Select days:</Text>
                <View style={styles.daysGrid}>
                  {dayLabels.map((day, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.dayButton,
                        habitData.selectedDays?.includes(fullDayNames[index]) && styles.selectedDayButton
                      ]}
                      onPress={() => toggleDay(index)}
                    >
                      <Text style={[
                        styles.dayButtonText,
                        habitData.selectedDays?.includes(fullDayNames[index]) && styles.selectedDayButtonText
                      ]}>
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Icon Picker Modal */}
        <Modal visible={showIconPicker} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowIconPicker(false)} style={styles.modalHeaderButton}>
                <Text style={styles.modalHeaderButtonText}>Back</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Choose Icon</Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.iconGrid}>
                {uniqueIcons.map((icon) => (
                  <Pressable
                    key={icon}
                    style={[
                      styles.iconGridItem,
                      habitData.icon === icon && styles.selectedIcon,
                    ]}
                    onPress={() => {
                      setHabitData({ ...habitData, icon });
                      setShowIconPicker(false);
                    }}
                  >
                    <Ionicons name={icon} size={28} color="#fff" />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
  );
};

// Step 3: Final Review View
const Step3View = ({ 
  onClose, 
  onSave,
  habitData,
  loading
}: {
  onClose: () => void;
  onSave: () => void;
  habitData: HabitData;
  loading: boolean;
}) => {
  const getFrequencyText = () => {
    if (habitData.frequency === 'daily') return 'Daily';
    if (habitData.selectedDays && habitData.selectedDays.length > 0) {
      const selectedDayLabels = habitData.selectedDays.join(', ');
      return `Schedule (${selectedDayLabels})`;
    }
    return 'Schedule';
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Step 3: Review & Save</Text>
        <Pressable 
          onPress={onSave} 
          style={[styles.headerButton, loading && styles.disabledButton]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.headerButtonText}>Save</Text>
          )}
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
          <View style={styles.iconHeaderContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name={habitData.icon} size={48} color="#fff" />
            </View>
          </View>

          <View style={styles.reviewContainer}>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Title:</Text>
              <Text style={styles.reviewValue}>{habitData.title}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Description:</Text>
              <Text style={styles.reviewValue}>{habitData.description}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Frequency:</Text>
              <Text style={styles.reviewValue}>{getFrequencyText()}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
  );
};

export default function AddHabitPage() {
  const { addHabit } = useHabits();
  const [currentStep, setCurrentStep] = useState(1);
  const [habitData, setHabitData] = useState<HabitData>({
    icon: 'add-circle',
    title: '',
    description: '',
    frequency: 'daily',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
          try {
        await addHabit(
          habitData.title,
          habitData.description,
          habitData.icon,
          frequencyToCronSchedule(habitData.frequency, habitData.selectedDays)
        );
        setCurrentStep(1);
        router.replace("/member/habits");
      } catch (error) {
      console.error('Failed to add habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    router.replace("/member/habits");
  };

    return (
      <SafeAreaView style={styles.container}>
        {/* Persistent Header */}
        <View style={styles.persistentHeader}>
          <Pressable 
            onPress={currentStep === 1 ? handleClose : handleBack} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Add Habit</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Step Views */}
        {currentStep === 1 && (
          <Step1View
            onClose={handleClose}
            onNext={handleNext}
            habitData={habitData}
            setHabitData={setHabitData}
          />
        )}

        {currentStep === 2 && (
          <Step2View
            onClose={handleClose}
            onNext={handleNext}
            habitData={habitData}
            setHabitData={setHabitData}
          />
        )}

        {currentStep === 3 && (
          <Step3View
            onClose={handleClose}
            onSave={handleSave}
            habitData={habitData}
            loading={loading}
          />
        )}
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060712',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  persistentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#353D45',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerSpacer: {
    width: 60,
  },
  stepContainer: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 8,
  },
  stepTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#353D45',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#353D45',
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  stepIndicator: {
    marginBottom: 24,
  },
  stepText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#353D45',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.semantic.success,
    borderRadius: 2,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#060712',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#353D45',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  modalHeaderButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#353D45',
    minWidth: 60,
    alignItems: 'center',
  },
  modalHeaderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  disabledButton: {
    opacity: 0.5,
  },
  // Input styles
  inputContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#353D45',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  titleDisplay: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    padding: 12,
    backgroundColor: '#353D45',
    borderRadius: 12,
  },
  // Icon selector styles
  iconSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#353D45',
    borderRadius: 12,
    padding: 12,
  },
  iconSelectorText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start',
  },
  iconGridItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#353D45',
    marginRight: 12,
    marginBottom: 12,
  },
  selectedIcon: {
    backgroundColor: colors.semantic.success,
  },
  // Frequency styles
  frequencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  frequencyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#353D45',
    alignItems: 'center',
  },
  selectedFrequencyButton: {
    backgroundColor: colors.semantic.success,
  },
  frequencyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedFrequencyButtonText: {
    color: '#000',
  },
  daysContainer: {
    marginTop: 16,
  },
  daysLabel: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#353D45',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDayButton: {
    backgroundColor: colors.semantic.success,
  },
  dayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDayButtonText: {
    color: '#000',
  },
  // Predefined habits styles
  predefinedSection: {
    marginBottom: 24,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  selectedHabitRow: {
    backgroundColor: colors.semantic.success,
  },
  habitName: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
    marginLeft: 15,
  },
  habitDesc: {
    color: '#A1A1AA',
    fontSize: 14,
    flex: 2,
    marginLeft: 10,
  },
  // Review styles
  reviewContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewLabel: {
    color: '#A1A1AA',
    fontSize: 14,
    width: 100,
  },
  reviewValue: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },

  // Icon circle styles
  iconHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#353D45',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.semantic.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#060712',
  },
}); 