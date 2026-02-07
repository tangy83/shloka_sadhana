/**
 * WisdomScreen
 * Shloka Sadhana - Spiritual Wisdom
 *
 * Screen for displaying daily spiritual wisdom and teachings
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getAllWisdomQuotes } from '@/data/wisdom';

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

  /**
   * Get category emoji
   */
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
              <Text style={styles.categoryEmoji} testID="quote-category">
                {getCategoryEmoji(quote.category)}
              </Text>
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
    borderTopColor: '#2A2A2A',
    borderTopWidth: 1,
    paddingTop: 12,
  },
  author: {
    color: '#FF9800',
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
    color: '#FF9800',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  quoteCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  quoteText: {
    color: '#FFFFFF',
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
    color: '#9E9E9E',
    fontSize: 12,
  },
  subtitle: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
