import { Pressable, Share, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareButtonProps {
  onShare: () => Promise<string>;
  size?: number;
  color?: string;
}

export default function ShareButton({ onShare, size = 24, color = '#4F46E5' }: ShareButtonProps) {
  const handleShare = async () => {
    try {
      const shareText = await onShare();
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            text: shareText,
          });
        } else {
          await navigator.clipboard.writeText(shareText);
          // You might want to show a toast here
        }
      } else {
        await Share.share({
          message: shareText,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handleShare}
    >
      <Ionicons name="share-social" size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});