/**
 * AuspiciousPeriodsCard Component
 * Shloka Sadhana - Home screen
 *
 * Displays consolidated auspicious periods (Choghadiya + Abhijit Muhurat)
 * for spiritual practice, based on Vedic muhurat calculations.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserLocation, getDefaultLocation } from '@/utils/location';
import { getMuhuratForDate, getAuspiciousPeriods, formatTo12Hour } from '@/utils/muhurat';
import { getTodayISO } from '@/utils/dateUtils';
import { AuspiciousPeriods, TimePeriod } from '@/types';

/**
 * Format time period as "start - end"
 */
function formatPeriod(period: TimePeriod): string {
  return `${formatTo12Hour(period.start)} - ${formatTo12Hour(period.end)}`;
}

/**
 * Join multiple periods with commas
 */
function formatPeriodList(periods: TimePeriod[]): string {
  return periods.map(formatPeriod).join(', ');
}

/**
 * AuspiciousPeriodsCard component
 */
export const AuspiciousPeriodsCard: React.FC = () => {
  const { theme } = useTheme();
  const [periods, setPeriods] = useState<AuspiciousPeriods | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAuspiciousPeriods() {
      try {
        let location;
        try {
          location = await getUserLocation();
        } catch (error) {
          if (__DEV__) console.error('[AuspiciousPeriodsCard] Failed to get location:', error);
          location = getDefaultLocation();
        }

        const today = getTodayISO();
        const muhurat = getMuhuratForDate(today, location.latitude, location.longitude);
        setPeriods(getAuspiciousPeriods(muhurat));
      } catch (error) {
        if (__DEV__) console.error('[AuspiciousPeriodsCard] Failed to calculate periods:', error);
        // Component will render with null data (graceful degradation)
      } finally {
        setLoading(false);
      }
    }

    loadAuspiciousPeriods();
  }, []);

  if (loading || !periods) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.textBright }]}>Choghadiya — Auspicious Periods</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Based on Abhijit Muhurat & Choghadiya calculations
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.textBright }]}>Choghadiya — Auspicious Periods</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Based on Abhijit Muhurat & Choghadiya calculations
      </Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionIcon, styles.goodIcon]}>✓</Text>
          <Text style={[styles.sectionTitle, { color: theme.textBright }]}>Auspicious Periods</Text>
        </View>
        {periods.auspiciousPeriods.length > 0 ? (
          <Text style={[styles.timesList, { color: theme.textSecondary }]}>
            {formatPeriodList(periods.auspiciousPeriods)}
          </Text>
        ) : (
          <Text style={[styles.timesList, { color: theme.textSecondary }]}>
            No auspicious periods today
          </Text>
        )}
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Other periods are considered less favourable for new beginnings
        </Text>
      </View>
    </View>
  );
};

const ICON_COLORS = {
  good: '#4CAF50',
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  goodIcon: {
    color: ICON_COLORS.good,
  },
  note: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  sectionTitle: {
    color: Colors.textBright,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  timesList: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  title: {
    color: Colors.textBright,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
});
