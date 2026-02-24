/**
 * Timer Component
 * Shloka Sadhana - Practice Timer UI
 *
 * Displays timer and control buttons for practice sessions
 */

import React from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { TimerStatus } from '@/hooks/useTimer';
import { useTheme } from '@/contexts/ThemeContext';

export interface TimerProps {
  status: TimerStatus;
  elapsedSeconds: number;
  formattedTime: string;
  canComplete: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onComplete: () => void;
}

/**
 * Timer component with start, pause, resume, reset, and complete controls
 * Enforces minimum 60-second practice session requirement
 * This is a controlled component - all state is managed by the parent
 */
export const Timer: React.FC<TimerProps> = React.memo(({
  status,
  elapsedSeconds,
  formattedTime,
  canComplete,
  onStart,
  onPause,
  onResume,
  onReset,
  onComplete,
}) => {
  const { theme } = useTheme();

  /**
   * Get accessible label for timer display
   */
  const getTimerAccessibilityLabel = (): string => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const minuteText = minutes === 1 ? 'minute' : 'minutes';
    const secondText = seconds === 1 ? 'second' : 'seconds';

    if (minutes === 0) {
      return `Elapsed time: ${seconds} ${secondText}`;
    }
    return `Elapsed time: ${minutes} ${minuteText} ${seconds} ${secondText}`;
  };

  /**
   * Render primary action button based on timer status
   */
  const renderPrimaryButton = () => {
    switch (status) {
      case 'idle':
        return (
          <Pressable
            style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.pressed]}
            onPress={onStart}
            accessibilityLabel="Start timer"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Start</Text>
          </Pressable>
        );

      case 'running':
        return (
          <Pressable
            style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.pressed]}
            onPress={onPause}
            accessibilityLabel="Pause timer"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Pause</Text>
          </Pressable>
        );

      case 'paused':
        return (
          <Pressable
            style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.pressed]}
            onPress={onResume}
            accessibilityLabel="Resume timer"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Resume</Text>
          </Pressable>
        );

      case 'completed':
        return (
          <Pressable
            style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.pressed]}
            onPress={onReset}
            accessibilityLabel="Start new session"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>New Session</Text>
          </Pressable>
        );

      default:
        return null;
    }
  };

  /**
   * Render secondary action buttons
   */
  const renderSecondaryButtons = () => {
    if (status === 'idle' || status === 'completed') {
      return null;
    }

    return (
      <View style={styles.secondaryActions}>
        <Pressable
          style={({ pressed }) => [styles.button, styles.tertiaryButton, { backgroundColor: theme.surfaceSecondary }, pressed && styles.pressed]}
          onPress={onReset}
          accessibilityLabel="Reset timer"
          accessibilityRole="button"
        >
          <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Reset</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            canComplete
              ? [styles.completeButton, { backgroundColor: theme.success }]
              : [styles.disabledButton, { backgroundColor: theme.surfaceElevated }],
            canComplete && pressed && styles.pressed,
          ]}
          onPress={canComplete ? onComplete : undefined}
          accessibilityLabel="Complete practice session"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canComplete }}
        >
          <Text
            style={[
              styles.buttonText,
              !canComplete && [styles.disabledButtonText, { color: theme.textSecondary }],
            ]}
          >
            Complete
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Completion Message */}
      {status === 'completed' && (
        <Text style={[styles.completionMessage, { color: theme.success }]}>Practice Complete!</Text>
      )}

      {/* Timer Display */}
      <Text
        style={[styles.timerDisplay, { color: theme.textBright }]}
        accessibilityLabel={getTimerAccessibilityLabel()}
        accessibilityRole="timer"
      >
        {formattedTime}
      </Text>

      {/* Primary Action Button */}
      <View style={styles.primaryAction}>{renderPrimaryButton()}</View>

      {/* Secondary Action Buttons */}
      {renderSecondaryButtons()}
    </View>
  );
});

Timer.displayName = 'Timer';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    justifyContent: 'center',
    minWidth: 120,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonText: {
    color: Colors.textOnColor,  // cream on colored button backgrounds
    fontSize: 18,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
  completionMessage: {
    color: Colors.success,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  disabledButton: {
    backgroundColor: Colors.surfaceElevated,  // muted warm amber — disabled state
  },
  disabledButtonText: {
    color: Colors.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
  primaryAction: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: Colors.primary,  // saffron — on-brand pause button
  },
  tertiaryButton: {
    backgroundColor: Colors.textSecondary,
  },
  timerDisplay: {
    color: Colors.textBright,
    fontSize: 72,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginBottom: 32,
  },
});
