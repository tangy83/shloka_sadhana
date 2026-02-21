/**
 * EkadashiBanner Component
 * Shloka Sadhana - V3 Feature #10
 *
 * Displays Ekadashi banner on Home screen when:
 * - Today is Ekadashi
 * - Ekadashi is within 3 days
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkIfEkadashi, getEkadashiByDate, getNextEkadashi } from '@/utils/ekadashiCalendar';
import { getTodayISO } from '@/utils/dateUtils';
import { Ekadashi } from '@/utils/ekadashiCalendar';

/**
 * Calculate days between two ISO dates
 */
function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = d2.getTime() - d1.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Format date to readable format (e.g., "Feb 13")
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * EkadashiBanner component - conditional banner for Ekadashi
 */
export const EkadashiBanner: React.FC = () => {
  const navigation = useNavigation();
  const [ekadashiData, setEkadashiData] = useState<{
    ekadashi: Ekadashi;
    isToday: boolean;
    daysAway: number;
  } | null>(null);

  useEffect(() => {
    try {
      const today = getTodayISO();

      // Check if today is Ekadashi
      if (checkIfEkadashi(today)) {
        const todayEkadashi = getEkadashiByDate(today);
        if (todayEkadashi) {
          setEkadashiData({
            ekadashi: todayEkadashi,
            isToday: true,
            daysAway: 0,
          });
          return;
        }
      }

      // Check if next Ekadashi is within 3 days
      const nextEkadashi = getNextEkadashi(today);
      const daysAway = getDaysBetween(today, nextEkadashi.date);

      if (daysAway <= 3) {
        setEkadashiData({
          ekadashi: nextEkadashi,
          isToday: false,
          daysAway,
        });
      }
    } catch (error) {
      console.error('[EkadashiBanner] Failed to load Ekadashi data:', error);
      // Graceful degradation - don't show banner
      setEkadashiData(null);
    }
  }, []);

  // Don't render if no Ekadashi nearby
  if (!ekadashiData) {
    return null;
  }

  const { ekadashi, isToday, daysAway } = ekadashiData;

  const handlePress = () => {
    // Navigate to Ekadashi detail screen
    // @ts-expect-error - Navigation types not fully defined
    navigation.navigate('EkadashiDetail', { date: ekadashi.date });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${ekadashi.name} Ekadashi details`}
      testID="ekadashi-banner"
    >
      <View style={styles.content}>
        <Text style={styles.icon}>ॐ</Text>
        <View style={styles.textContainer}>
          {/* Badge: Today or In X days */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isToday ? 'Today' : `In ${daysAway} day${daysAway > 1 ? 's' : ''}`}
            </Text>
          </View>

          {/* Ekadashi Name */}
          <Text style={styles.title}>{ekadashi.name}</Text>
          <Text style={styles.titleHindi}>{ekadashi.name_hindi}</Text>

          {/* Date (if upcoming) */}
          {!isToday && (
            <Text style={styles.date}>{formatDate(ekadashi.date)}</Text>
          )}

          {/* Significance */}
          <Text style={styles.significance} numberOfLines={2}>
            {ekadashi.significance}
          </Text>

          {/* Deity */}
          <Text style={styles.deity}>{ekadashi.deity}</Text>

          {/* CTA */}
          <Text style={styles.cta}>Learn More ›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#1A0A2E',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: '#2D1B4E',
    borderRadius: 16,
    padding: 20,
  },
  content: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  cta: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  date: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  deity: {
    color: '#C9A96E',
    fontSize: 13,
    marginTop: 4,
  },
  icon: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: '700',
    marginRight: 16,
  },
  significance: {
    color: '#BDBDBD',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFF8E7',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleHindi: {
    color: '#C9A96E',
    fontSize: 14,
    marginBottom: 4,
  },
});
