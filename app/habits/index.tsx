import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HabitTracker from '../components/HabitTracker';
import AccountabilityPartner from '../components/AccountabilityPartner';
import { colors, spacing } from '../constants/theme';

export default function HabitsPage() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <HabitTracker />
        <AccountabilityPartner />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
  content: {
    padding: spacing.md,
  },
});