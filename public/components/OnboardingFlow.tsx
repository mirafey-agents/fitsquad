import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, shadows, typography, spacing, borderRadius } from '../constants/theme';
import { completeOnboarding } from '../utils/supabase';

const GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Improved Fitness',
  'Strength Training',
  'Endurance Building',
  'Flexibility',
  'Sports Performance',
  'Rehabilitation',
  'General Health',
];

const ACTIVITY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
];

const WORKOUT_TIMES = [
  'Morning',
  'Afternoon',
  'Evening',
  'Late Night',
  'Weekends Only',
];

const EQUIPMENT = [
  'None',
  'Dumbbells',
  'Resistance Bands',
  'Kettlebells',
  'Pull-up Bar',
  'Yoga Mat',
  'Treadmill',
  'Exercise Bike',
  'Full Home Gym',
];

type OnboardingStep = 'basics' | 'goals' | 'health' | 'preferences';

interface OnboardingFlowProps {
  onComplete: () => void;
  initialData?: any;
}

export default function OnboardingFlow({ onComplete, initialData = {} }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('basics');
  const [formData, setFormData] = useState({
    name: initialData.display_name || '',
    gender: initialData.gender || '',
    age: initialData.age ? String(initialData.age) : '',
    goals: initialData.goals || [],
    activityLevel: initialData.experience_level || '',
    medicalConditions: initialData.medical_conditions?.[0] || '',
    dietaryRestrictions: initialData.dietary_restrictions || [],
    preferredWorkoutTimes: initialData.preferred_workout_times || [],
    availableEquipment: initialData.available_equipment || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep === 'basics') setCurrentStep('goals');
    else if (currentStep === 'goals') setCurrentStep('health');
    else if (currentStep === 'health') setCurrentStep('preferences');
    else if (currentStep === 'preferences') handleSubmit();
  };

  const handleBack = () => {
    if (currentStep === 'goals') setCurrentStep('basics');
    else if (currentStep === 'health') setCurrentStep('goals');
    else if (currentStep === 'preferences') setCurrentStep('health');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const success = await completeOnboarding(formData);
      if (success) {
        onComplete();
      } else {
        // Handle error
        console.error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error during onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSelection = (field: string, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] || [];
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter(v => v !== value)
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value]
        };
      }
    });
  };

  const setSingleSelection = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderBasicsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepDescription}>Let's start with some basic information about you.</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Enter your name"
          placeholderTextColor="#94A3B8"
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.optionsRow}>
          <Pressable
            style={[
              styles.optionButton,
              formData.gender === 'Male' && styles.selectedOption
            ]}
            onPress={() => setSingleSelection('gender', 'Male')}
          >
            <Text style={[
              styles.optionText,
              formData.gender === 'Male' && styles.selectedOptionText
            ]}>Male</Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              formData.gender === 'Female' && styles.selectedOption
            ]}
            onPress={() => setSingleSelection('gender', 'Female')}
          >
            <Text style={[
              styles.optionText,
              formData.gender === 'Female' && styles.selectedOptionText
            ]}>Female</Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              formData.gender === 'Other' && styles.selectedOption
            ]}
            onPress={() => setSingleSelection('gender', 'Other')}
          >
            <Text style={[
              styles.optionText,
              formData.gender === 'Other' && styles.selectedOptionText
            ]}>Other</Text>
          </Pressable>
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={formData.age}
          onChangeText={(text) => setFormData(prev => ({ ...prev, age: text }))}
          placeholder="Enter your age"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderGoalsStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Fitness Goals</Text>
      <Text style={styles.stepDescription}>Select your fitness goals and experience level.</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Your Goals (Select all that apply)</Text>
        <View style={styles.optionsGrid}>
          {GOALS.map((goal) => (
            <Pressable
              key={goal}
              style={[
                styles.optionChip,
                formData.goals.includes(goal) && styles.selectedChip
              ]}
              onPress={() => toggleSelection('goals', goal)}
            >
              <Text style={[
                styles.chipText,
                formData.goals.includes(goal) && styles.selectedChipText
              ]}>{goal}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Activity Level</Text>
        <View style={styles.optionsRow}>
          {ACTIVITY_LEVELS.map((level) => (
            <Pressable
              key={level}
              style={[
                styles.optionButton,
                formData.activityLevel === level && styles.selectedOption
              ]}
              onPress={() => setSingleSelection('activityLevel', level)}
            >
              <Text style={[
                styles.optionText,
                formData.activityLevel === level && styles.selectedOptionText
              ]}>{level}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const renderHealthStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Health Information</Text>
      <Text style={styles.stepDescription}>Tell us about any health considerations we should know about.</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Medical Conditions (if any)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.medicalConditions}
          onChangeText={(text) => setFormData(prev => ({ ...prev, medicalConditions: text }))}
          placeholder="List any medical conditions or injuries we should know about"
          placeholderTextColor="#94A3B8"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dietary Restrictions (Select all that apply)</Text>
        <View style={styles.optionsGrid}>
          {['None', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo'].map((diet) => (
            <Pressable
              key={diet}
              style={[
                styles.optionChip,
                formData.dietaryRestrictions.includes(diet) && styles.selectedChip
              ]}
              onPress={() => toggleSelection('dietaryRestrictions', diet)}
            >
              <Text style={[
                styles.chipText,
                formData.dietaryRestrictions.includes(diet) && styles.selectedChipText
              ]}>{diet}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Workout Preferences</Text>
      <Text style={styles.stepDescription}>Let us know when and how you prefer to work out.</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Preferred Workout Times</Text>
        <View style={styles.optionsGrid}>
          {WORKOUT_TIMES.map((time) => (
            <Pressable
              key={time}
              style={[
                styles.optionChip,
                formData.preferredWorkoutTimes.includes(time) && styles.selectedChip
              ]}
              onPress={() => toggleSelection('preferredWorkoutTimes', time)}
            >
              <Text style={[
                styles.chipText,
                formData.preferredWorkoutTimes.includes(time) && styles.selectedChipText
              ]}>{time}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Available Equipment</Text>
        <View style={styles.optionsGrid}>
          {EQUIPMENT.map((equipment) => (
            <Pressable
              key={equipment}
              style={[
                styles.optionChip,
                formData.availableEquipment.includes(equipment) && styles.selectedChip
              ]}
              onPress={() => toggleSelection('availableEquipment', equipment)}
            >
              <Text style={[
                styles.chipText,
                formData.availableEquipment.includes(equipment) && styles.selectedChipText
              ]}>{equipment}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'basics':
        return renderBasicsStep();
      case 'goals':
        return renderGoalsStep();
      case 'health':
        return renderHealthStep();
      case 'preferences':
        return renderPreferencesStep();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.accent.coral, colors.accent.mint]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerActions}>
          <Pressable 
            style={styles.closeButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={colors.primary.light} />
          </Pressable>
        </View>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Help us personalize your fitness journey</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: 
                    currentStep === 'basics' ? '25%' : 
                    currentStep === 'goals' ? '50%' : 
                    currentStep === 'health' ? '75%' : '100%' 
                }
              ]} 
            />
          </View>
          <View style={styles.stepsIndicator}>
            <Text style={styles.stepIndicator}>
              Step {
                currentStep === 'basics' ? '1' : 
                currentStep === 'goals' ? '2' : 
                currentStep === 'health' ? '3' : '4'
              } of 4
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep !== 'basics' && (
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={colors.primary.dark} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        )}
        <Pressable 
          style={styles.nextButton} 
          onPress={handleNext}
          disabled={isSubmitting}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === 'preferences' ? 'Complete' : 'Next'}
          </Text>
          <Ionicons 
            name={currentStep === 'preferences' ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color={colors.primary.light} 
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerActions: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginTop: 20,
  },
  subtitle: {
    fontSize: typography.size.lg,
    color: colors.primary.dark,
    marginTop: 8,
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary.light,
    borderRadius: 4,
  },
  stepsIndicator: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  stepIndicator: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120, // Increased bottom padding to prevent content from being hidden behind buttons
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: 16,
    fontSize: typography.size.md,
    color: colors.primary.dark,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedOption: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.primary.dark,
  },
  optionText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
  selectedOptionText: {
    color: colors.primary.light,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray[200],
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.primary.dark,
  },
  chipText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  selectedChipText: {
    color: colors.primary.light,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingBottom: Platform.select({ ios: 34, android: 20, default: spacing.md }), // Safe area padding
    backgroundColor: colors.primary.light,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...shadows.lg,
    zIndex: 100, // Ensure buttons are always on top
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg, // Increased padding
    paddingVertical: spacing.md, // Increased padding
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    ...shadows.md, // Added stronger shadow
    minWidth: 100, // Ensure minimum width
  },
  backButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginLeft: spacing.sm,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.lg, // Increased padding
    paddingVertical: spacing.md, // Increased padding
    borderRadius: borderRadius.full,
    ...shadows.md, // Added stronger shadow
    minWidth: 100, // Ensure minimum width
  },
  nextButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
    marginRight: spacing.sm,
  },
});