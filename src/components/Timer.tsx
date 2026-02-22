/**
 * Timer Component
 * Shloka Sadhana - Practice Timer UI
 *
 * Displays timer and control buttons for practice sessions
 */

import React from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTimer } from '@/hooks/useTimer';

export interface TimerProps {
  onComplete?: (elapsedSeconds: number) => void;
}

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
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={start}
            accessibilityLabel="Start timer"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        );

      case 'running':
        return (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={pause}
            accessibilityLabel="Pause timer"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        );

      case 'paused':
        return (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={resume}
            accessibilityLabel="Resume timer"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        );

      case 'completed':
        return (
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={reset}
            accessibilityLabel="Start new session"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>New Session</Text>
          </TouchableOpacity>
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
        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={reset}
          accessibilityLabel="Reset timer"
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            canComplete ? styles.completeButton : styles.disabledButton,
          ]}
          onPress={complete}
          disabled={!canComplete}
          accessibilityLabel="Complete practice session"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canComplete }}
        >
          <Text
            style={[
              styles.buttonText,
              !canComplete && styles.disabledButtonText,
            ]}
          >
            Complete
          </Text>
        </TouchableOpacity>
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
    color: '#FFF8E7',
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
    color: Colors.textSecondary,
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
    backgroundColor: '#2196F3',
  },
  tertiaryButton: {
    backgroundColor: '#FFB74D',
  },
  timerDisplay: {
    color: '#FFF8E7',
    fontSize: 72,
    fontVariant: ['tabular-nums'],
    fontWeight: '700',
    marginBottom: 32,
  },
});
