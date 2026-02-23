/**
 * SacredButton
 * Shloka Sadhana — Animated pressable wrapper
 *
 * A button that responds like a sacred object — present, immediate, never aggressive.
 * On press-in: compresses slightly (scale 0.98) with a fast spring.
 * On press-out: returns to full presence.
 *
 * Uses RN Animated with useNativeDriver: true — runs on the native composited
 * layer, zero JS-thread involvement after the initial setup.
 *
 * Pure interaction layer — no visual opinions. Wrap any content with SacredButton.
 */

import React, { memo, useRef, useCallback } from 'react';
import { Animated, Pressable, StyleProp, ViewStyle } from 'react-native';

interface SacredButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export const SacredButton = memo(({
  onPress,
  children,
  style,
  accessibilityLabel,
  disabled = false,
}: SacredButtonProps) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 0.98,
      friction: 10,
      tension: 300,
      useNativeDriver: true,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- scale is a stable Animated.Value ref
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 10,
      tension: 300,
      useNativeDriver: true,
    }).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- scale is a stable Animated.Value ref
  }, []);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={disabled}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
});
SacredButton.displayName = 'SacredButton';
