import { View, Text, StyleSheet, ScrollView } from 'react-native';
import HabitTracker from '@/components/HabitTracker';
import { colors, spacing } from '@/constants/theme';

export default function HabitsPage() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <HabitTracker />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.light,
  },
});