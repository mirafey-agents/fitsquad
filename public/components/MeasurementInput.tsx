import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface MeasurementInputProps {
  onClose: () => void;
  onSave: (measurements: Record<string, number>) => void;
  section: 'body' | 'medical' | 'performance';
}

const SECTION_FIELDS = {
  body: [
    { key: 'weight', label: 'Weight', unit: 'kg' },
    { key: 'body_fat', label: 'Body Fat', unit: '%' },
    { key: 'muscle_mass', label: 'Muscle Mass', unit: 'kg' },
    { key: 'chest', label: 'Chest', unit: 'cm' },
    { key: 'waist', label: 'Waist', unit: 'cm' },
    { key: 'arms', label: 'Arms', unit: 'cm' },
    { key: 'thighs', label: 'Thighs', unit: 'cm' },
  ],
  medical: [
    { key: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg' },
    { key: 'resting_heart_rate', label: 'Resting Heart Rate', unit: 'bpm' },
    { key: 'blood_sugar', label: 'Blood Sugar', unit: 'mg/dL' },
    { key: 'cholesterol', label: 'Cholesterol', unit: 'mg/dL' },
  ],
  performance: [
    { key: 'strength_score', label: 'Strength Score', unit: 'pts' },
    { key: 'endurance_score', label: 'Endurance Score', unit: 'pts' },
    { key: 'flexibility_score', label: 'Flexibility Score', unit: 'pts' },
    { key: 'balance_score', label: 'Balance Score', unit: 'pts' },
  ],
};

export default function MeasurementInput({ onClose, onSave, section }: MeasurementInputProps) {
  const [measurements, setMeasurements] = useState<Record<string, string>>({});

  const handleSave = () => {
    const numericMeasurements: Record<string, number> = {};
    Object.entries(measurements).forEach(([key, value]) => {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        numericMeasurements[key] = numValue;
      }
    });
    onSave(numericMeasurements);
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Measurements</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray[500]} />
          </Pressable>
        </View>

        <ScrollView style={styles.fields}>
          {SECTION_FIELDS[section].map((field) => (
            <View key={field.key} style={styles.field}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="0.0"
                  value={measurements[field.key]}
                  onChangeText={(text) => setMeasurements(prev => ({ ...prev, [field.key]: text }))}
                />
                <Text style={styles.unit}>{field.unit}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  closeButton: {
    padding: spacing.sm,
  },
  fields: {
    padding: spacing.md,
    maxHeight: 400,
  },
  field: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  input: {
    flex: 1,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: colors.primary.dark,
  },
  unit: {
    paddingRight: spacing.md,
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[100],
  },
  cancelButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[600],
  },
  saveButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.dark,
  },
  saveButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.light,
  },
});