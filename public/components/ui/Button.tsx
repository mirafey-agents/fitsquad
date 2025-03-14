import React from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  View,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: any;
}

export default function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    disabled && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  const iconColor = 
    disabled ? colors.gray[400] :
    variant === 'primary' ? colors.primary.light :
    variant === 'secondary' ? colors.accent.coral :
    variant === 'outline' || variant === 'ghost' ? colors.primary.dark : colors.primary.light;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? colors.primary.light : colors.primary.dark} 
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={iconSize} 
              color={iconColor} 
              style={styles.leftIcon} 
            />
          )}
          <Text style={textStyles}>{label}</Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={iconSize} 
              color={iconColor} 
              style={styles.rightIcon} 
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary.dark,
  },
  secondaryButton: {
    backgroundColor: colors.accent.coral,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary.dark,
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  smButton: {
    height: 36,
    paddingHorizontal: spacing.sm,
  },
  mdButton: {
    height: 44,
    paddingHorizontal: spacing.md,
  },
  lgButton: {
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    backgroundColor: colors.gray[200],
    borderColor: colors.gray[300],
  },
  text: {
    fontWeight: typography.weight.medium as any,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.primary.light,
  },
  secondaryText: {
    color: colors.primary.light,
  },
  outlineText: {
    color: colors.primary.dark,
  },
  ghostText: {
    color: colors.primary.dark,
  },
  smText: {
    fontSize: typography.size.sm,
  },
  mdText: {
    fontSize: typography.size.md,
  },
  lgText: {
    fontSize: typography.size.lg,
  },
  disabledText: {
    color: colors.gray[500],
  },
  leftIcon: {
    marginRight: spacing.xs,
  },
  rightIcon: {
    marginLeft: spacing.xs,
  },
});