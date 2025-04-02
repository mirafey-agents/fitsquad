import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Switch, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, borderRadius, shadows } from '../../../../constants/theme';
import { supabase } from '../../../../utils/supabase';

interface Squad {
  id: string;
  name: string;
  description: string;
  is_private: boolean;
  schedule: any;
}

export default function EditSquad() {
  const { id } = useLocalSearchParams();
  const [squad, setSquad] = useState<Squad | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false
  });
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchSquadDetails(id);
    }
  }, [id]);

  const fetchSquadDetails = async (squadId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('squads')
        .select('*')
        .eq('id', squadId)
        .single();

      if (fetchError) throw fetchError;
      
      setSquad(data);
      setFormData({
        name: data.name,
        description: data.description || '',
        isPrivate: data.is_private || false,
      });
      setSelectedDays(data.schedule || []);
    } catch (error) {
      console.error('Error fetching squad:', error);
      setError('Failed to load squad details');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Squad name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('squads')
        .update({
          name: formData.name,
          description: formData.description,
          is_private: formData.isPrivate,
          schedule: selectedDays,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      Alert.alert(
        'Success',
        'Squad updated successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating squad:', error);
      setError('Failed to update squad');
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
          </Pressable>
          <Text style={styles.title}>Edit Squad</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading squad details...</Text>
        </View>
      </View>
    );
  }

  if (error || !squad) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
          </Pressable>
          <Text style={styles.title}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Squad not found'}</Text>
          <Pressable style={styles.backToSquads} onPress={() => router.back()}>
            <Text style={styles.backToSquadsText}>Back to Squads</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </Pressable>
        <Text style={styles.title}>Edit Squad</Text>
        <Pressable 
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
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
  saveButton: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.primary.light,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  content: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  sectionDescription: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: colors.primary.dark,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  scheduleInfo: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  scheduleNote: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  scheduleTime: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  toggleInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  toggleDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[100],
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  selectedDay: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.primary.dark,
  },
  dayText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  selectedDayText: {
    color: colors.primary.light,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.gray[500],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  backToSquads: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  backToSquadsText: {
    color: colors.primary.light,
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
  },
});