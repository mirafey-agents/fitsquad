import React, { ReactNode } from 'react';
import { StyleSheet, View, Pressable, Text } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';
import Animated, { FadeInUp } from 'react-native-reanimated';

interface CardProps {
  children: ReactNode;
  style?: any;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  animated?: boolean;
  delay?: number;
  header?: {
    title?: string;
    subtitle?: string;
    rightElement?: ReactNode;
  };
  footer?: ReactNode;
}

export default function Card({
  children,
  style,
  onPress,
  elevation = 'md',
  animated = false,
  delay = 0,
  header,
  footer,
}: CardProps) {
  const cardStyles = [
    styles.card,
    elevation !== 'none' && shadows[elevation],
    style,
  ];

  const CardComponent = onPress ? Pressable : View;
  const cardProps = onPress ? { onPress } : {};
  
  const content = (
    <CardComponent style={cardStyles} {...cardProps}>
      {header && (
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            {header.title && <Text style={styles.title}>{header.title}</Text>}
            {header.subtitle && <Text style={styles.subtitle}>{header.subtitle}</Text>}
          </View>
          {header.rightElement && (
            <View style={styles.headerRight}>
              {header.rightElement}
            </View>
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </CardComponent>
  );

  if (animated) {
    return (
      <Animated.View entering={FadeInUp.delay(delay)}>
        {content}
      </Animated.View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerRight: {
    marginLeft: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary.dark,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray[500],
  },
  content: {
    padding: spacing.md,
    paddingTop: 0,
  },
  footer: {
    padding: spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
});