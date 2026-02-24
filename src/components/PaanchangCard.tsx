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
import { useTheme } from '@/contexts/ThemeContext';
import { getPaanchangForDate } from '@/utils/paanchang';
import { getRecommendationForDate } from '@/utils/weekdayRecommendations';
import { getNakshatraGuidance, NakshatraGuidance } from '@/utils/nakshatraGuidance';
import { PaanchangData } from '@/types';
import type { WeekdayRecommendation } from '@/utils/weekdayRecommendations';

interface PaanchangCardProps {
  date?: string; // ISO date (YYYY-MM-DD), defaults to today
}

/**
 * Card component displaying Hindu calendar information
 */
export const PaanchangCard: React.FC<PaanchangCardProps> = ({ date }) => {
  const { theme } = useTheme();
  const [paanchang, setPaanchang] = useState<PaanchangData | null>(null);
  const [recommendation, setRecommendation] = useState<WeekdayRecommendation | null>(null);
  const [nakshatraGuidance, setNakshatraGuidance] = useState<NakshatraGuidance | null>(null);

  useEffect(() => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const data = getPaanchangForDate(targetDate);
    const rec = getRecommendationForDate(targetDate);
    const guidance = getNakshatraGuidance(data.nakshatra);
    setPaanchang(data);
    setRecommendation(rec);
    setNakshatraGuidance(guidance);
  }, [date]);

  if (!paanchang) {
    return null;
  }

  return (
    <View
      testID="paanchang-card"
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
        paanchang.isEkadashi && styles.containerEkadashi,
      ]}
      accessibilityLabel="Hindu Calendar Information"
      accessibilityRole="text"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textBright }]}>Paanchang</Text>
        {paanchang.isEkadashi && (
          <View testID="ekadashi-indicator" style={styles.ekadasiBadge}>
            <Text style={styles.ekadasiBadgeText}>Ekadashi</Text>
          </View>
        )}
      </View>

      {/* Weekday */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Weekday</Text>
        <Text style={[styles.value, { color: theme.textBright }]}>
          {paanchang.weekday} ({paanchang.weekdayEnglish})
        </Text>
      </View>

      {/* Tithi */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Tithi</Text>
        <Text style={[styles.value, { color: theme.textBright }, paanchang.isEkadashi && styles.valueEkadashi]}>
          {paanchang.tithi}
        </Text>
      </View>

      {/* Paksha */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Paksha</Text>
        <Text style={[styles.value, { color: theme.textBright }]}>
          {paanchang.paksha} Paksha
        </Text>
      </View>

      {/* Nakshatra */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Nakshatra</Text>
        <Text style={[styles.value, { color: theme.textBright }]}>{paanchang.nakshatra}</Text>
      </View>

      {/* Hindu Month */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Month</Text>
        <Text style={[styles.value, { color: theme.textBright }]}>{paanchang.hinduMonth}</Text>
      </View>

      {/* Ekadashi Name (if applicable) */}
      {paanchang.isEkadashi && paanchang.ekadasiName && (
        <View style={[styles.ekadashiNameContainer, { borderTopColor: Colors.primary }]}>
          <Text style={styles.ekadashiNameLabel}>Special Ekadashi</Text>
          <Text style={styles.ekadashiName}>{paanchang.ekadasiName}</Text>
        </View>
      )}

      {/* Nakshatra Guidance */}
      {nakshatraGuidance && nakshatraGuidance.name !== 'Unknown' && (
        <View style={[styles.nakshatraContainer, { borderTopColor: theme.divider }]} testID="nakshatra-guidance">
          <Text style={[styles.nakshatraTitle, { color: theme.primary }]}>Current Nakshatra Guidance</Text>
          <Text style={[styles.nakshatraGeneral, { color: theme.textMeaning }]}>{nakshatraGuidance.general}</Text>

          {nakshatraGuidance.favorable.length > 0 && (
            <View style={styles.guidanceSection}>
              <Text style={[styles.guidanceLabel, { color: theme.success }]}>✓ Favorable</Text>
              {nakshatraGuidance.favorable.map((item, index) => (
                <Text key={index} style={[styles.guidanceItem, { color: theme.textSecondary }]}>
                  • {item}
                </Text>
              ))}
            </View>
          )}

          {nakshatraGuidance.unfavorable.length > 0 && (
            <View style={styles.guidanceSection}>
              <Text style={[styles.guidanceLabel, styles.unfavorableLabel]}>✗ Unfavorable</Text>
              {nakshatraGuidance.unfavorable.map((item, index) => (
                <Text key={index} style={[styles.guidanceItem, { color: theme.textSecondary }]}>
                  • {item}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Weekday Recommendation */}
      {recommendation && (
        <View style={[styles.recommendationContainer, { borderTopColor: theme.divider }]} testID="weekday-recommendation">
          <Text style={[styles.recommendationTitle, { color: theme.success }]}>Today&apos;s Recommendation</Text>
          <View style={styles.recommendationContent}>
            <Text style={[styles.deityName, { color: theme.textBright }]}>{recommendation.deityName}</Text>
            <Text style={[styles.recommendationBenefits, { color: theme.textSecondary }]}>{recommendation.benefits}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  // eslint-disable-next-line react-native/no-color-literals
  containerEkadashi: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',  // subtle warm amber Ekadashi highlight
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  deityName: {
    color: Colors.textBright,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  ekadashiName: {
    color: Colors.primary,
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
    color: Colors.textOnColor,  // cream on saffron badge
    fontSize: 12,
    fontWeight: '600',
  },
  guidanceItem: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 8,
  },
  guidanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  guidanceSection: {
    marginBottom: 12,
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
  nakshatraContainer: {
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  nakshatraGeneral: {
    color: Colors.textMeaning,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  nakshatraTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  recommendationBenefits: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  recommendationContainer: {
    borderTopColor: Colors.divider,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  recommendationContent: {
    gap: 4,
  },
  recommendationTitle: {
    color: Colors.success,
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
    color: Colors.textBright,
    fontSize: 20,
    fontWeight: '600',
  },
  // eslint-disable-next-line react-native/no-color-literals
  unfavorableLabel: {
    color: '#FF6B6B',
  },
  value: {
    color: Colors.textBright,
    fontSize: 14,
    fontWeight: '600',
  },
  valueEkadashi: {
    color: Colors.primary,
  },
});
