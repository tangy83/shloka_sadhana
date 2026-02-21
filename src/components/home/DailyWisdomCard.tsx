/**
 * DailyWisdomCard Component
 * Shloka Sadhana - Daily Wisdom Preview
 *
 * Compact card showing daily wisdom quote on home screen
 * Click to view full details
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getDailyWisdomQuote } from '@/data/wisdom';
import { getTodayISO } from '@/utils/dateUtils';
import { WisdomQuote } from '@/data/wisdom';

/**
 * DailyWisdomCard component - compact preview of daily wisdom
 */
export const DailyWisdomCard: React.FC = () => {
  const navigation = useNavigation();
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

  const renderCategoryIcon = (category: string) => {
    const size = 14;
    const color = '#FF6B35';
    switch (category) {
      case 'dharma':    return <MaterialCommunityIcons name="scale-balance" size={size} color={color} />;
      case 'karma':     return <MaterialCommunityIcons name="autorenew" size={size} color={color} />;
      case 'devotion':  return <MaterialCommunityIcons name="hands-pray" size={size} color={color} />;
      case 'meditation':return <MaterialCommunityIcons name="meditation" size={size} color={color} />;
      case 'wisdom':    return <Ionicons name="bulb-outline" size={size} color={color} />;
      case 'compassion':return <Ionicons name="heart-outline" size={size} color={color} />;
      default:          return <MaterialCommunityIcons name="book-open-outline" size={size} color={color} />;
    }
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
    // @ts-expect-error - Navigation types not fully defined
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
          {renderCategoryIcon(quote.category)}
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
    borderTopColor: '#3D2560',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12,
  },
  author: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#1A0A2E',
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
    color: '#C9A96E',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: '#2D1B4E',
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
    color: '#FF6B35',
    fontSize: 20,
    fontWeight: '300',
  },
  ctaText: {
    color: '#FF6B35',
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
    color: '#FFF8E7',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  source: {
    color: '#C9A96E',
    fontSize: 12,
  },
});
