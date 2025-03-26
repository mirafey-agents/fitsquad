import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../../constants/theme';
import { supabase } from '../../../utils/supabase';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface Squad {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  schedule: any;
}

export default function CreateSquad() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Squad name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Get current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Call Firebase function to create squad
      const functions = getFunctions();
      const createSquad = httpsCallable(functions, 'createSquad');
      const result = await createSquad({
        name: formData.name,
        description: formData.description,
        is_private: formData.isPrivate,
        schedule: selectedDays,
        auth_token: session.access_token
      });

      if (result.data.error) {
        throw new Error(result.data.error);
      }

      Alert.alert(
        'Success',
        'Squad created successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating squad:', error);
      setError('Failed to create squad');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </Pressable>
        <Text style={styles.title}>Create Squad</Text>
        <Pressable 
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleCreate}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Creating...' : 'Create'}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Squad Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Squad Name</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter squad name"
              placeholderTextColor={colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              placeholder="Enter squad description"
              placeholderTextColor={colors.gray[400]}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.toggleContainer}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Private Squad</Text>
              <Text style={styles.toggleDescription}>
                Only invited members can join this squad
              </Text>
            </View>
            <Switch
              value={formData.isPrivate}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isPrivate: value }))}
              trackColor={{ false: colors.gray[200], true: colors.semantic.success + '50' }}
              thumbColor={formData.isPrivate ? colors.semantic.success : colors.gray[400]}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Text style={styles.sectionDescription}>Select workout days for this squad</Text>
          
          <View style={styles.scheduleInfo}>
            <Text style={styles.scheduleNote}>Training Schedule:</Text>
            <Text style={styles.scheduleTime}>Monday-Friday: 18:00-20:00</Text>
            <Text style={styles.scheduleTime}>Saturday: 09:00-11:00</Text>
            <Text style={styles.scheduleTime}>Sunday: No training</Text>
          </View>

          <View style={styles.daysGrid}>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
              <Pressable
                key={day}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day) && styles.selectedDay
                ]}
                onPress={() => toggleDay(day)}
              >
                <Text style={[
                  styles.dayText,
                  selectedDays.includes(day) && styles.selectedDayText
                ]}>{day}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
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
    padding: spacing[4],
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: spacing[2],
  },
  title: {
    ...typography.h1,
    color: colors.primary.dark,
  },
  saveButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: spacing[4],
    backgroundColor: colors.white,
    marginBottom: spacing[4],
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.primary.dark,
    marginBottom: spacing[2],
  },
  sectionDescription: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing[4],
  },
  inputGroup: {
    marginBottom: spacing[4],
  },
  label: {
    ...typography.label,
    color: colors.gray[700],
    marginBottom: spacing[1],
  },
  input: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    ...typography.body,
    color: colors.gray[900],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    ...typography.label,
    color: colors.gray[700],
    marginBottom: spacing[1],
  },
  toggleDescription: {
    ...typography.caption,
    color: colors.gray[500],
  },
  scheduleInfo: {
    backgroundColor: colors.gray[50],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    marginBottom: spacing[4],
  },
  scheduleNote: {
    ...typography.label,
    color: colors.gray[700],
    marginBottom: spacing[1],
  },
  scheduleTime: {
    ...typography.body,
    color: colors.gray[600],
    marginBottom: spacing[1],
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  dayButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  selectedDay: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  dayText: {
    ...typography.body,
    color: colors.gray[700],
  },
  selectedDayText: {
    color: colors.white,
  },
}); 