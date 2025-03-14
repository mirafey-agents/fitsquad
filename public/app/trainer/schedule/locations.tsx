import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../../../constants/theme';
import { supabase } from '../../../utils/supabase';

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  type: 'studio' | 'gym' | 'outdoor' | 'client';
  premium: boolean;
  sessionCount: number;
  averageRating: number;
  travelTimes: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

const LOCATION_TYPES = {
  studio: {
    icon: 'fitness',
    color: colors.semantic.success,
  },
  gym: {
    icon: 'barbell',
    color: colors.semantic.warning,
  },
  outdoor: {
    icon: 'sunny',
    color: colors.semantic.info,
  },
  client: {
    icon: 'home',
    color: colors.accent.coral,
  },
};

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalLocations: 0,
    premiumLocations: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch locations from Supabase
      const { data, error: fetchError } = await supabase
        .from('training_locations')
        .select('*');

      if (fetchError) throw fetchError;

      const transformedLocations = (data || []).map(location => ({
        ...location,
        sessionCount: 0, // Default value
        averageRating: location.rating || 0,
        travelTimes: {
          morning: 0,
          afternoon: 0,
          evening: 0
        }
      }));

      // Calculate stats
      const stats = {
        totalLocations: transformedLocations.length,
        premiumLocations: transformedLocations.filter(l => l.premium).length,
        averageRating: transformedLocations.length > 0 
          ? transformedLocations.reduce((acc, loc) => acc + (loc.rating || 0), 0) / transformedLocations.length
          : 0
      };

      setLocations(transformedLocations);
      setStats(stats);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location => {
    const matchesSearch = (location.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (location.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || location.type === selectedType;
    return matchesSearch && matchesType;
  });

  const calculateOptimalLocation = () => {
    // This would implement the location optimization algorithm
    // For now, we'll just return a simple recommendation
    const clientDensityMap = new Map<string, number>();
    
    locations.forEach(location => {
      const area = location.address?.split(',')[1]?.trim() || 'Unknown';
      if (area) {
        clientDensityMap.set(area, (clientDensityMap.get(area) || 0) + (location.sessionCount || 0));
      }
    });

    let maxDensityArea = '';
    let maxDensity = 0;
    
    clientDensityMap.forEach((density, area) => {
      if (density > maxDensity) {
        maxDensity = density;
        maxDensityArea = area;
      }
    });

    return {
      area: maxDensityArea,
      density: maxDensity,
    };
  };

  const optimalLocation = calculateOptimalLocation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.primary.dark} />
        </Pressable>
        <Text style={styles.title}>Training Locations</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => router.push('/trainer-dashboard/schedule/locations/add')}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.gray[500]} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.gray[400]}
          />
        </View>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.typeFilters}
        contentContainerStyle={styles.typeFiltersContent}
      >
        <Pressable
          style={[
            styles.typeFilter,
            !selectedType && styles.activeTypeFilter
          ]}
          onPress={() => setSelectedType(null)}
        >
          <Text style={[
            styles.typeFilterText,
            !selectedType && styles.activeTypeFilterText
          ]}>All</Text>
        </Pressable>
        {Object.entries(LOCATION_TYPES).map(([type, config]) => (
          <Pressable
            key={type}
            style={[
              styles.typeFilter,
              selectedType === type && styles.activeTypeFilter
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Ionicons 
              name={config.icon as any} 
              size={16} 
              color={selectedType === type ? colors.primary.light : colors.primary.dark} 
            />
            <Text style={[
              styles.typeFilterText,
              selectedType === type && styles.activeTypeFilterText
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading locations...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Animated.View entering={FadeInUp.delay(100)}>
            <View style={styles.insightsCard}>
              <Text style={styles.insightsTitle}>Location Insights</Text>
              <View style={styles.insightStats}>
                <View style={styles.insightStat}>
                  <Text style={styles.insightValue}>
                    {stats.totalLocations}
                  </Text>
                  <Text style={styles.insightLabel}>Total Locations</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightValue}>
                    {stats.premiumLocations}
                  </Text>
                  <Text style={styles.insightLabel}>Premium Venues</Text>
                </View>
                <View style={styles.insightStat}>
                  <Text style={styles.insightValue}>
                    {stats.averageRating.toFixed(1)}
                  </Text>
                  <Text style={styles.insightLabel}>Avg Rating</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200)}>
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Ionicons name="bulb" size={24} color={colors.semantic.warning} />
                <Text style={styles.recommendationTitle}>Suggested Expansion</Text>
              </View>
              <Text style={styles.recommendationText}>
                Based on client density and booking patterns, consider adding a new location in{' '}
                <Text style={styles.highlightText}>{optimalLocation.area}</Text>
              </Text>
              <View style={styles.recommendationStats}>
                <View style={styles.recommendationStat}>
                  <Text style={styles.statLabel}>Client Density</Text>
                  <Text style={styles.statValue}>High</Text>
                </View>
                <View style={styles.recommendationStat}>
                  <Text style={styles.statLabel}>Competition</Text>
                  <Text style={styles.statValue}>Low</Text>
                </View>
                <View style={styles.recommendationStat}>
                  <Text style={styles.statLabel}>Potential ROI</Text>
                  <Text style={styles.statValue}>85%</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <View style={styles.locationsList}>
            {filteredLocations.map((location, index) => (
              <Animated.View
                key={location.id}
                entering={FadeInUp.delay(300 + index * 100)}
              >
                <Pressable 
                  style={styles.locationCard}
                  onPress={() => router.push(`/trainer-dashboard/schedule/locations/${location.id}`)}
                >
                  <View style={styles.locationHeader}>
                    <View style={styles.locationInfo}>
                      <View style={styles.locationTypeIcon}>
                        <Ionicons 
                          name={LOCATION_TYPES[location.type].icon as any}
                          size={24}
                          color={LOCATION_TYPES[location.type].color}
                        />
                      </View>
                      <View>
                        <Text style={styles.locationName}>{location.name}</Text>
                        <Text style={styles.locationAddress}>{location.address}</Text>
                      </View>
                    </View>
                    {location.premium && (
                      <BlurView intensity={80} style={styles.premiumBadge}>
                        <Ionicons name="star" size={12} color={colors.semantic.warning} />
                        <Text style={styles.premiumText}>Premium</Text>
                      </BlurView>
                    )}
                  </View>

                  <View style={styles.locationStats}>
                    <View style={styles.locationStat}>
                      <Text style={styles.statLabel}>Sessions</Text>
                      <Text style={styles.statValue}>{location.sessionCount}</Text>
                    </View>
                    <View style={styles.locationStat}>
                      <Text style={styles.statLabel}>Rating</Text>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={colors.semantic.warning} />
                        <Text style={styles.ratingText}>{(location.averageRating || 0).toFixed(1)}</Text>
                      </View>
                    </View>
                    <View style={styles.locationStat}>
                      <Text style={styles.statLabel}>Travel Time</Text>
                      <Text style={styles.statValue}>
                        {location.travelTimes?.morning || 0} min
                      </Text>
                    </View>
                  </View>

                  <View style={styles.travelTimes}>
                    <Text style={styles.travelTimesTitle}>Average Travel Time</Text>
                    <View style={styles.travelTimeSlots}>
                      <View style={styles.travelTimeSlot}>
                        <Text style={styles.slotLabel}>Morning</Text>
                        <Text style={styles.slotTime}>
                          {location.travelTimes?.morning || 0} min
                        </Text>
                      </View>
                      <View style={styles.travelTimeSlot}>
                        <Text style={styles.slotLabel}>Afternoon</Text>
                        <Text style={styles.slotTime}>
                          {location.travelTimes?.afternoon || 0} min
                        </Text>
                      </View>
                      <View style={styles.travelTimeSlot}>
                        <Text style={styles.slotLabel}>Evening</Text>
                        <Text style={styles.slotTime}>
                          {location.travelTimes?.evening || 0} min
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
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
  addButton: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  addButtonText: {
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
  typeFilters: {
    backgroundColor: colors.primary.light,
  },
  typeFiltersContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  typeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.full,
  },
  activeTypeFilter: {
    backgroundColor: colors.primary.dark,
  },
  typeFilterText: {
    fontSize: typography.size.sm,
    color: colors.primary.dark,
    fontWeight: typography.weight.medium as any,
  },
  activeTypeFilterText: {
    color: colors.primary.light,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  insightsCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  insightsTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.md,
  },
  insightStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightStat: {
    alignItems: 'center',
  },
  insightValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  insightLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  recommendationCard: {
    backgroundColor: colors.semantic.warning + '08',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.semantic.warning + '20',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  recommendationTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  recommendationText: {
    fontSize: typography.size.md,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  highlightText: {
    color: colors.semantic.warning,
    fontWeight: typography.weight.semibold as any,
  },
  recommendationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  recommendationStat: {
    alignItems: 'center',
  },
  locationsList: {
    gap: spacing.md,
  },
  locationCard: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
    marginBottom: spacing.xs,
  },
  locationAddress: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.semantic.warning + '20',
  },
  premiumText: {
    fontSize: typography.size.xs,
    color: colors.semantic.warning,
    fontWeight: typography.weight.medium as any,
  },
  locationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  locationStat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.primary.dark,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold as any,
    color: colors.semantic.warning,
  },
  travelTimes: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  travelTimesTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.gray[500],
    marginBottom: spacing.sm,
  },
  travelTimeSlots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  travelTimeSlot: {
    alignItems: 'center',
  },
  slotLabel: {
    fontSize: typography.size.xs,
    color: colors.gray[500],
    marginBottom: spacing.xs,
  },
  slotTime: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium as any,
    color: colors.primary.dark,
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
  },
});