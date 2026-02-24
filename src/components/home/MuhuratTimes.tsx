/**
 * MuhuratTimes Component
 * Shloka Sadhana - V3 Feature #4
 *
 * Displays auspicious times (Brahma Muhurta, Abhijit, Rahu Kaal) on Home screen
 */

import React, { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getUserLocation, getDefaultLocation } from '@/utils/location';
import { getMuhuratForDate } from '@/utils/muhurat';
import { MUHURAT_ACTIVITIES } from '@/constants/MuhuratLabels';
import { getTodayISO } from '@/utils/dateUtils';
import { MuhuratData } from '@/types';

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
 * MuhuratTimes component - displays today's auspicious times
 */
export const MuhuratTimes: React.FC = () => {
  const { theme } = useTheme();
  const [muhuratData, setMuhuratData] = useState<MuhuratData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMuhuratTimes() {
      try {
        // Get user's location
        let location;
        try {
          location = await getUserLocation();
        } catch (error) {
          if (__DEV__) console.error('[MuhuratTimes] Failed to get location:', error);
          location = getDefaultLocation();
        }

        // Calculate muhurat times for today
        const today = getTodayISO();
        const muhurat = getMuhuratForDate(today, location.latitude, location.longitude);

        setMuhuratData(muhurat);
      } catch (error) {
        if (__DEV__) console.error('[MuhuratTimes] Failed to calculate muhurat:', error);
        // Component will render with null data (graceful degradation)
      } finally {
        setLoading(false);
      }
    }

    loadMuhuratTimes();
  }, []);

  if (loading || !muhuratData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.textBright }]}>Auspicious Times Today</Text>
        {/* Could add a loading skeleton here */}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Text style={[styles.title, { color: theme.textBright }]}>Auspicious Times Today</Text>

      {/* Brahma Muhurta */}
      <View style={styles.muhuratCard}>
        <Text style={styles.icon}>{MUHURAT_ACTIVITIES.brahmaMuhurta.icon}</Text>
        <View style={styles.muhuratContent}>
          <Text style={[styles.muhuratTitle, { color: theme.textBright }]}>
            {MUHURAT_ACTIVITIES.brahmaMuhurta.title}
          </Text>
          <Text style={styles.muhuratTime}>
            {formatTo12Hour(muhuratData.brahmaMuhurta.start)} – {formatTo12Hour(muhuratData.brahmaMuhurta.end)}
          </Text>
          <Text style={[styles.muhuratReason, { color: theme.textMeaning }]}>
            {MUHURAT_ACTIVITIES.brahmaMuhurta.reason}
          </Text>
          <Text style={[styles.muhuratDescription, { color: theme.textSecondary }]}>
            {MUHURAT_ACTIVITIES.brahmaMuhurta.description}
          </Text>
        </View>
      </View>

      {/* Abhijit Muhurat */}
      {muhuratData.abhijitMuhurat && (
        <View style={styles.muhuratCard}>
          <Text style={styles.icon}>{MUHURAT_ACTIVITIES.abhijitMuhurat.icon}</Text>
          <View style={styles.muhuratContent}>
            <Text style={[styles.muhuratTitle, { color: theme.textBright }]}>
              {MUHURAT_ACTIVITIES.abhijitMuhurat.title}
            </Text>
            <Text style={styles.muhuratTime}>
              {formatTo12Hour(muhuratData.abhijitMuhurat.start)} – {formatTo12Hour(muhuratData.abhijitMuhurat.end)}
            </Text>
            <Text style={[styles.muhuratReason, { color: theme.textMeaning }]}>
              {MUHURAT_ACTIVITIES.abhijitMuhurat.reason}
            </Text>
            <Text style={[styles.muhuratDescription, { color: theme.textSecondary }]}>
              {MUHURAT_ACTIVITIES.abhijitMuhurat.description}
            </Text>
          </View>
        </View>
      )}

      {/* Rahu Kaal */}
      {muhuratData.rahuKaal && (
        <View style={styles.muhuratCard}>
          <Text style={styles.icon}>{MUHURAT_ACTIVITIES.rahuKaal.icon}</Text>
          <View style={styles.muhuratContent}>
            <Text style={[styles.muhuratTitle, { color: theme.textBright }]}>
              {MUHURAT_ACTIVITIES.rahuKaal.title}
            </Text>
            <Text style={styles.muhuratTime}>
              {formatTo12Hour(muhuratData.rahuKaal.start)} – {formatTo12Hour(muhuratData.rahuKaal.end)}
            </Text>
            <Text style={[styles.muhuratReason, { color: theme.textMeaning }]}>
              {MUHURAT_ACTIVITIES.rahuKaal.reason}
            </Text>
            <Text style={[styles.muhuratDescription, { color: theme.textSecondary }]}>
              {MUHURAT_ACTIVITIES.rahuKaal.description}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  muhuratCard: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 16,
  },
  muhuratContent: {
    flex: 1,
  },
  muhuratDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  muhuratReason: {
    color: Colors.textMeaning,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    marginTop: 4,
  },
  muhuratTime: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  muhuratTitle: {
    color: Colors.textBright,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  title: {
    color: Colors.textBright,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
});
