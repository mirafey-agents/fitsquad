import { View, Text, StyleSheet, ScrollView, Image, ImageBackground, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '@/constants/theme';
import { useSessions } from '@/app/context/SessionsContext';
import TrainerInputs from './session';
import { LinearGradient } from 'expo-linear-gradient';

export default function Insights() {
  const { refreshSessions } = useSessions();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    refreshSessions();
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.row}>
          <View style={styles.row3}>
            <Text style={styles.title2}>Workouts</Text>
          </View>
        </View>
        <View style={styles.content}>
          <TrainerInputs loading={loading} error={error} cardGradient={["#21262F", "#353D45"]} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C23',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#181C23',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  image3: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  title2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
}); 