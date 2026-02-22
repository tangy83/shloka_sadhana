/**
 * WisdomScreen
 * Shloka Sadhana - Spiritual Wisdom
 *
 * Screen for displaying daily spiritual wisdom and teachings
 */

import React from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAllWisdomQuotes } from '@/data/wisdom';

type CategoryIconProps = { category: string; size?: number; color?: string };
const CategoryIcon: React.FC<CategoryIconProps> = ({ category, size = 16, color = Colors.primary }) => {
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
  const navigation = useNavigation();
  const quotes = getAllWisdomQuotes();

  const handleQuotePress = (quoteId: string) => {
    // @ts-expect-error - Navigation types not fully defined
    navigation.navigate('WisdomDetail', { quoteId });
  };

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
          <TouchableOpacity
            key={quote.id}
            style={styles.quoteCard}
            onPress={() => handleQuotePress(quote.id)}
            accessibilityRole="button"
            accessibilityLabel={`Read full wisdom from ${quote.author}`}
            testID="wisdom-quote"
          >
            {/* Category Tag */}
            <View style={styles.categoryContainer}>
              <CategoryIcon category={quote.category} size={16} color={Colors.primary} />
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
            <Text style={styles.readMore}>Read More ›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  attribution: {
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  author: {
    color: Colors.primary,
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
  categoryText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  quoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
  },
  quoteText: {
    color: Colors.textBright,
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 16,
  },
  readMore: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'right',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  source: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  title: {
    color: Colors.textBright,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
