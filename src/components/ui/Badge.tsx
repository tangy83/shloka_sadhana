/**
 * Badge Component
 * Shloka Sadhana - UI Library
 *
 * Small label/tag for status indicators, categories, and labels
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSize, BorderRadius } from '@/constants/Layout';

export interface BadgeProps {
  /** Badge text content */
  children: string;
  /** Badge variant - determines color scheme */
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral';
  /** Badge size */
  size?: 'small' | 'medium' | 'large';
  /** Custom background color (overrides variant) */
  backgroundColor?: string;
  /** Custom text color */
  textColor?: string;
  /** Custom style override */
  style?: ViewStyle;
  /** Icon element (optional) */
  icon?: React.ReactNode;
}

/**
 * Badge component for displaying status, categories, or labels
 *
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * ```
 *
 * @example
 * ```tsx
 * <Badge
 *   variant="primary"
 *   size="small"
 *   icon={<Text>🔥</Text>}
 * >
 *   15 Day Streak
 * </Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'medium',
  backgroundColor,
  textColor,
  style,
  icon,
}) => {
  const variantStyles = getVariantStyles(variant);
  const sizeStyles = getSizeStyles(size);

  const containerStyle: ViewStyle = {
    backgroundColor: backgroundColor || variantStyles.backgroundColor,
  };

  const textStyle: TextStyle = {
    color: textColor || variantStyles.textColor,
  };

  return (
    <View
      style={[
        styles.container,
        containerStyle,
        sizeStyles.container,
        style,
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={children}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, textStyle, sizeStyles.text]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
};

/**
 * Get variant-specific styles (colors)
 */
function getVariantStyles(
  variant: BadgeProps['variant']
): { backgroundColor: string; textColor: string } {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: Colors.primary,
        textColor: '#FFFFFF',
      };

    case 'success':
      return {
        backgroundColor: Colors.success,
        textColor: '#FFFFFF',
      };

    case 'error':
      return {
        backgroundColor: Colors.error,
        textColor: '#FFFFFF',
      };

    case 'warning':
      return {
        backgroundColor: Colors.warning,
        textColor: '#000000',
      };

    case 'info':
      return {
        backgroundColor: Colors.info,
        textColor: '#FFFFFF',
      };

    case 'neutral':
      return {
        backgroundColor: '#2E2E2E',
        textColor: Colors.text,
      };

    default:
      return {
        backgroundColor: '#2E2E2E',
        textColor: Colors.text,
      };
  }
}

/**
 * Get size-specific styles
 */
function getSizeStyles(
  size: BadgeProps['size']
): { container: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: 2,
          paddingHorizontal: Spacing.xs,
          borderRadius: BorderRadius.xs,
        },
        text: {
          fontSize: FontSize.xs,
        },
      };

    case 'medium':
      return {
        container: {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          borderRadius: BorderRadius.xs,
        },
        text: {
          fontSize: FontSize.sm,
        },
      };

    case 'large':
      return {
        container: {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          borderRadius: BorderRadius.sm,
        },
        text: {
          fontSize: FontSize.md,
        },
      };

    default:
      return {
        container: {
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          borderRadius: BorderRadius.xs,
        },
        text: {
          fontSize: FontSize.sm,
        },
      };
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
