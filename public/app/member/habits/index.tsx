import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HabitTracker from '@/components/HabitTracker';
import { colors, spacing } from '@/constants/theme';

export default function HabitsPage() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <HabitTracker />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.primary.light,
  },
  content: {
    flex: 1,
    height: '100%',
    padding: spacing.md,
  },
});