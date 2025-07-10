import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { spacing } from '@/constants/theme';
import { useSessions } from '@/app/context/SessionsContext';
import TrainerInputs from './session';

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Workouts</Text>
        <View style={styles.content}>
          <TrainerInputs loading={loading} error={error} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070713',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#070713',
  },
  scrollContent: {
    paddingBottom: 32,
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
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 32,
    fontFamily: 'System',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: 16,
  },
}); 