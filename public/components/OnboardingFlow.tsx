import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, shadows, typography, spacing, borderRadius } from '../constants/theme';
import { updateUserProfile } from '@/utils/firebase';

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
    display_name: initialData.display_name || '',
    gender: initialData.gender || '',
    age: initialData.age ? String(initialData.age) : '',
    goals: initialData.goals || [],
    experience_level: initialData.experience_level || '',
    medical_conditions: initialData.medical_conditions || '',
    dietary_restrictions: initialData.dietary_restrictions || [],
    preferred_workout_times: initialData.preferred_workout_times || [],
    available_equipment: initialData.available_equipment || [],
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
      const success = await updateUserProfile(formData);
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
          value={formData.display_name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, display_name: text }))}
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
                formData.experience_level === level && styles.selectedOption
              ]}
              onPress={() => setSingleSelection('experience_level', level)}
            >
              <Text style={[
                styles.optionText,
                formData.experience_level === level && styles.selectedOptionText
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
          value={formData.medical_conditions}
          onChangeText={(text) => setFormData(prev => ({ ...prev, medical_conditions: text }))}
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
                formData.dietary_restrictions.includes(diet) && styles.selectedChip
              ]}
              onPress={() => toggleSelection('dietary_restrictions', diet)}
            >
              <Text style={[
                styles.chipText,
                formData.dietary_restrictions.includes(diet) && styles.selectedChipText
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
                formData.preferred_workout_times.includes(time) && styles.selectedChip
              ]}
              onPress={() => toggleSelection('preferred_workout_times', time)}
            >
              <Text style={[
                styles.chipText,
                formData.preferred_workout_times.includes(time) && styles.selectedChipText
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
                formData.available_equipment.includes(equipment) && styles.selectedChip
              ]}
              onPress={() => toggleSelection('available_equipment', equipment)}
            >
              <Text style={[
                styles.chipText,
                formData.available_equipment.includes(equipment) && styles.selectedChipText
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
        colors={["#21262F", "#353D45"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
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
            <Ionicons name="arrow-back" size={20} color={colors.primary.light} />
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
    backgroundColor: colors.primary.dark,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    opacity: 0.8,
  },
  progressContainer: {
    marginTop: 30,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  stepsIndicator: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedOption: {
    backgroundColor: '#432424',
    borderColor: '#432424',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#432424',
    borderColor: '#432424',
  },
  chipText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectedChipText: {
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: Platform.select({ ios: 34, android: 20, default: 20 }),
    backgroundColor: colors.primary.dark,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...shadows.lg,
    zIndex: 100,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    ...shadows.md,
    minWidth: 100,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#432424',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    ...shadows.md,
    minWidth: 100,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
});