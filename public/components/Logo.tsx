import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography } from '@/constants/theme';
import { Image } from 'expo-image';
export default function Logo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 24 : 32;
  const fontSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  
  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.logoContainer}>
        <Image source={require('@/assets/images/icon-transparent.png')}
        style={{ width: 40, height: 40 }} />
      </BlurView>
      <Text style={[styles.text, { fontSize }]}>
        <Text style={styles.fit}>Fit</Text>
        <Text style={styles.squad}>Squad</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  text: {
    fontWeight: typography.weight.bold as any,
  },
  fit: {
    color: colors.primary.dark,
  },
  squad: {
    color: colors.primary.light,
  },
});