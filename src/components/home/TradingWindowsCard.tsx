/**
 * TradingWindowsCard Component
 * Shloka Sadhana - V3 Feature: Trading Windows
 *
 * Displays consolidated trading windows based on Vedic muhurat calculations
 * Shows good times to trade and times to avoid trading
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserLocation, getDefaultLocation } from '@/utils/location';
import { getMuhuratForDate, getTradingWindows } from '@/utils/muhurat';
import { getTodayISO } from '@/utils/dateUtils';
import { TradingWindows, TimePeriod } from '@/types';

/**
 * Format 24-hour time (HH:MM) to 12-hour format with AM/PM
 * Example: "05:00" => "5:00 AM", "15:30" => "3:30 PM"
 */
function formatTo12Hour(time24: string): string {
  const [hoursStr, minutes] = time24.split(':');
  const hours = parseInt(hoursStr, 10);

  if (hours === 0) {
    return `12:${minutes} AM`;
  } else if (hours < 12) {
    return `${hours}:${minutes} AM`;
  } else if (hours === 12) {
    return `12:${minutes} PM`;
  } else {
    return `${hours - 12}:${minutes} PM`;
  }
}

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
 * TradingWindowsCard component
 */
export const TradingWindowsCard: React.FC = () => {
  const { theme } = useTheme();
  const [tradingWindows, setTradingWindows] = useState<TradingWindows | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTradingWindows() {
      try {
        // Get user's location
        let location;
        try {
          location = await getUserLocation();
        } catch (error) {
          if (__DEV__) console.error('[TradingWindowsCard] Failed to get location:', error);
          location = getDefaultLocation();
        }

        // Calculate muhurat times for today
        const today = getTodayISO();
        const muhurat = getMuhuratForDate(today, location.latitude, location.longitude);

        // Get trading windows
        const windows = getTradingWindows(muhurat);

        setTradingWindows(windows);
      } catch (error) {
        if (__DEV__) console.error('[TradingWindowsCard] Failed to calculate trading windows:', error);
        // Component will render with null data (graceful degradation)
      } finally {
        setLoading(false);
      }
    }

    loadTradingWindows();
  }, []);

  if (loading || !tradingWindows) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.textBright }]}>Trading Windows Today</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Based on Abhijit Muhurat & Choghadiya calculations
        </Text>
        {/* Could add a loading skeleton here */}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.textBright }]}>Trading Windows Today</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Based on Abhijit Muhurat & Choghadiya calculations
      </Text>

      {/* Good Times to Trade */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionIcon, styles.goodIcon]}>✓</Text>
          <Text style={[styles.sectionTitle, { color: theme.textBright }]}>Auspicious Trading Times</Text>
        </View>
        {tradingWindows.auspiciousPeriods.length > 0 ? (
          <Text style={[styles.timesList, { color: theme.textSecondary }]}>
            {formatPeriodList(tradingWindows.auspiciousPeriods)}
          </Text>
        ) : (
          <Text style={[styles.timesList, { color: theme.textSecondary }]}>
            No auspicious periods today
          </Text>
        )}
        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Other times should be avoided for new trades
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
