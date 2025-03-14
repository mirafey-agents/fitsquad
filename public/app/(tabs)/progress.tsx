import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/theme';
import { supabase } from '../../utils/supabase';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import MeasurementInput from '../../components/MeasurementInput';
import MetricDetails from '../../components/MetricDetails';

const SECTIONS = {
  body: {
    title: 'Body Measurements',
    metrics: ['weight', 'body_fat', 'muscle_mass', 'chest', 'waist', 'arms', 'thighs'],
    icon: 'body-outline',
  },
  medical: {
    title: 'Medical Parameters',
    metrics: ['blood_pressure', 'resting_heart_rate', 'blood_sugar', 'cholesterol'],
    icon: 'medical-outline',
  },
  performance: {
    title: 'Performance Metrics',
    metrics: ['strength_score', 'endurance_score', 'flexibility_score', 'balance_score'],
    icon: 'fitness-outline',
  },
};

// Dummy data for initial display
const DUMMY_METRICS = [
  {
    metric: 'weight',
    value: 75.5,
    change: -2.5,
    change_percentage: -3.2,
    measurement_date: '2025-03-01',
  },
  {
    metric: 'body_fat',
    value: 18.5,
    change: -1.5,
    change_percentage: -7.5,
    measurement_date: '2025-03-01',
  },
  {
    metric: 'muscle_mass',
    value: 35.2,
    change: 1.2,
    change_percentage: 3.5,
    measurement_date: '2025-03-01',
  },
  {
    metric: 'blood_pressure',
    value: 120,
    change: -5,
    change_percentage: -4.0,
    measurement_date: '2025-03-01',
  },
  {
    metric: 'resting_heart_rate',
    value: 65,
    change: -3,
    change_percentage: -4.4,
    measurement_date: '2025-03-01',
  },
  {
    metric: 'strength_score',
    value: 85,
    change: 5,
    change_percentage: 6.3,
    measurement_date: '2025-03-01',
  },
  {
    metric: 'endurance_score',
    value: 78,
    change: 8,
    change_percentage: 11.4,
    measurement_date: '2025-03-01',
  },
];

export default function Progress() {
  const [selectedSection, setSelectedSection] = useState<'body' | 'medical' | 'performance'>('body');
  const [metrics, setMetrics] = useState<any[]>(DUMMY_METRICS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMeasurementInput, setShowMeasurementInput] = useState(false);
  const [showMetricDetails, setShowMetricDetails] = useState(false);
  const [favoriteMetrics, setFavoriteMetrics] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .rpc('get_latest_metrics', {
          p_user_id: '00000000-0000-0000-0000-000000000000'
        });

      if (fetchError) throw fetchError;
      if (data && data.length > 0) {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeasurement = async (measurements: Record<string, number>) => {
    try {
      const { error } = await supabase
        .from('progress_metrics')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          date: new Date().toISOString(),
          ...measurements
        });

      if (error) throw error;
      
      fetchProgressData();
      setShowMeasurementInput(false);
    } catch (error) {
      console.error('Error saving measurements:', error);
      Alert.alert('Error', 'Failed to save measurements');
    }
  };

  const handleToggleFavorite = (metric: string) => {
    setFavoriteMetrics(prev => 
      prev.includes(metric)
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const renderMetricCard = (metric: any) => {
    const isPositive = metric.change > 0;
    const changeColor = isPositive ? colors.semantic.success : colors.semantic.error;

    return (
      <Animated.View
        key={metric.metric}
        entering={FadeInUp.delay(200)}
        style={styles.metricCard}
      >
        <Pressable
          style={styles.metricCardContent}
          onPress={() => setSelectedMetric(metric.metric)}
        >
          <View style={styles.metricHeader}>
            <Text style={styles.metricTitle}>{metric.metric}</Text>
            <BlurView intensity={80} style={[styles.changeBadge, { backgroundColor: `${changeColor}20` }]}>
              <Text style={[styles.changeText, { color: changeColor }]}>
                {isPositive ? '+' : ''}{metric.change_percentage}%
              </Text>
            </BlurView>
          </View>

          <Text style={styles.metricValue}>{metric.value}</Text>

          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: [],
                datasets: [{
                  data: [
                    metric.value * 0.9,
                    metric.value * 0.95,
                    metric.value * 0.97,
                    metric.value * 0.98,
                    metric.value * 0.99,
                    metric.value,
                  ]
                }]
              }}
              width={160}
              height={60}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '0',
                },
              }}
              bezier
              withHorizontalLines={false}
              withVerticalLines={false}
              withDots={false}
              withShadow={false}
              style={styles.chart}
            />
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Progress Tracking</Text>
        <Text style={styles.subtitle}>Monitor your fitness journey</Text>
      </View>

      <View style={styles.sectionsContainer}>
        {Object.entries(SECTIONS).map(([key, section]) => (
          <Pressable
            key={key}
            style={[
              styles.sectionButton,
              selectedSection === key && styles.selectedSection
            ]}
            onPress={() => setSelectedSection(key as keyof typeof SECTIONS)}
          >
            <Ionicons 
              name={section.icon as any} 
              size={20} 
              color={selectedSection === key ? colors.primary.light : colors.primary.dark} 
            />
            <Text style={[
              styles.sectionButtonText,
              selectedSection === key && styles.selectedSectionText
            ]}>
              {section.title}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{SECTIONS[selectedSection].title}</Text>
          <Pressable 
            style={styles.viewAllButton}
            onPress={() => setShowMetricDetails(true)}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary.dark} />
          </Pressable>
        </View>

        <View style={styles.metricsGrid}>
          {loading ? (
            <Text style={styles.loadingText}>Loading metrics...</Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            metrics
              .filter(m => SECTIONS[selectedSection].metrics.includes(m.metric))
              .map(renderMetricCard)
          )}
        </View>

        <Pressable 
          style={styles.addButton}
          onPress={() => setShowMeasurementInput(true)}
        >
          <Ionicons name="add" size={24} color={colors.primary.light} />
          <Text style={styles.addButtonText}>Add Measurements</Text>
        </Pressable>
      </ScrollView>

      {showMeasurementInput && (
        <Modal
          visible={showMeasurementInput}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMeasurementInput(false)}
        >
          <MeasurementInput
            onClose={() => setShowMeasurementInput(false)}
            onSave={handleAddMeasurement}
            section={selectedSection}
          />
        </Modal>
      )}

      {showMetricDetails && (
        <Modal
          visible={showMetricDetails}
          transparent
          animationType="slide"
          onRequestClose={() => setShowMetricDetails(false)}
        >
          <MetricDetails
            onClose={() => setShowMetricDetails(false)}
            metrics={metrics.filter(m => SECTIONS[selectedSection].metrics.includes(m.metric))}
            section={selectedSection}
            onToggleFavorite={handleToggleFavorite}
            favoriteMetrics={favoriteMetrics}
          />
        </Modal>
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
    padding: spacing.md,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.gray[500],
  },
  sectionsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
  },
  selectedSection: {
    backgroundColor: colors.primary.dark,
  },
  sectionButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
  },
  selectedSectionText: {
    color: colors.primary.light,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  viewAllText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  metricCardContent: {
    flex: 1,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
    textTransform: 'capitalize',
  },
  changeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  changeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium as any,
  },
  metricValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.sm,
  },
  chartContainer: {
    marginHorizontal: -spacing.md,
  },
  chart: {
    paddingRight: 0,
    borderRadius: borderRadius.lg,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary.dark,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.light,
  },
});