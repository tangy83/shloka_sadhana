/**
 * RecoveryMessageCard Component
 * Shloka Sadhana - V3 Feature #2
 *
 * Encouraging message card shown when user's streak is broken
 * Reminds them of their best streak and motivates them to start again
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface RecoveryMessageCardProps {
  longestStreak: number;
  onDismiss: () => void;
}

/**
 * Card component displaying streak recovery encouragement
 * Shows user's longest streak and motivates them to practice again
 */
export const RecoveryMessageCard: React.FC<RecoveryMessageCardProps> = ({
  longestStreak,
  onDismiss,
}) => {
  // Format days text (singular vs plural)
  const daysText = longestStreak === 1 ? 'day' : 'days';

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Streak recovery encouragement"
    >
      {/* Dismiss Button */}
      <TouchableOpacity
        style={styles.dismissButton}
        onPress={onDismiss}
        accessibilityLabel="Dismiss recovery message"
        accessibilityRole="button"
      >
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>

      {/* Icon/Emoji */}
      <Text style={styles.icon}>🌟</Text>

      {/* Main Message */}
      <Text style={styles.title}>Your best was {longestStreak} {daysText}</Text>

      {/* Encouraging Subtext */}
      <Text style={styles.message}>
        You did it before, you can reach it again!
      </Text>

      {/* Call to Action */}
      <Text style={styles.cta}>Start a new streak today</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2C2C2C',
    borderLeftColor: '#FFA726', // Warm orange (encouraging, not alarming)
    borderLeftWidth: 4,
    borderRadius: 16,
    elevation: 2,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cta: {
    color: '#BDBDBD',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  dismissButton: {
    padding: 4,
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  dismissText: {
    color: '#C9A96E',
    fontSize: 20,
    fontWeight: '600',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#FFF8E7',
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  title: {
    color: '#FFA726', // Warm orange
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
