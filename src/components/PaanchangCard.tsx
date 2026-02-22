/**
 * PaanchangCard Component
 * Shloka Sadhana - Hindu Calendar Display
 *
 * Displays current Paanchang (Hindu calendar) information including
 * Tithi, Nakshatra, Paksha, and more.
 */

import React, { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet } from 'react-native';
import { getPaanchangForDate } from '@/utils/paanchang';
import { getRecommendationForDate } from '@/utils/weekdayRecommendations';
import { PaanchangData } from '@/types';
import type { WeekdayRecommendation } from '@/utils/weekdayRecommendations';

interface PaanchangCardProps {
  date?: string; // ISO date (YYYY-MM-DD), defaults to today
}

/**
 * Card component displaying Hindu calendar information
 */
export const PaanchangCard: React.FC<PaanchangCardProps> = ({ date }) => {
  const [paanchang, setPaanchang] = useState<PaanchangData | null>(null);
  const [recommendation, setRecommendation] = useState<WeekdayRecommendation | null>(null);

  useEffect(() => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const data = getPaanchangForDate(targetDate);
    const rec = getRecommendationForDate(targetDate);
    setPaanchang(data);
    setRecommendation(rec);
  }, [date]);

  if (!paanchang) {
    return null;
  }

  return (
    <View
      testID="paanchang-card"
      style={[
        styles.container,
        paanchang.isEkadashi && styles.containerEkadashi,
      ]}
      accessibilityLabel="Hindu Calendar Information"
      accessibilityRole="text"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Paanchang</Text>
        {paanchang.isEkadashi && (
          <View testID="ekadashi-indicator" style={styles.ekadasiBadge}>
            <Text style={styles.ekadasiBadgeText}>Ekadashi</Text>
          </View>
        )}
      </View>

      {/* Weekday */}
      <View style={styles.row}>
        <Text style={styles.label}>Weekday</Text>
        <Text style={styles.value}>
          {paanchang.weekday} ({paanchang.weekdayEnglish})
        </Text>
      </View>

      {/* Tithi */}
      <View style={styles.row}>
        <Text style={styles.label}>Tithi</Text>
        <Text style={[styles.value, paanchang.isEkadashi && styles.valueEkadashi]}>
          {paanchang.tithi}
        </Text>
      </View>

      {/* Paksha */}
      <View style={styles.row}>
        <Text style={styles.label}>Paksha</Text>
        <Text style={styles.value}>
          {paanchang.paksha} Paksha
        </Text>
      </View>

      {/* Nakshatra */}
      <View style={styles.row}>
        <Text style={styles.label}>Nakshatra</Text>
        <Text style={styles.value}>{paanchang.nakshatra}</Text>
      </View>

      {/* Hindu Month */}
      <View style={styles.row}>
        <Text style={styles.label}>Month</Text>
        <Text style={styles.value}>{paanchang.hinduMonth}</Text>
      </View>

      {/* Ekadashi Name (if applicable) */}
      {paanchang.isEkadashi && paanchang.ekadasiName && (
        <View style={styles.ekadashiNameContainer}>
          <Text style={styles.ekadashiNameLabel}>Special Ekadashi</Text>
          <Text style={styles.ekadashiName}>{paanchang.ekadasiName}</Text>
        </View>
      )}

      {/* Weekday Recommendation */}
      {recommendation && (
        <View style={styles.recommendationContainer} testID="weekday-recommendation">
          <Text style={styles.recommendationTitle}>Today&apos;s Recommendation</Text>
          <View style={styles.recommendationContent}>
            <Text style={styles.deityName}>{recommendation.deityName}</Text>
            <Text style={styles.recommendationBenefits}>{recommendation.benefits}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderColor: '#2E2E2E',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  containerEkadashi: {
    backgroundColor: '#2A2416',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  deityName: {
    color: '#FFF8E7',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  ekadashiName: {
    color: '#FFB84D',
    fontSize: 16,
    fontWeight: '600',
  },
  ekadashiNameContainer: {
    borderTopColor: Colors.primary,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  ekadashiNameLabel: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  ekadasiBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  ekadasiBadgeText: {
    color: '#FFF8E7',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  recommendationBenefits: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  recommendationContainer: {
    borderTopColor: '#2E2E2E',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  recommendationContent: {
    gap: 4,
  },
  recommendationTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    color: '#FFF8E7',
    fontSize: 20,
    fontWeight: '600',
  },
  value: {
    color: '#FFF8E7',
    fontSize: 14,
    fontWeight: '600',
  },
  valueEkadashi: {
    color: Colors.primary,
  },
});
