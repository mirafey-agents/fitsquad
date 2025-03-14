import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../constants/theme';

interface MetricDetailsProps {
  onClose: () => void;
  metrics: any[];
  section: 'body' | 'medical' | 'performance';
  onToggleFavorite: (metric: string) => void;
  favoriteMetrics: string[];
}

const SECTION_DETAILS = {
  body: {
    title: 'Body Measurements',
    description: 'Track your physical measurements over time',
  },
  medical: {
    title: 'Medical Parameters',
    description: 'Monitor your health indicators',
  },
  performance: {
    title: 'Performance Metrics',
    description: 'Track your fitness progress',
  },
};

export default function MetricDetails({ onClose, metrics, section, onToggleFavorite, favoriteMetrics }: MetricDetailsProps) {
  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{SECTION_DETAILS[section].title}</Text>
            <Text style={styles.description}>{SECTION_DETAILS[section].description}</Text>
          </View>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray[500]} />
          </Pressable>
        </View>

        <ScrollView style={styles.metrics}>
          {metrics.map((metric) => (
            <View key={metric.metric} style={styles.metricCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricTitle}>{metric.metric}</Text>
                <Pressable
                  style={styles.favoriteButton}
                  onPress={() => onToggleFavorite(metric.metric)}
                >
                  <Ionicons 
                    name={favoriteMetrics.includes(metric.metric) ? "star" : "star-outline"} 
                    size={24} 
                    color={favoriteMetrics.includes(metric.metric) ? colors.semantic.warning : colors.gray[400]} 
                  />
                </Pressable>
              </View>

              <LineChart
                data={{
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
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
                width={Dimensions.get('window').width - 64}
                height={200}
                chartConfig={{
                  backgroundColor: colors.primary.light,
                  backgroundGradientFrom: colors.primary.light,
                  backgroundGradientTo: colors.primary.light,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={styles.chart}
              />

              <View style={styles.metricStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Current</Text>
                  <Text style={styles.statValue}>{metric.value}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Change</Text>
                  <Text style={[
                    styles.statValue,
                    { color: metric.change > 0 ? colors.semantic.success : colors.semantic.error }
                  ]}>
                    {metric.change > 0 ? '+' : ''}{metric.change}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Progress</Text>
                  <Text style={[
                    styles.statValue,
                    { color: metric.changePercentage > 0 ? colors.semantic.success : colors.semantic.error }
                  ]}>
                    {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage}%
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    backgroundColor: colors.primary.light,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  closeButton: {
    padding: spacing.sm,
  },
  metrics: {
    padding: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  metricTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  favoriteButton: {
    padding: spacing.sm,
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  metricStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
});