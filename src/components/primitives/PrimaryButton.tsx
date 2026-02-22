/**
 * PrimaryButton — Gradient CTA primitive
 * Shloka Sadhana
 *
 * Saffron flame gradient button for primary actions.
 * Degrades gracefully to a flat tinted surface when disabled.
 *
 * Usage:
 *   <PrimaryButton label="Start Practice" onPress={handleStart} />
 *   <PrimaryButton label="Save" onPress={handleSave} disabled />
 */

import React from 'react';
import {
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SacredButton } from '@/components/sacred';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
}) => {
  return (
    <SacredButton
      onPress={onPress}
      disabled={disabled}
      style={[styles.wrapper, style]}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      {disabled ? (
        <LinearGradient
          colors={['rgba(255, 140, 0, 0.30)', 'rgba(229, 91, 0, 0.30)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={[styles.label, styles.labelDisabled]}>{label}</Text>
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={['#FF9A2A', '#E55B00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={styles.label}>{label}</Text>
        </LinearGradient>
      )}
    </SacredButton>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 26,
    overflow: 'hidden',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  label: {
    color: '#1E0E05', // Dark sanctum — high contrast on saffron gradient
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  labelDisabled: {
    color: 'rgba(255, 243, 224, 0.5)',
  },
});
