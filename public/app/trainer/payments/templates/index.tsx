import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../../../../constants/theme';
import { supabase } from '../../../../utils/supabase';

interface Template {
  id: string;
  name: string;
  template_data: {
    logo?: string;
    company_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    footer_text?: string;
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export default function InvoiceTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('invoice_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setError('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </Pressable>
        <Text style={styles.title}>Invoice Templates</Text>
        <Pressable 
          style={styles.createButton}
          onPress={() => router.push('./create', {relativeToDirectory: true})}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search templates"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray[400]}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Loading templates...</Text>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : templates.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text" size={48} color={colors.gray[300]} />
            <Text style={styles.emptyTitle}>No Templates</Text>
            <Text style={styles.emptyDescription}>
              Create your first invoice template to streamline your billing process.
            </Text>
            <Pressable 
              style={styles.createFirstButton}
              onPress={() => router.push('./create', {relativeToDirectory: true})}
            >
              <Ionicons name="add" size={20} color={colors.primary.light} />
              <Text style={styles.createFirstButtonText}>Create First Template</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.templatesGrid}>
            {filteredTemplates.map((template, index) => (
              <Animated.View
                key={template.id}
                entering={FadeInUp.delay(index * 100)}
                style={styles.templateCard}
              >
                <View style={styles.templateHeader}>
                  <View>
                    <Text style={styles.templateName}>{template.name}</Text>
                    <Text style={styles.templateCompany}>
                      {template.template_data.company_name}
                    </Text>
                  </View>
                  {template.is_default && (
                    <BlurView intensity={80} style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </BlurView>
                  )}
                </View>

                <View style={[
                  styles.templatePreview,
                  { backgroundColor: template.template_data.colors?.secondary || '#F8FAFC' }
                ]}>
                  {template.template_data.logo && (
                    <View style={styles.logoPreview}>
                      <Ionicons name="image" size={24} color={colors.gray[400]} />
                    </View>
                  )}
                  <View style={styles.previewContent}>
                    <View style={styles.previewLine} />
                    <View style={styles.previewLine} />
                    <View style={[styles.previewLine, { width: '60%' }]} />
                  </View>
                </View>

                <View style={styles.templateDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="call" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>
                      {template.template_data.phone || 'No phone'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="mail" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>
                      {template.template_data.email || 'No email'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location" size={16} color={colors.gray[500]} />
                    <Text style={styles.detailText}>
                      {template.template_data.address || 'No address'}
                    </Text>
                  </View>
                </View>

                <View style={styles.colorPreview}>
                  {template.template_data.colors && (
                    <>
                      <View style={[
                        styles.colorSwatch,
                        { backgroundColor: template.template_data.colors.primary }
                      ]} />
                      <View style={[
                        styles.colorSwatch,
                        { backgroundColor: template.template_data.colors.secondary }
                      ]} />
                      <View style={[
                        styles.colorSwatch,
                        { backgroundColor: template.template_data.colors.accent }
                      ]} />
                    </>
                  )}
                </View>

                <View style={styles.templateActions}>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`./${template.id}/edit`, {relativeToDirectory: true})}
                  >
                    <Ionicons name="create" size={20} color={colors.primary.dark} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => setShowPreview(template.id)}
                  >
                    <Ionicons name="eye" size={20} color={colors.primary.dark} />
                    <Text style={styles.actionButtonText}>Preview</Text>
                  </Pressable>
                  <Pressable 
                    style={styles.actionButton}
                    onPress={() => router.push(`./${template.id}/duplicate`, {relativeToDirectory: true})}
                  >
                    <Ionicons name="copy" size={20} color={colors.primary.dark} />
                    <Text style={styles.actionButtonText}>Duplicate</Text>
                  </Pressable>
                  {!template.is_default && (
                    <Pressable 
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Template',
                          'Are you sure you want to delete this template?',
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
                                    .from('invoice_templates')
                                    .delete()
                                    .eq('id', template.id);

                                  if (deleteError) throw deleteError;

                                  setTemplates(prev => 
                                    prev.filter(t => t.id !== template.id)
                                  );
                                } catch (error) {
                                  console.error('Error deleting template:', error);
                                  Alert.alert('Error', 'Failed to delete template');
                                }
                              },
                            },
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash" size={20} color={colors.semantic.error} />
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                        Delete
                      </Text>
                    </Pressable>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Template Preview Modal */}
      {showPreview && (
        <BlurView intensity={80} style={styles.previewModal}>
          <View style={styles.previewModalContent}>
            <View style={styles.previewModalHeader}>
              <Text style={styles.previewModalTitle}>Template Preview</Text>
              <Pressable 
                style={styles.closeButton}
                onPress={() => setShowPreview(null)}
              >
                <Ionicons name="close" size={24} color={colors.gray[500]} />
              </Pressable>
            </View>
            <ScrollView style={styles.previewModalBody}>
              {/* Preview content will go here */}
              <Text>Preview coming soon...</Text>
            </ScrollView>
          </View>
        </BlurView>
      )}
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
  createButton: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  createButtonText: {
    color: colors.primary.light,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
  },
  searchContainer: {
    padding: spacing.md,
    backgroundColor: colors.primary.light,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.size.md,
    color: colors.primary.dark,
  },
  content: {
    flex: 1,
  },
  templatesGrid: {
    padding: spacing.md,
    gap: spacing.md,
  },
  templateCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  templateName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  templateCompany: {
    fontSize: typography.size.md,
    color: colors.gray[500],
  },
  defaultBadge: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.success + '20',
  },
  defaultText: {
    fontSize: typography.size.sm,
    color: colors.semantic.success,
    fontWeight: typography.weight.medium as any,
  },
  templatePreview: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    height: 200,
    overflow: 'hidden',
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  previewContent: {
    gap: spacing.sm,
  },
  previewLine: {
    height: 8,
    backgroundColor: colors.gray[300],
    borderRadius: borderRadius.sm,
    width: '100%',
  },
  templateDetails: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailText: {
    fontSize: typography.size.sm,
    color: colors.gray[600],
  },
  colorPreview: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  templateActions: {
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButtonText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteButtonText: {
    color: colors.semantic.error,
  },
  loadingText: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    fontSize: typography.size.md,
    color: colors.semantic.error,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  createFirstButtonText: {
    fontSize: typography.size.md,
    color: colors.primary.light,
    fontWeight: typography.weight.semibold as any,
  },
  previewModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewModalContent: {
    width: '90%',
    maxWidth: 800,
    maxHeight: '90%',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  previewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  previewModalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  closeButton: {
    padding: spacing.sm,
  },
  previewModalBody: {
    padding: spacing.md,
  },
});