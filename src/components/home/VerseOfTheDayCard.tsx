/**
 * VerseOfTheDayCard Component
 * Shloka Sadhana - V3 Feature #5
 *
 * Displays a daily verse from sacred texts
 */

import React, { useState, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet } from 'react-native';
import { getVerseOfTheDay, VerseOfTheDay } from '@/utils/verseOfTheDay';
import { getTodayISO } from '@/utils/dateUtils';

/**
 * VerseOfTheDayCard component - displays daily verse
 */
export const VerseOfTheDayCard: React.FC = () => {
  const [verse, setVerse] = useState<VerseOfTheDay | null>(null);

  useEffect(() => {
    try {
      const today = getTodayISO();
      const todayVerse = getVerseOfTheDay(today);
      setVerse(todayVerse);
    } catch (error) {
      console.error('[VerseOfTheDayCard] Failed to load verse:', error);
      // Graceful degradation - component won't render
    }
  }, []);

  if (!verse) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>Verse of the Day</Text>
        <Text style={styles.deity}>{verse.deity}</Text>
      </View>

      {/* Sanskrit Text */}
      <Text style={styles.sanskrit}>{verse.sanskrit}</Text>

      {/* Transliteration */}
      <Text style={styles.transliteration}>{verse.transliteration}</Text>

      {/* English Meaning */}
      <Text style={styles.meaning}>{verse.meaning}</Text>

      {/* Hindi Translation (if available) */}
      {verse.hindi && (
        <Text style={styles.hindi}>{verse.hindi}</Text>
      )}

      {/* Source */}
      <View style={styles.footer}>
        <Text style={styles.source}>— {verse.shlokaName}</Text>
        {verse.category && (
          <Text style={styles.category}>{verse.category}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    color: Colors.background,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  category: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
  },
  deity: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hindi: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
    marginTop: 12,
  },
  meaning: {
    color: 'rgba(255, 243, 224, 0.9)',
    fontSize: 15,
    lineHeight: 24,
    marginTop: 12,
  },
  sanskrit: {
    color: '#FFF8E7',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 28,
    marginBottom: 8,
  },
  source: {
    color: Colors.textSecondary,
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
  },
  transliteration: {
    color: Colors.primary,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
  },
});
