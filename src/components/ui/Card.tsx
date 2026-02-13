/**
 * Card Component
 * Shloka Sadhana - UI Library
 *
 * Standardized card container with elevation and consistent styling
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Pressable,
  PressableProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius } from '@/constants/Layout';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Padding inside card */
  padding?: keyof typeof Spacing | number;
  /** Border radius */
  borderRadius?: keyof typeof BorderRadius | number;
  /** Background color */
  backgroundColor?: string;
  /** Elevation/shadow level (0-5) */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Border color (optional) */
  borderColor?: string;
  /** Border width (optional) */
  borderWidth?: number;
  /** Custom style override */
  style?: ViewStyle;
  /** Make card pressable */
  onPress?: () => void;
  /** Pressable props (only used if onPress is provided) */
  pressableProps?: Omit<PressableProps, 'style' | 'onPress' | 'children'>;
  /** Accessibility label (required if pressable) */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
}

/**
 * Card component for consistent container styling across the app
 *
 * @example
 * ```tsx
 * <Card padding="md" elevation={2}>
 *   <Text>Card content</Text>
 * </Card>
 * ```
 *
 * @example
 * ```tsx
 * // Pressable card
 * <Card
 *   onPress={() => navigation.navigate('Detail')}
 *   accessibilityLabel="View details"
 * >
 *   <Text>Tap me</Text>
 * </Card>
 * ```
 */
export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  borderRadius = 'md',
  backgroundColor = '#1E1E1E',
  elevation = 1,
  borderColor,
  borderWidth,
  style,
  onPress,
  pressableProps,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Resolve padding value
  const paddingValue =
    typeof padding === 'number' ? padding : Spacing[padding];

  // Resolve border radius value
  const borderRadiusValue =
    typeof borderRadius === 'number' ? borderRadius : BorderRadius[borderRadius];

  // Elevation styles (shadow)
  const elevationStyle = getElevationStyle(elevation);

  const containerStyle: ViewStyle = {
    backgroundColor,
    padding: paddingValue,
    borderRadius: borderRadiusValue,
    ...(borderColor && borderWidth ? { borderColor, borderWidth } : {}),
    ...elevationStyle,
  };

  // If pressable, wrap in Pressable
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          containerStyle,
          pressed && styles.pressed,
          isFocused && styles.focused,
          style,
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        {...pressableProps}
      >
        {children}
      </Pressable>
    );
  }

  // Otherwise, just a View
  return <View style={[containerStyle, style]}>{children}</View>;
};

/**
 * Get elevation/shadow styles based on level
 */
function getElevationStyle(elevation: CardProps['elevation']): ViewStyle {
  switch (elevation) {
    case 0:
      return {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      };

    case 1:
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
      };

    case 2:
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
      };

    case 3:
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
      };

    case 4:
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      };

    case 5:
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      };

    default:
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
      };
  }
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  focused: {
    borderWidth: 2,
    borderColor: Colors.primary,
    // Add shadow for visibility
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
});
