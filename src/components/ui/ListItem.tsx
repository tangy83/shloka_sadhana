/**
 * ListItem Component
 * Shloka Sadhana - UI Library
 *
 * Reusable list row for Library, Settings, and other list views
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing, FontSize } from '@/constants/Layout';
import { triggerHaptic } from '@/utils/haptics';

export interface ListItemProps extends Omit<PressableProps, 'style' | 'children'> {
  /** Primary text */
  title: string;
  /** Secondary text (optional) */
  subtitle?: string;
  /** Left icon/element (optional) */
  leftElement?: React.ReactNode;
  /** Right icon/element (optional) */
  rightElement?: React.ReactNode;
  /** Called when item is pressed */
  onPress?: () => void;
  /** Whether to show chevron (> icon) on right */
  showChevron?: boolean;
  /** Whether item is disabled */
  disabled?: boolean;
  /** Custom container style */
  style?: ViewStyle;
  /** Accessibility label (defaults to title) */
  accessibilityLabel?: string;
  /** Accessibility hint */
  accessibilityHint?: string;
}

/**
 * ListItem component for consistent list rows
 *
 * @example
 * ```tsx
 * <ListItem
 *   title="Gayatri Mantra"
 *   subtitle="Morning prayer for wisdom"
 *   leftElement={<Text style={{ fontSize: 24 }}>🙏</Text>}
 *   onPress={() => navigation.navigate('ShlokaDetail')}
 *   showChevron
 * />
 * ```
 */
export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftElement,
  rightElement,
  onPress,
  showChevron = false,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  ...pressableProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handlePress = () => {
    if (!disabled && onPress) {
      triggerHaptic('light');
      onPress();
    }
  };

  const isPressable = !!onPress && !disabled;

  const content = (
    <View
      style={[
        styles.container,
        disabled && styles.containerDisabled,
        style,
      ]}
    >
      {/* Left element */}
      {leftElement && (
        <View style={styles.leftElement}>{leftElement}</View>
      )}

      {/* Text content */}
      <View style={styles.textContainer}>
        <Text
          style={[styles.title, disabled && styles.titleDisabled]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, disabled && styles.subtitleDisabled]}
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right element or chevron */}
      {rightElement && (
        <View style={styles.rightElement}>{rightElement}</View>
      )}
      {showChevron && !rightElement && (
        <Text style={styles.chevron}>›</Text>
      )}
    </View>
  );

  // If pressable, wrap in Pressable
  if (isPressable) {
    return (
      <Pressable
        onPress={handlePress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={({ pressed }) => [
          pressed && styles.pressed,
          isFocused && styles.focused,
        ]}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint || subtitle}
        accessibilityState={{ disabled }}
        {...pressableProps}
      >
        {content}
      </Pressable>
    );
  }

  // Otherwise, just a View
  return (
    <View
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  containerDisabled: {
    opacity: 0.5,
  },
  pressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  focused: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)', // Primary orange tint
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  leftElement: {
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  titleDisabled: {
    color: Colors.textDisabled,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: FontSize.sm * 1.4,
  },
  subtitleDisabled: {
    color: Colors.textDisabled,
  },
  rightElement: {
    marginLeft: Spacing.md,
  },
  chevron: {
    fontSize: 28,
    color: Colors.textTertiary,
    marginLeft: Spacing.sm,
  },
});
