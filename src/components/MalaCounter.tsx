/**
 * MalaCounter Component
 * Shloka Sadhana - Mala Bead Counter
 *
 * Tracks repetitions of prayers/mantras (108 beads = 1 mala)
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { triggerMedium, triggerHeavy, triggerLight } from '@/utils/haptics';

export interface MalaCounterProps {
  initialCount?: number;
  onChange?: (count: number) => void;
}

const BEADS_PER_MALA = 108;

/**
 * Mala counter component with increment/decrement/reset controls
 * Displays both bead count and completed mala count
 * Shows celebration animation when completing a mala
 */
export const MalaCounter: React.FC<MalaCounterProps> = ({
  initialCount = 0,
  onChange,
}) => {
  const [count, setCount] = useState(initialCount);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAnim] = useState(new Animated.Value(0));
  // Gentle meditative pulse on every tap
  const [pulseAnim] = useState(new Animated.Value(1));

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
   * Show celebration animation when completing a mala
   */
  const triggerCelebration = () => {
    setShowCelebration(true);

    // Animate celebration
    Animated.sequence([
      Animated.timing(celebrationAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCelebration(false);
    });
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

    // Trigger celebration and heavy haptic if completed a new mala
    if (newMalaCount > previousMalaCount) {
      triggerCelebration();
      triggerHeavy();
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
      {/* Celebration Indicator */}
      {showCelebration && (
        <Animated.View
          style={[
            styles.celebration,
            {
              opacity: celebrationAnim,
              transform: [
                {
                  scale: celebrationAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.5],
                  }),
                },
              ],
            },
          ]}
        >
          <Text
            style={styles.celebrationText}
            accessibilityLabel="Celebration: You completed a mala of 108 beads"
          >
            🎉
          </Text>
        </Animated.View>
      )}

      {/* Mala Count Display */}
      <Text
        style={styles.malaCount}
        accessibilityLabel={getMalaAccessibilityLabel()}
        accessibilityRole="text"
      >
        {getMalaText(count)}
      </Text>

      {/* Bead Count Display — gently pulses on each tap */}
      <Animated.Text
        style={[styles.countDisplay, { transform: [{ scale: pulseAnim }] }]}
        accessibilityLabel={getCountAccessibilityLabel()}
        accessibilityRole="text"
      >
        {count}
      </Animated.Text>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {/* Decrement Button */}
        <TouchableOpacity
          style={[styles.button, styles.decrementButton]}
          onPress={decrement}
          accessibilityLabel="Decrement count"
          accessibilityHint="Removes one bead from your count"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>

        {/* Increment Button */}
        <TouchableOpacity
          style={[styles.button, styles.incrementButton]}
          onPress={increment}
          accessibilityLabel="Increment count"
          accessibilityHint="Adds one bead to your count. You'll feel a vibration when you complete a mala of 108 beads"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Reset Button (only show when count > 0) */}
      {count > 0 && (
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={reset}
          accessibilityLabel="Reset count to zero"
          accessibilityHint="Sets your bead count back to zero"
          accessibilityRole="button"
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 40,
    elevation: 4,
    height: 80,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: 80,
  },
  buttonText: {
    color: '#FFF8E7',
    fontSize: 48,
    fontWeight: '700',
  },
  celebration: {
    position: 'absolute',
    top: 20,
    zIndex: 10,
  },
  celebrationText: {
    fontSize: 64,
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
    color: '#FFF8E7',           // Warm Cream
    fontSize: 96,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginBottom: 32,
  },
  decrementButton: {
    backgroundColor: '#7B3F00', // Dark amber — gentler than red
  },
  incrementButton: {
    backgroundColor: '#FF6B35', // Saffron — sacred fire energy
  },
  malaCount: {
    color: '#FFD700',           // Temple Gold
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: '#3D2560', // Indigo — recessive, non-intrusive
    borderRadius: 24,
    height: 48,
    width: 120,
  },
  resetButtonText: {
    color: '#C9A96E',           // Warm amber
    fontSize: 18,
    fontWeight: '600',
  },
});
