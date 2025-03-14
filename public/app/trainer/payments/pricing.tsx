import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Share } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../../../constants/theme';

interface PricingProps {
  type?: 'personal' | 'group';
  basePrice?: number;
}

const TERMS_AND_CONDITIONS = [
  'All packages are non-refundable and non-transferable',
  'Sessions must be scheduled at least 24 hours in advance',
  'Cancellation policy: 12 hours notice required',
  'Monthly plans require upfront payment',
  'Unused sessions do not carry forward',
];

const PRIME_TIME_SURCHARGE = 0.2; // 20% surcharge for prime time slots
const PAY_AS_YOU_GO_SURCHARGE = 0.2; // 20% surcharge for pay as you go

const DEFAULT_PLAN_CONFIGS = [
  { duration: '1 Month', sessions: 8, discount: 0 },
  { duration: '3 Months', sessions: 8, discount: 10 },
  { duration: '6 Months', sessions: 12, discount: 15, recommended: true },
  { duration: '12 Months', sessions: 16, discount: 20 },
];

export default function Pricing({ type = 'personal', basePrice = 1000 }: PricingProps) {
  const [selectedType, setSelectedType] = useState(type);
  const [isPrimeTime, setIsPrimeTime] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [currentBasePrice, setCurrentBasePrice] = useState(basePrice);
  const [planConfigs, setPlanConfigs] = useState(DEFAULT_PLAN_CONFIGS);

  const calculatePrice = (sessions: number, discount: number, isPayAsYouGo = false) => {
    let price = selectedType === 'personal' ? currentBasePrice : currentBasePrice * 0.6;
    
    if (isPrimeTime) {
      price *= (1 + PRIME_TIME_SURCHARGE);
    }
    
    if (isPayAsYouGo) {
      price *= (1 + PAY_AS_YOU_GO_SURCHARGE);
    }
    
    const totalBeforeDiscount = price * sessions;
    const discountAmount = totalBeforeDiscount * (discount / 100);
    return totalBeforeDiscount - discountAmount;
  };

  const handleShare = async () => {
    try {
      const message = `${selectedType === 'personal' ? 'Personal' : 'Group'} Training Pricing\n\n` +
        `Pay As You Go:\n` +
        `₹${Math.round(currentBasePrice * (1 + PAY_AS_YOU_GO_SURCHARGE))}/session\n\n` +
        `Monthly Plans:\n` +
        planConfigs.map(plan => 
          `${plan.duration} (${plan.sessions} sessions/month):\n` +
          `₹${Math.round(calculatePrice(plan.sessions, plan.discount))}/month` +
          `${plan.discount ? ` (${plan.discount}% off)` : ''}\n` +
          `₹${Math.round(calculatePrice(plan.sessions, plan.discount) / plan.sessions)}/session\n`
        ).join('\n') +
        `\nTerms & Conditions:\n` +
        TERMS_AND_CONDITIONS.map(term => `• ${term}`).join('\n');

      await Share.share({
        message,
        title: 'Training Plans & Pricing',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </Pressable>
        <Text style={styles.title}>Pricing Configuration</Text>
        <Pressable 
          style={styles.previewButton}
          onPress={() => setShowPreview(!showPreview)}
        >
          <Text style={styles.previewButtonText}>
            {showPreview ? 'Edit' : 'Preview'}
          </Text>
        </Pressable>
      </View>

      {!showPreview ? (
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Training Type</Text>
            <View style={styles.typeButtons}>
              <Pressable
                style={[
                  styles.typeButton,
                  selectedType === 'personal' && styles.selectedType
                ]}
                onPress={() => setSelectedType('personal')}
              >
                <Ionicons 
                  name="person" 
                  size={24} 
                  color={selectedType === 'personal' ? colors.primary.light : colors.primary.dark} 
                />
                <Text style={[
                  styles.typeButtonText,
                  selectedType === 'personal' && styles.selectedTypeText
                ]}>Personal Training</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  selectedType === 'group' && styles.selectedType
                ]}
                onPress={() => setSelectedType('group')}
              >
                <Ionicons 
                  name="people" 
                  size={24} 
                  color={selectedType === 'group' ? colors.primary.light : colors.primary.dark} 
                />
                <Text style={[
                  styles.typeButtonText,
                  selectedType === 'group' && styles.selectedTypeText
                ]}>Group Training</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Base Price/Hour</Text>
            <TextInput
              style={styles.input}
              value={String(currentBasePrice)}
              onChangeText={(text) => {
                const value = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                setCurrentBasePrice(value);
              }}
              keyboardType="numeric"
              placeholder="Enter base price per hour"
            />
            <Text style={styles.inputHelp}>
              This is the base price for a single hour. Group training will be automatically calculated at 60% of this rate.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Plans</Text>
            <Text style={styles.sectionSubtitle}>Configure sessions and discounts for each plan duration</Text>
            
            {planConfigs.map((plan, index) => (
              <View key={index} style={styles.planConfigCard}>
                <Text style={styles.planConfigTitle}>{plan.duration}</Text>
                
                <View style={styles.planConfigInputs}>
                  <View style={styles.planConfigInput}>
                    <Text style={styles.inputLabel}>Sessions/Month</Text>
                    <TextInput
                      style={styles.configInput}
                      value={String(plan.sessions)}
                      onChangeText={(text) => {
                        const value = parseInt(text) || plan.sessions;
                        setPlanConfigs(prev => 
                          prev.map((p, i) => 
                            i === index ? { ...p, sessions: value } : p
                          )
                        );
                      }}
                      keyboardType="numeric"
                      placeholder="Number of sessions"
                    />
                  </View>
                  
                  <View style={styles.planConfigInput}>
                    <Text style={styles.inputLabel}>Discount %</Text>
                    <TextInput
                      style={styles.configInput}
                      value={String(plan.discount)}
                      onChangeText={(text) => {
                        const value = parseInt(text) || 0;
                        setPlanConfigs(prev => 
                          prev.map((p, i) => 
                            i === index ? { ...p, discount: value } : p
                          )
                        );
                      }}
                      keyboardType="numeric"
                      placeholder="Discount percentage"
                    />
                  </View>
                </View>

                {plan.recommended && (
                  <BlurView intensity={80} style={styles.recommendedTag}>
                    <Ionicons name="star" size={16} color={colors.semantic.warning} />
                    <Text style={styles.recommendedTagText}>Recommended Plan</Text>
                  </BlurView>
                )}
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prime Time Slots</Text>
            <Pressable
              style={[styles.primeTimeToggle, isPrimeTime && styles.primeTimeActive]}
              onPress={() => setIsPrimeTime(!isPrimeTime)}
            >
              <Ionicons 
                name={isPrimeTime ? "time" : "time-outline"} 
                size={24} 
                color={isPrimeTime ? colors.semantic.warning : colors.gray[500]} 
              />
              <View style={styles.primeTimeContent}>
                <Text style={[
                  styles.primeTimeTitle,
                  isPrimeTime && styles.primeTimeActiveText
                ]}>Prime Time Pricing</Text>
                <Text style={styles.primeTimeDescription}>
                  20% surcharge for peak hours (6-9 AM & 5-8 PM)
                </Text>
              </View>
              <BlurView intensity={80} style={[
                styles.primeTimeBadge,
                isPrimeTime && styles.primeTimeBadgeActive
              ]}>
                <Text style={[
                  styles.primeTimeBadgeText,
                  isPrimeTime && styles.primeTimeBadgeActiveText
                ]}>+20%</Text>
              </BlurView>
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.previewWrapper}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View>
                <Text style={styles.previewTitle}>
                  {selectedType === 'personal' ? 'Personal Training' : 'Group Training'}
                </Text>
                <Text style={styles.previewSubtitle}>Choose your preferred payment plan</Text>
              </View>
              <Pressable style={styles.shareButton} onPress={handleShare}>
                <Ionicons name="share-social" size={24} color={colors.primary.dark} />
              </Pressable>
            </View>

            {/* Pay As You Go Section */}
            <View style={styles.payAsYouGoSection}>
              <Text style={styles.sectionTitle}>Pay As You Go</Text>
              <View style={styles.payAsYouGoCard}>
                <Text style={styles.priceValue}>
                  ₹{Math.round(currentBasePrice * (1 + PAY_AS_YOU_GO_SURCHARGE))}
                </Text>
                <Text style={styles.priceUnit}>/session</Text>
                <Text style={styles.priceDescription}>
                  Flexible training with no long-term commitment
                </Text>
              </View>
            </View>

            {/* Monthly Commitment Section */}
            <View style={styles.monthlySection}>
              <Text style={styles.sectionTitle}>Monthly Commitment</Text>
              <Text style={styles.sectionSubtitle}>Save with our monthly packages</Text>
              
              <View style={styles.monthlyPlans}>
                {planConfigs.map((plan, index) => {
                  const monthlyPrice = calculatePrice(plan.sessions, plan.discount) / plan.duration;
                  const pricePerSession = monthlyPrice / plan.sessions;
                  
                  return (
                    <View 
                      key={index} 
                      style={[
                        styles.monthlyPlanCard,
                        plan.recommended && styles.recommendedPlan
                      ]}
                    >
                      {plan.recommended && (
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedText}>Best Value</Text>
                        </View>
                      )}
                      
                      <Text style={styles.planDuration}>{plan.duration}</Text>
                      <Text style={styles.planPrice}>₹{Math.round(monthlyPrice)}</Text>
                      <Text style={styles.planPriceUnit}>/month</Text>
                      
                      <View style={styles.planDetails}>
                        <Text style={styles.sessionCount}>
                          {plan.sessions} sessions/month
                        </Text>
                        {plan.discount > 0 && (
                          <Text style={styles.discountTag}>{plan.discount}% off</Text>
                        )}
                        <Text style={styles.pricePerSession}>
                          ₹{Math.round(pricePerSession)}/session
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsSection}>
              <Text style={styles.termsTitle}>Terms & Conditions</Text>
              {TERMS_AND_CONDITIONS.map((term, index) => (
                <View key={index} style={styles.termItem}>
                  <Ionicons name="information-circle" size={16} color={colors.gray[500]} />
                  <Text style={styles.termText}>{term}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
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
    paddingTop: spacing.xl * 3,
    backgroundColor: colors.primary.light,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  previewButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary.dark,
    borderRadius: borderRadius.full,
  },
  previewButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.light,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  selectedType: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.primary.dark,
  },
  typeButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
  selectedTypeText: {
    color: colors.primary.light,
  },
  input: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.size.md,
    color: colors.primary.dark,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  inputHelp: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  planConfigCard: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  planConfigTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  planConfigInputs: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  planConfigInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  configInput: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: typography.size.md,
    color: colors.primary.dark,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  recommendedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.warning + '20',
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  recommendedTagText: {
    fontSize: typography.size.sm,
    color: colors.semantic.warning,
    fontWeight: typography.weight.medium as any,
  },
  primeTimeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  primeTimeActive: {
    backgroundColor: colors.semantic.warning + '10',
    borderColor: colors.semantic.warning,
  },
  primeTimeContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  primeTimeTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  primeTimeActiveText: {
    color: colors.semantic.warning,
  },
  primeTimeDescription: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  primeTimeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
  },
  primeTimeBadgeActive: {
    backgroundColor: colors.semantic.warning + '20',
  },
  primeTimeBadgeText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
  },
  primeTimeBadgeActiveText: {
    color: colors.semantic.warning,
  },
  previewWrapper: {
    flex: 1,
    backgroundColor: colors.gray[100],
  },
  previewCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    margin: spacing.md,
    maxWidth: 600,
    alignSelf: 'center',
    ...shadows.lg,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  previewTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  previewSubtitle: {
    fontSize: typography.size.md,
    color: colors.gray[500],
  },
  shareButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payAsYouGoSection: {
    marginBottom: spacing.xl,
  },
  payAsYouGoCard: {
    backgroundColor: colors.transparent.mint,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.accent.mint,
  },
  priceValue: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
  },
  priceUnit: {
    fontSize: typography.size.md,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  priceDescription: {
    fontSize: typography.size.md,
    color: colors.gray[600],
    textAlign: 'center',
  },
  monthlySection: {
    backgroundColor: colors.transparent.coral,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginVertical: spacing.lg,
  },
  monthlyPlans: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  monthlyPlanCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  recommendedPlan: {
    borderWidth: 2,
    borderColor: colors.semantic.warning,
    backgroundColor: colors.semantic.warning + '08',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -spacing.sm,
    right: spacing.md,
    backgroundColor: colors.semantic.warning,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  recommendedText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
  },
  planDuration: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  planPrice: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
  },
  planPriceUnit: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.md,
  },
  planDetails: {
    gap: spacing.xs,
  },
  sessionCount: {
    fontSize: typography.size.md,
    color: colors.primary.dark,
  },
  discountTag: {
    fontSize: typography.size.sm,
    color: colors.semantic.success,
    fontWeight: typography.weight.semibold as any,
  },
  pricePerSession: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  termsSection: {
    marginTop: spacing.xl,
  },
  termsTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  termText: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.gray[600],
  },
});