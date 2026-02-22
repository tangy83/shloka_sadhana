/**
 * Card — Shared surface primitive
 * Shloka Sadhana
 *
 * Warm-brown card shell with optional elevation level.
 * Replaces the previous crimson (#8B0020) card surface system.
 *
 * Usage:
 *   <Card>...</Card>
 *   <Card elevated>...</Card>
 *   <Card style={{ marginBottom: 16 }}>...</Card>
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { shadows } from '@/constants/theme';
import { Colors } from '@/constants/Colors';
import { SacredButton } from '@/components/sacred';

export interface CardProps {
  children: React.ReactNode;
  /** Raise the card to the surfaceElevated layer (#3A1D0D) */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  /** When provided, wraps the card in SacredButton for press interaction */
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({ children, elevated = false, style, onPress, accessibilityLabel }) => {
  const cardStyle = [
    styles.base,
    elevated ? styles.elevated : styles.standard,
    style,
  ];

  if (onPress) {
    return (
      <SacredButton onPress={onPress} accessibilityLabel={accessibilityLabel}>
        <View style={cardStyle}>{children}</View>
      </SacredButton>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...shadows.card,
  },
  elevated: {
    backgroundColor: Colors.surfaceElevated, // Colors.surfaceElevated
  },
  standard: {
    backgroundColor: Colors.surface, // Colors.surface
  },
});
