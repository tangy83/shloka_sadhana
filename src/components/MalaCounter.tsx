/**
 * MalaCounter Component
 * Shloka Sadhana - Mala Bead Counter
 *
 * Tracks repetitions of prayers/mantras (108 beads = 1 mala)
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { triggerMedium, triggerLight } from '@/utils/haptics';
import { Colors } from '@/constants/Colors';
import { glow } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { MalaCelebration } from '@/components/sacred';
import { checkReducedMotion } from '@/animations/sacredAnimations';

export interface MalaCounterProps {
  initialCount?: number;
  onChange?: (count: number) => void;
}

const BEADS_PER_MALA = 108;

/**
 * Mala counter component with increment/decrement/reset controls
 * Displays both bead count and completed mala count
 * Shows celebration animation when completing a mala
 * Sacred numbers (>= 108) glow gold
 */
export const MalaCounter: React.FC<MalaCounterProps> = ({
  initialCount = 0,
  onChange,
}) => {
  const { theme } = useTheme();
  const [count, setCount] = useState(initialCount);
  const [showCelebration, setShowCelebration] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Gentle meditative pulse on every tap
  const [pulseAnim] = useState(new Animated.Value(1));
  const celebrationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    checkReducedMotion().then(setReducedMotion);
    return () => {
      if (celebrationTimeout.current) clearTimeout(celebrationTimeout.current);
    };
  }, []);

  const isGlowing = count >= BEADS_PER_MALA;

  /**
   * Calculate number of completed malas
   */
  const getMalaCount = (beadCount: number): number => {
    return Math.floor(beadCount / BEADS_PER_MALA);
  };

  /**
   * Get formatted mala count text with proper singular/plural
   */
  const getMalaText = (beadCount: number): string => {
    const malaCount = getMalaCount(beadCount);
    if (malaCount === 1) {
      return '1 mala';
    }
    return `${malaCount} malas`;
  };

  /**
   * Trigger mala completion celebration.
   * MalaCelebration handles its own animation and haptic.
   * The boolean toggle (false → true) is the signal it watches for.
   */
  const triggerCelebration = () => {
    setShowCelebration(true);
    if (celebrationTimeout.current) clearTimeout(celebrationTimeout.current);
    celebrationTimeout.current = setTimeout(() => setShowCelebration(false), 900);
  };

  /**
   * Soft pulse animation on every tap — meditative, not jarring
   */
  const triggerPulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.06,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /**
   * Increment count by 1
   */
  const increment = () => {
    const newCount = count + 1;
    const previousMalaCount = getMalaCount(count);
    const newMalaCount = getMalaCount(newCount);

    setCount(newCount);
    onChange?.(newCount);
    triggerPulse();

    // Trigger celebration if completed a new mala (MalaCelebration owns the haptic)
    if (newMalaCount > previousMalaCount) {
      triggerCelebration();
    } else {
      triggerMedium();
    }
  };

  /**
   * Decrement count by 1 (minimum 0)
   */
  const decrement = () => {
    if (count === 0) {
      return;
    }

    const newCount = count - 1;
    setCount(newCount);
    onChange?.(newCount);

    // Light haptic for decrements
    triggerLight();
  };

  /**
   * Reset count to 0
   */
  const reset = () => {
    setCount(0);
    onChange?.(0);

    // Light haptic for reset
    triggerLight();
  };

  /**
   * Get accessible label for count
   */
  const getCountAccessibilityLabel = (): string => {
    return `Current count: ${count} beads`;
  };

  /**
   * Get accessible label for mala count
   */
  const getMalaAccessibilityLabel = (): string => {
    const malaCount = getMalaCount(count);
    if (malaCount === 1) {
      return 'Completed: 1 mala';
    }
    return `Completed: ${malaCount} malas`;
  };

  return (
    <View style={styles.container}>
      {/* Mala completion celebration — gold ring pulse + ember sparks */}
      <MalaCelebration active={showCelebration} reducedMotion={reducedMotion} />

      {/* Mala Count Display — glows gold when >= 1 mala completed */}
      <Text
        style={[styles.malaCount, isGlowing && glow.gold]}
        accessibilityLabel={getMalaAccessibilityLabel()}
        accessibilityRole="text"
      >
        {getMalaText(count)}
      </Text>

      {/* Bead Count Display — gently pulses on each tap; glows gold at >= 108 */}
      <Animated.Text
        style={[
          styles.countDisplay,
          { transform: [{ scale: pulseAnim }], color: theme.text },
          isGlowing && glow.gold,
        ]}
        accessibilityLabel={getCountAccessibilityLabel()}
        accessibilityRole="text"
      >
        {count}
      </Animated.Text>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {/* Decrement Button */}
        <TouchableOpacity
          style={[styles.button, styles.decrementButton, { backgroundColor: theme.surfaceElevated }]}
          onPress={decrement}
          accessibilityLabel="Decrement count"
          accessibilityHint="Removes one bead from your count"
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: theme.text }]}>−</Text>
        </TouchableOpacity>

        {/* Increment Button */}
        <TouchableOpacity
          style={[styles.button, styles.incrementButton]}
          onPress={increment}
          accessibilityLabel="Increment count"
          accessibilityHint="Adds one bead to your count. You'll feel a vibration when you complete a mala of 108 beads"
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: Colors.textOnColor }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Reset Button (only show when count > 0) */}
      {count > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.resetButton, { backgroundColor: theme.surfaceElevated }]}
          onPress={reset}
          accessibilityLabel="Reset count to zero"
          accessibilityHint="Sets your bead count back to zero"
          accessibilityRole="button"
        >
          <Text style={[styles.resetButtonText, { color: theme.textSecondary }]}>Reset</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  button: {
    alignItems: 'center',
    borderRadius: 40,
    elevation: 4,
    height: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: 80,
  },
  buttonText: {
    color: Colors.text,
    fontSize: 48,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  countDisplay: {
    color: Colors.text,           // Warm parchment cream
    fontSize: 96,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginBottom: 32,
  },
  decrementButton: {
    backgroundColor: Colors.surfaceElevated, // surfaceElevated — warm, recessive
  },
  incrementButton: {
    backgroundColor: Colors.primary, // Deep Saffron — sacred fire energy
  },
  malaCount: {
    color: Colors.templeGold,           // Temple Gold
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: Colors.surfaceElevated, // surfaceElevated — recessive, non-intrusive
    borderRadius: 24,
    height: 48,
    width: 120,
  },
  resetButtonText: {
    color: Colors.textSecondary,           // Soft amber
    fontSize: 18,
    fontWeight: '600',
  },
});
