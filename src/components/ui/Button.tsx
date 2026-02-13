/**
 * Button Component
 * Shloka Sadhana - UI Library
 *
 * Reusable button with multiple variants, sizes, and full accessibility support
 */

import React, { useState } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  PressableProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSize, BorderRadius } from '@/constants/Layout';
import { triggerHaptic } from '@/utils/haptics';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Button variant - determines color scheme */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Button size - affects padding and font size */
  size?: 'small' | 'medium' | 'large';
  /** Button text content */
  children: string;
  /** Called when button is pressed */
  onPress: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button shows loading spinner */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom style override */
  style?: ViewStyle;
  /** Accessibility label (defaults to children text) */
  accessibilityLabel?: string;
  /** Accessibility hint for additional context */
  accessibilityHint?: string;
}

/**
 * Button component with consistent styling and accessibility
 *
 * @example
 * ```tsx
 * <Button
 *   variant="primary"
 *   size="medium"
 *   onPress={handleSubmit}
 * >
 *   Submit
 * </Button>
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  ...pressableProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (!disabled && !loading) {
      triggerHaptic('light');
      onPress();
    }
  };

  const isDisabledOrLoading = disabled || loading;

  // Get variant-specific styles
  const variantStyles = getVariantStyles(variant, isPressed);
  const sizeStyles = getSizeStyles(size);
  const focusStyles = isFocused ? getFocusStyles(variant) : {};

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={isDisabledOrLoading}
      style={[
        styles.base,
        variantStyles.container,
        sizeStyles.container,
        focusStyles,
        fullWidth && styles.fullWidth,
        isDisabledOrLoading && styles.disabled,
        style,
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || children}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: isDisabledOrLoading,
        busy: loading,
      }}
      {...pressableProps}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyles.text.color}
          accessibilityLabel="Loading"
        />
      ) : (
        <Text
          style={[
            styles.text,
            variantStyles.text,
            sizeStyles.text,
            isDisabledOrLoading && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};

/**
 * Get variant-specific styles (colors)
 */
function getVariantStyles(
  variant: ButtonProps['variant'],
  isPressed: boolean
): { container: ViewStyle; text: TextStyle } {
  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: isPressed ? Colors.primaryDark : Colors.primary,
        },
        text: {
          color: '#FFFFFF',
        },
      };

    case 'secondary':
      return {
        container: {
          backgroundColor: isPressed ? '#1565C0' : Colors.info,
        },
        text: {
          color: '#FFFFFF',
        },
      };

    case 'ghost':
      return {
        container: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isPressed
            ? Colors.text
            : (Colors.border as string),
        },
        text: {
          color: Colors.text,
        },
      };

    case 'danger':
      return {
        container: {
          backgroundColor: isPressed ? Colors.errorDark : Colors.error,
        },
        text: {
          color: '#FFFFFF',
        },
      };

    default:
      return {
        container: {
          backgroundColor: Colors.primary,
        },
        text: {
          color: '#FFFFFF',
        },
      };
  }
}

/**
 * Get focus indicator styles based on variant
 * Ensures focus is always visible regardless of button style
 */
function getFocusStyles(variant: ButtonProps['variant']): ViewStyle {
  // For ghost variant (which already has a border), we use a different approach
  if (variant === 'ghost') {
    return {
      borderWidth: 2,
      borderColor: Colors.primary,
      // Add subtle shadow for extra visibility
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 4, // Android shadow
    };
  }

  // For other variants, add an outline ring
  return {
    borderWidth: 3,
    borderColor: Colors.primary,
    // Slightly reduce padding to compensate for border
    paddingVertical: -1,
    paddingHorizontal: -1,
  };
}

/**
 * Get size-specific styles (padding, font size)
 */
function getSizeStyles(
  size: ButtonProps['size']
): { container: ViewStyle; text: TextStyle } {
  switch (size) {
    case 'small':
      return {
        container: {
          paddingVertical: Spacing.sm,
          paddingHorizontal: Spacing.md,
          minHeight: 36,
        },
        text: {
          fontSize: FontSize.sm,
        },
      };

    case 'medium':
      return {
        container: {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          minHeight: 44, // iOS HIG minimum touch target
        },
        text: {
          fontSize: FontSize.md,
        },
      };

    case 'large':
      return {
        container: {
          paddingVertical: Spacing.lg,
          paddingHorizontal: Spacing.xl,
          minHeight: 56,
        },
        text: {
          fontSize: FontSize.lg,
        },
      };

    default:
      return {
        container: {
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          minHeight: 44,
        },
        text: {
          fontSize: FontSize.md,
        },
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    opacity: 0.7,
  },
});
