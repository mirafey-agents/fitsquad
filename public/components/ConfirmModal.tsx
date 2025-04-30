import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '@/constants/theme';
import { useState } from 'react';

interface ConfirmModalProps {
  displayText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ displayText, onConfirm, onCancel }: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      await onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BlurView intensity={80} style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Confirm Action</Text>
          <Pressable
            style={[styles.closeButton, isLoading && styles.disabledButton]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Ionicons name="close" size={24} color={colors.gray[500]} />
          </Pressable>
        </View>
        <View style={styles.modalBody}>
          <Text style={styles.modalText}>{displayText}</Text>
          <View style={styles.modalActions}>
            <Pressable
              style={[styles.modalButton, styles.modalButtonCancel, isLoading && styles.disabledButton]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary.dark} />
              ) : (
                <Text style={styles.modalButtonText}>Cancel</Text>
              )}
            </Pressable>
            <Pressable
              style={[styles.modalButton, styles.modalButtonConfirm, isLoading && styles.disabledButton]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary.light} />
              ) : (
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  Confirm
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.primary.light,
    borderRadius: 12,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary.dark,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    alignItems: 'center',
  },
  modalText: {
    fontSize: typography.size.md,
    color: colors.gray[700],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  modalButtonCancel: {
    backgroundColor: colors.gray[200],
  },
  modalButtonConfirm: {
    backgroundColor: colors.semantic.error,
  },
  modalButtonText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary.dark,
  },
  modalButtonTextConfirm: {
    color: colors.primary.light,
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 