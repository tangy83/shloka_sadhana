/**
 * DailyWisdomCard Component
 * Shloka Sadhana - Daily Wisdom Preview
 *
 * Compact card showing daily wisdom quote on home screen
 * Click to view full details
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getDailyWisdomQuote } from '@/data/wisdom';
import { getTodayISO } from '@/utils/dateUtils';
import { WisdomQuote } from '@/data/wisdom';
import type { RootStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * DailyWisdomCard component - compact preview of daily wisdom
 */
export const DailyWisdomCard: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [quote, setQuote] = useState<WisdomQuote | null>(null);

  useEffect(() => {
    try {
      const today = getTodayISO();
      const dailyQuote = getDailyWisdomQuote(today);
      setQuote(dailyQuote);
    } catch (error) {
      console.error('[DailyWisdomCard] Failed to load daily wisdom:', error);
    }
  }, []);

  if (!quote) {
    return null;
  }

  const getCategoryEmoji = (category: string): string => {
    const emojiMap: Record<string, string> = {
      dharma: '⚖️',
      karma: '🔄',
      devotion: '🙏',
      meditation: '🧘',
      wisdom: '💡',
      compassion: '❤️',
    };
    return emojiMap[category] || '📖';
  };

  const getCategoryDisplay = (category: string): string => {
    const categoryMap: Record<string, string> = {
      dharma: 'Dharma',
      karma: 'Karma',
      devotion: 'Devotion',
      meditation: 'Meditation',
      wisdom: 'Wisdom',
      compassion: 'Compassion',
    };
    return categoryMap[category] || category;
  };

  const handlePress = () => {
    // Navigate to wisdom detail screen
    navigation.navigate('WisdomDetail', { quoteId: quote.id });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel="View daily wisdom details"
      testID="daily-wisdom-card"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Daily Wisdom</Text>
        </View>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(quote.category)}</Text>
          <Text style={styles.categoryText}>{getCategoryDisplay(quote.category)}</Text>
        </View>
      </View>

      {/* Quote Text */}
      <Text style={styles.quoteText} numberOfLines={3}>
        &quot;{quote.text}&quot;
      </Text>

      {/* Attribution */}
      <View style={styles.attribution}>
        <Text style={styles.author}>— {quote.author}</Text>
        <Text style={styles.source}>{quote.source}</Text>
      </View>

      {/* CTA */}
      <View style={styles.cta}>
        <Text style={styles.ctaText}>Read More</Text>
        <Text style={styles.ctaArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  attribution: {
    borderTopColor: '#2A2A2A',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  author: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#121212',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryTag: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  categoryText: {
    color: '#9E9E9E',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  cta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    marginTop: 12,
  },
  ctaArrow: {
    color: '#FF9800',
    fontSize: 20,
    fontWeight: '300',
  },
  ctaText: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  source: {
    color: '#9E9E9E',
    fontSize: 12,
  },
});
