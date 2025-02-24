import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function Logo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const iconSize = size === 'small' ? 20 : size === 'medium' ? 24 : 32;
  const fontSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;
  
  return (
    <View style={styles.container}>
      <BlurView intensity={80} style={styles.logoContainer}>
        <Ionicons name="fitness" size={iconSize} color="#000000" />
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
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  text: {
    fontWeight: '700',
  },
  fit: {
    color: '#000000',
  },
  squad: {
    color: '#8E8E93',
  },
});