/**
 * Timer Component
 * Shloka Sadhana - Practice Timer UI
 *
 * Displays timer and control buttons for practice sessions
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTimer } from '@/hooks/useTimer';

export interface TimerProps {
  onComplete?: (elapsedSeconds: number) => void;
}

/**
 * Timer button with focus indicator
 */
interface TimerButtonProps {
  onPress: () => void;
  label: string;
  style: any;
  disabled?: boolean;
  children: React.ReactNode;
}

const TimerButton: React.FC<TimerButtonProps> = ({
  onPress,
  label,
  style,
  disabled = false,
  children,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled}
      style={({ pressed }) => [
        style,
        pressed && !disabled && styles.pressed,
        isFocused && !disabled && styles.focused,
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {children}
    </Pressable>
  );
};

/**
 * Timer component with start, pause, resume, reset, and complete controls
 * Enforces minimum 60-second practice session requirement
 */
export const Timer: React.FC<TimerProps> = ({ onComplete }) => {
  const {
    status,
    elapsedSeconds,
    formattedTime,
    canComplete,
    start,
    pause,
    resume,
    reset,
    complete,
  } = useTimer({ onComplete });

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
          <TimerButton
            style={[styles.button, styles.primaryButton]}
            onPress={start}
            label="Start timer"
          >
            <Text style={styles.buttonText}>Start</Text>
          </TimerButton>
        );

      case 'running':
        return (
          <TimerButton
            style={[styles.button, styles.secondaryButton]}
            onPress={pause}
            label="Pause timer"
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TimerButton>
        );

      case 'paused':
        return (
          <TimerButton
            style={[styles.button, styles.primaryButton]}
            onPress={resume}
            label="Resume timer"
          >
            <Text style={styles.buttonText}>Resume</Text>
          </TimerButton>
        );

      case 'completed':
        return (
          <TimerButton
            style={[styles.button, styles.primaryButton]}
            onPress={reset}
            label="Start new session"
          >
            <Text style={styles.buttonText}>New Session</Text>
          </TimerButton>
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
        <TimerButton
          style={[styles.button, styles.tertiaryButton]}
          onPress={reset}
          label="Reset timer"
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TimerButton>

        <TimerButton
          style={[
            styles.button,
            canComplete ? styles.completeButton : styles.disabledButton,
          ]}
          onPress={complete}
          disabled={!canComplete}
          label="Complete practice session"
        >
          <Text
            style={[
              styles.buttonText,
              !canComplete && styles.disabledButtonText,
            ]}
          >
            Complete
          </Text>
        </TimerButton>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Completion Message */}
      {status === 'completed' && (
        <Text style={styles.completionMessage}>Practice Complete!</Text>
      )}

      {/* Timer Display */}
      <Text
        style={styles.timerDisplay}
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
};

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
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  completionMessage: {
    color: '#4CAF50',
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
    backgroundColor: '#424242',
  },
  disabledButtonText: {
    color: '#9E9E9E',
  },
  primaryAction: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#FF9800',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
  },
  tertiaryButton: {
    backgroundColor: '#757575',
  },
  timerDisplay: {
    color: '#FFFFFF',
    fontSize: 72,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginBottom: 32,
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
