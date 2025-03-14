import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import { supabase } from '../../../../utils/supabase';

interface Member {
  id: string;
  display_name: string;
  email: string;
  height: number | null;
  weight: number | null;
  body_fat: number | null;
}

interface Assessment {
  id: string;
  assessment_date: string;
  height: number | null;
  weight: number | null;
  body_fat: number | null;
  notes: string | null;
  measurements: Record<string, any> | null;
  fitness_scores: Record<string, any> | null;
  created_at: string;
}

export default function MemberAssessment() {
  const { id } = useLocalSearchParams();
  const [member, setMember] = useState<Member | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [formData, setFormData] = useState({
    assessmentDate: new Date().toISOString().split('T')[0],
    height: '',
    weight: '',
    bodyFat: '',
    notes: '',
    chestMeasurement: '',
    waistMeasurement: '',
    hipMeasurement: '',
    armMeasurement: '',
    thighMeasurement: '',
    pushUps: '',
    sitUps: '',
    plankTime: '',
    flexibility: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  useEffect(() => {
    if (typeof id === 'string') {
      fetchMemberData(id);
      fetchAssessments(id);
    }
  }, [id]);

  const fetchMemberData = async (memberId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, display_name, email, height, weight, body_fat')
        .eq('id', memberId)
        .single();

      if (error) throw error;
      setMember(data);

      // Pre-fill form with existing data if available
      if (data.height || data.weight || data.body_fat) {
        setFormData(prev => ({
          ...prev,
          height: data.height ? String(data.height) : '',
          weight: data.weight ? String(data.weight) : '',
          bodyFat: data.body_fat ? String(data.body_fat) : '',
        }));
      }
    } catch (error) {
      console.error('Error fetching member data:', error);
      setError('Failed to load member data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessments = async (memberId: string) => {
    try {
      const { data, error } = await supabase
        .from('member_assessments')
        .select('*')
        .eq('user_id', memberId)
        .order('assessment_date', { ascending: false });

      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedDocument(asset.name);
        // In a real app, you would upload this file to storage
        console.log('Selected document:', asset);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      // Prepare measurements and fitness scores
      const measurements = {
        chest: formData.chestMeasurement ? parseFloat(formData.chestMeasurement) : null,
        waist: formData.waistMeasurement ? parseFloat(formData.waistMeasurement) : null,
        hip: formData.hipMeasurement ? parseFloat(formData.hipMeasurement) : null,
        arm: formData.armMeasurement ? parseFloat(formData.armMeasurement) : null,
        thigh: formData.thighMeasurement ? parseFloat(formData.thighMeasurement) : null,
      };

      const fitnessScores = {
        pushUps: formData.pushUps ? parseInt(formData.pushUps) : null,
        sitUps: formData.sitUps ? parseInt(formData.sitUps) : null,
        plankTime: formData.plankTime ? parseInt(formData.plankTime) : null,
        flexibility: formData.flexibility ? parseInt(formData.flexibility) : null,
      };

      // Create assessment record
      const { data: assessment, error: assessmentError } = await supabase
        .from('member_assessments')
        .insert({
          user_id: id,
          assessment_date: formData.assessmentDate,
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          body_fat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
          notes: formData.notes,
          measurements,
          fitness_scores: fitnessScores,
          created_by: '00000000-0000-0000-0000-000000000000', // Demo user ID
        })
        .select()
        .single();

      if (assessmentError) throw assessmentError;

      // Update member's current measurements
      const { error: updateError } = await supabase
        .from('users')
        .update({
          height: formData.height ? parseFloat(formData.height) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          body_fat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // In a real app, you would upload the document to storage here
      if (selectedDocument) {
        console.log('Would upload document:', selectedDocument);
      }

      Alert.alert(
        'Success',
        'Assessment saved successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving assessment:', error);
      Alert.alert('Error', 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.title}>Member Assessment</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading member data...</Text>
        </View>
      </View>
    );
  }

  if (error || !member) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#1E293B" />
          </Pressable>
          <Text style={styles.title}>Member Assessment</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Member not found'}</Text>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.title}>Member Assessment</Text>
        <Pressable 
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100)}>
          <View style={styles.memberCard}>
            <Text style={styles.memberName}>{member.display_name}</Text>
            <Text style={styles.memberEmail}>{member.email}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assessment Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Assessment Date</Text>
              <TextInput
                style={styles.input}
                value={formData.assessmentDate}
                onChangeText={(text) => setFormData(prev => ({ ...prev, assessmentDate: text }))}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                placeholder="Add notes about this assessment"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Measurements</Text>
            
            <View style={styles.measurementsGrid}>
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Height (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.height}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, height: text }))}
                  placeholder="Height"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, weight: text }))}
                  placeholder="Weight"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Body Fat (%)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.bodyFat}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bodyFat: text }))}
                  placeholder="Body Fat"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.subSectionTitle}>Circumference Measurements (cm)</Text>
            
            <View style={styles.measurementsGrid}>
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Chest</Text>
                <TextInput
                  style={styles.input}
                  value={formData.chestMeasurement}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, chestMeasurement: text }))}
                  placeholder="Chest"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Waist</Text>
                <TextInput
                  style={styles.input}
                  value={formData.waistMeasurement}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, waistMeasurement: text }))}
                  placeholder="Waist"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Hip</Text>
                <TextInput
                  style={styles.input}
                  value={formData.hipMeasurement}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, hipMeasurement: text }))}
                  placeholder="Hip"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Arm</Text>
                <TextInput
                  style={styles.input}
                  value={formData.armMeasurement}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, armMeasurement: text }))}
                  placeholder="Arm"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Thigh</Text>
                <TextInput
                  style={styles.input}
                  value={formData.thighMeasurement}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, thighMeasurement: text }))}
                  placeholder="Thigh"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fitness Assessment</Text>
            
            <View style={styles.measurementsGrid}>
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Push-ups (count)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.pushUps}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, pushUps: text }))}
                  placeholder="Push-ups"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Sit-ups (count)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.sitUps}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, sitUps: text }))}
                  placeholder="Sit-ups"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Plank (seconds)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.plankTime}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, plankTime: text }))}
                  placeholder="Plank time"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.measurementInput}>
                <Text style={styles.label}>Flexibility (cm)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.flexibility}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, flexibility: text }))}
                  placeholder="Flexibility"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supporting Documents</Text>
            
            <Pressable style={styles.documentPicker} onPress={pickDocument}>
              <Ionicons name="document" size={24} color="#4F46E5" />
              <Text style={styles.documentPickerText}>
                {selectedDocument ? selectedDocument : 'Select Document'}
              </Text>
            </Pressable>
            
            <Text style={styles.documentHelp}>
              Upload any supporting documents such as medical clearance, previous assessments, etc.
            </Text>
          </View>
        </Animated.View>

        {assessments.length > 0 && (
          <Animated.View entering={FadeInUp.delay(600)}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Previous Assessments</Text>
              
              {assessments.map((assessment, index) => (
                <View key={assessment.id} style={styles.assessmentCard}>
                  <View style={styles.assessmentHeader}>
                    <Text style={styles.assessmentDate}>
                      {new Date(assessment.assessment_date).toLocaleDateString()}
                    </Text>
                    <BlurView intensity={80} style={styles.assessmentBadge}>
                      <Text style={styles.assessmentBadgeText}>
                        {index === 0 ? 'Latest' : `#${index + 1}`}
                      </Text>
                    </BlurView>
                  </View>
                  
                  <View style={styles.assessmentDetails}>
                    <View style={styles.assessmentDetail}>
                      <Text style={styles.detailLabel}>Height</Text>
                      <Text style={styles.detailValue}>
                        {assessment.height ? `${assessment.height} cm` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.assessmentDetail}>
                      <Text style={styles.detailLabel}>Weight</Text>
                      <Text style={styles.detailValue}>
                        {assessment.weight ? `${assessment.weight} kg` : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.assessmentDetail}>
                      <Text style={styles.detailLabel}>Body Fat</Text>
                      <Text style={styles.detailValue}>
                        {assessment.body_fat ? `${assessment.body_fat}%` : 'N/A'}
                      </Text>
                    </View>
                  </View>
                  
                  {assessment.notes && (
                    <Text style={styles.assessmentNotes}>{assessment.notes}</Text>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  memberCard: {
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
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  memberEmail: {
    fontSize: 14,
    color: '#64748B',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  measurementInput: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 12,
  },
  documentPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  documentPickerText: {
    fontSize: 16,
    color: '#4F46E5',
    marginLeft: 12,
  },
  documentHelp: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  assessmentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  assessmentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  assessmentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
  },
  assessmentBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
  },
  assessmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  assessmentDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  assessmentNotes: {
    fontSize: 14,
    color: '#64748B',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});