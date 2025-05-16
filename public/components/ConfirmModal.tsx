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

const viewStyles = StyleSheet.create({
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
    backgroundColor: colors.gray[800],
    borderRadius: 12,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalBody: {
    alignItems: 'center',
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
  disabledButton: {
    opacity: 0.5,
  },
});

const textStyles = StyleSheet.create({
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: 'bold',
    color: colors.gray[200],
  },
  modalText: {
    fontSize: typography.size.md,
    color: colors.gray[300],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalButtonText: {
    fontSize: typography.size.sm,
    fontWeight: '500',
    color: colors.gray[200],
  },
  modalButtonTextConfirm: {
    color: colors.primary.light,
  },
});

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
    <BlurView intensity={80} style={viewStyles.modalOverlay}>
      <View style={viewStyles.modalContent}>
        <View style={viewStyles.modalHeader}>
          <Text style={textStyles.modalTitle}>Confirm Action</Text>
          <Pressable
            style={[viewStyles.closeButton, isLoading && viewStyles.disabledButton]}
            onPress={handleCancel}
            disabled={isLoading}
          >
            <Ionicons name="close" size={24} color={colors.gray[500]} />
          </Pressable>
        </View>
        <View style={viewStyles.modalBody}>
          <Text style={textStyles.modalText}>{displayText}</Text>
          <View style={viewStyles.modalActions}>
            <Pressable
              style={[viewStyles.modalButton, viewStyles.modalButtonCancel, isLoading && viewStyles.disabledButton]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary.dark} />
              ) : (
                <Text style={textStyles.modalButtonText}>Cancel</Text>
              )}
            </Pressable>
            <Pressable
              style={[viewStyles.modalButton, viewStyles.modalButtonConfirm, isLoading && viewStyles.disabledButton]}
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary.light} />
              ) : (
                <Text style={[textStyles.modalButtonText, textStyles.modalButtonTextConfirm]}>
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