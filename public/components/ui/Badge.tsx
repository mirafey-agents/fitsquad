import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: any;
}

export default function Badge({
  label,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  const badgeStyles = [
    styles.badge,
    styles[`${variant}Badge`],
    styles[`${size}Badge`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
  ];

  return (
    <View style={badgeStyles}>
      <Text style={textStyles} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weight.medium as any,
  },
  // Variants
  defaultBadge: {
    backgroundColor: colors.gray[200],
  },
  primaryBadge: {
    backgroundColor: colors.transparent.dark,
  },
  successBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  warningBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  errorBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  infoBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  // Text colors
  defaultText: {
    color: colors.gray[700],
  },
  primaryText: {
    color: colors.primary.dark,
  },
  successText: {
    color: colors.semantic.success,
  },
  warningText: {
    color: colors.semantic.warning,
  },
  errorText: {
    color: colors.semantic.error,
  },
  infoText: {
    color: colors.semantic.info,
  },
  // Sizes
  smBadge: {
    height: 20,
    paddingHorizontal: spacing.xs,
  },
  mdBadge: {
    height: 24,
    paddingHorizontal: spacing.sm,
  },
  lgBadge: {
    height: 28,
    paddingHorizontal: spacing.md,
  },
  smText: {
    fontSize: typography.size.xs,
  },
  mdText: {
    fontSize: typography.size.sm,
  },
  lgText: {
    fontSize: typography.size.md,
  },
});