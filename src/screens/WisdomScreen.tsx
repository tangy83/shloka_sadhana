/**
 * WisdomScreen
 * Shloka Sadhana - Spiritual Wisdom
 *
 * Screen for displaying daily spiritual wisdom and teachings
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { getAllWisdomQuotes } from '@/data/wisdom';

type CategoryIconProps = { category: string; size?: number; color?: string };
const CategoryIcon: React.FC<CategoryIconProps> = ({ category, size = 16, color = '#FF6B35' }) => {
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

/**
 * Wisdom screen for displaying spiritual quotes and teachings
 */
export const WisdomScreen: React.FC = () => {
  const quotes = getAllWisdomQuotes();

  /**
   * Get category display name
   */
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


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wisdom</Text>
        <Text style={styles.subtitle}>Daily Spiritual Teachings</Text>
      </View>

      {/* Quotes List */}
      <ScrollView
        testID="wisdom-scroll"
        contentContainerStyle={styles.scrollContent}
      >
        {quotes.map((quote) => (
          <View key={quote.id} style={styles.quoteCard} testID="wisdom-quote">
            {/* Category Tag */}
            <View style={styles.categoryContainer}>
              <CategoryIcon category={quote.category} size={16} color="#FF6B35" />
              <Text style={styles.categoryText} testID="quote-category">
                {getCategoryDisplay(quote.category)}
              </Text>
            </View>

            {/* Quote Text */}
            <Text style={styles.quoteText} testID="quote-text">
              &quot;{quote.text}&quot;
            </Text>

            {/* Author and Source */}
            <View style={styles.attribution}>
              <Text style={styles.author} testID="quote-author">
                — {quote.author}
              </Text>
              <Text style={styles.source} testID="quote-source">
                {quote.source}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  attribution: {
    borderTopColor: '#3D2560',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  author: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    color: '#FF6B35',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: '#1A0A2E',
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  quoteCard: {
    backgroundColor: '#2D1B4E',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  quoteText: {
    color: '#FFF8E7',
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 16,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  source: {
    color: '#C9A96E',
    fontSize: 12,
  },
  subtitle: {
    color: '#C9A96E',
    fontSize: 16,
  },
  title: {
    color: '#FFF8E7',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
