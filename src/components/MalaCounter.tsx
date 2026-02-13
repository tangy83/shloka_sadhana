/**
 * MalaCounter Component
 * Shloka Sadhana - Mala Bead Counter
 *
 * Tracks repetitions of prayers/mantras (108 beads = 1 mala)
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { triggerMedium, triggerHeavy, triggerLight } from '@/utils/haptics';

export interface MalaCounterProps {
  initialCount?: number;
  onChange?: (count: number) => void;
}

const BEADS_PER_MALA = 108;

/**
 * Counter button with focus indicator
 */
interface CounterButtonProps {
  onPress: () => void;
  label: string;
  hint: string;
  style: any;
  children: React.ReactNode;
}

const CounterButton: React.FC<CounterButtonProps> = ({
  onPress,
  label,
  hint,
  style,
  children,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={({ pressed }) => [
        style,
        pressed && styles.pressed,
        isFocused && styles.focused,
      ]}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
    >
      {children}
    </Pressable>
  );
};

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
   * Increment count by 1
   */
  const increment = () => {
    const newCount = count + 1;
    const previousMalaCount = getMalaCount(count);
    const newMalaCount = getMalaCount(newCount);

    setCount(newCount);
    onChange?.(newCount);

    // Trigger celebration and heavy haptic if completed a new mala
    if (newMalaCount > previousMalaCount) {
      triggerCelebration();
      triggerHeavy();
      // Announce mala completion to screen readers
      const malaText = newMalaCount === 1 ? 'first mala' : `mala number ${newMalaCount}`;
      AccessibilityInfo.announceForAccessibility(
        `Congratulations! You've completed your ${malaText} of 108 beads!`
      );
    } else {
      // Medium haptic for regular increments
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

      {/* Bead Count Display */}
      <Text
        style={styles.countDisplay}
        accessibilityLabel={getCountAccessibilityLabel()}
        accessibilityRole="text"
      >
        {count}
      </Text>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {/* Decrement Button */}
        <CounterButton
          style={[styles.button, styles.decrementButton]}
          onPress={decrement}
          label="Decrement count"
          hint="Removes one bead from your count"
        >
          <Text style={styles.buttonText}>−</Text>
        </CounterButton>

        {/* Increment Button */}
        <CounterButton
          style={[styles.button, styles.incrementButton]}
          onPress={increment}
          label="Increment count"
          hint="Adds one bead to your count. You'll feel a vibration when you complete a mala of 108 beads"
        >
          <Text style={styles.buttonText}>+</Text>
        </CounterButton>
      </View>

      {/* Reset Button (only show when count > 0) */}
      {count > 0 && (
        <CounterButton
          style={[styles.button, styles.resetButton]}
          onPress={reset}
          label="Reset count to zero"
          hint="Sets your bead count back to zero"
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </CounterButton>
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    fontSize: 96,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginBottom: 32,
  },
  decrementButton: {
    backgroundColor: '#F44336',
  },
  incrementButton: {
    backgroundColor: '#4CAF50',
  },
  malaCount: {
    color: '#FF9800',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  resetButton: {
    backgroundColor: '#757575',
    borderRadius: 24,
    height: 48,
    width: 120,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  focused: {
    borderWidth: 3,
    borderColor: '#FF9800', // Primary orange color
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
});
