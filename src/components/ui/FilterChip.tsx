/**
 * FilterChip Component
 * Shloka Sadhana - P0 #25 (Days 42-43)
 *
 * Reusable filter chip for category filtering
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';

export interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * FilterChip - Toggleable chip for filtering
 *
 * @example
 * <FilterChip
 *   label="Shiva"
 *   selected={filters.deity === 'Shiva'}
 *   onPress={() => toggleFilter('deity', 'Shiva')}
 * />
 */
export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && styles.chipSelected,
        style,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${label}`}
      accessibilityHint={selected ? 'Currently selected. Tap to deselect' : 'Tap to select'}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBackground,
    marginRight: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: 'rgba(255, 152, 0, 0.15)', // Primary orange tint (15%)
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
