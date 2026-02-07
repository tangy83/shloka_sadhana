/**
 * WisdomDetailScreen
 * Shloka Sadhana - Wisdom Quote Detail View
 *
 * Full detailed view of a wisdom quote with Sanskrit, meaning,
 * context, and practical application
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getAllWisdomQuotes } from '@/data/wisdom';

type WisdomDetailRouteParams = {
  WisdomDetail: {
    quoteId: string;
  };
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
 * WisdomDetailScreen - Full details for a wisdom quote
 */
export const WisdomDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<WisdomDetailRouteParams, 'WisdomDetail'>>();
  const { quoteId } = route.params;

  // Find the quote by ID
  const quotes = getAllWisdomQuotes();
  const quote = quotes.find(q => q.id === quoteId);

  // Handle case where quote not found
  if (!quote) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Wisdom quote not found</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>{getCategoryEmoji(quote.category)}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{getCategoryDisplay(quote.category)}</Text>
        </View>
      </View>

      {/* Sanskrit Text (if available) */}
      {quote.text_sanskrit && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sanskrit</Text>
          <Text style={styles.sanskritText}>{quote.text_sanskrit}</Text>
        </View>
      )}

      {/* Quote Text */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quote</Text>
        <Text style={styles.quoteText}>&quot;{quote.text}&quot;</Text>
      </View>

      {/* Meaning */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Meaning</Text>
        <View style={styles.meaningHighlight}>
          <Text style={styles.meaningText}>{quote.meaning}</Text>
        </View>
      </View>

      {/* Context */}
      {quote.context && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Context</Text>
          <Text style={styles.sectionContent}>{quote.context}</Text>
        </View>
      )}

      {/* Practical Application */}
      {quote.practical_application && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Apply</Text>
          <View style={styles.applicationBox}>
            <Text style={styles.applicationIcon}>💫</Text>
            <Text style={styles.applicationText}>{quote.practical_application}</Text>
          </View>
        </View>
      )}

      {/* Tags */}
      {quote.tags && quote.tags.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Related Topics</Text>
          <View style={styles.tagsContainer}>
            {quote.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Attribution */}
      <View style={styles.attributionSection}>
        <View style={styles.attributionDivider} />
        <Text style={styles.author}>— {quote.author}</Text>
        <Text style={styles.source}>{quote.source}</Text>
        {quote.source_chapter && (
          <Text style={styles.sourceChapter}>{quote.source_chapter}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  applicationBox: {
    alignItems: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderLeftColor: '#FF9800',
    borderLeftWidth: 4,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  applicationIcon: {
    fontSize: 24,
  },
  applicationText: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  attributionDivider: {
    backgroundColor: '#2A2A2A',
    height: 1,
    marginBottom: 16,
    width: '100%',
  },
  attributionSection: {
    alignItems: 'center',
    marginTop: 8,
    paddingBottom: 20,
  },
  author: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    color: '#121212',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#9E9E9E',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  icon: {
    fontSize: 64,
  },
  meaningHighlight: {
    backgroundColor: '#1E1E1E',
    borderLeftColor: '#FF9800',
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
  },
  meaningText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontStyle: 'italic',
    lineHeight: 28,
  },
  sanskritText: {
    color: '#BDBDBD',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 32,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 20,
  },
  sectionContent: {
    color: '#BDBDBD',
    fontSize: 15,
    lineHeight: 24,
  },
  sectionTitle: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  source: {
    color: '#9E9E9E',
    fontSize: 14,
    marginBottom: 4,
  },
  sourceChapter: {
    color: '#757575',
    fontSize: 12,
    fontStyle: 'italic',
  },
  tag: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tagText: {
    color: '#BDBDBD',
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
