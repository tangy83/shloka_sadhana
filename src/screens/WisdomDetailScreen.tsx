/**
 * WisdomDetailScreen
 * Shloka Sadhana - Wisdom Quote Detail View
 *
 * Full detailed view of a wisdom quote with Sanskrit, meaning,
 * context, and practical application
 */

import React from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getAllWisdomQuotes } from '@/data/wisdom';

type WisdomDetailRouteParams = {
  WisdomDetail: {
    quoteId: string;
  };
};

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  const size = 64;
  const color = Colors.primary;
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
        <CategoryIcon category={quote.category} />
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
    backgroundColor: Colors.surface,
    borderLeftColor: Colors.primary,
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
    color: Colors.textBright,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  attributionDivider: {
    backgroundColor: Colors.surface,
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
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  meaningHighlight: {
    backgroundColor: Colors.surface,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 16,
  },
  meaningText: {
    color: Colors.textBright,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  quoteText: {
    color: Colors.textBright,
    fontSize: 17,
    fontStyle: 'italic',
    lineHeight: 28,
  },
  sanskritText: {
    color: Colors.textMeaning,
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 32,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    padding: 20,
  },
  sectionContent: {
    color: Colors.textMeaning,
    fontSize: 15,
    lineHeight: 24,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  source: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  sourceChapter: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  tag: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tagText: {
    color: Colors.textMeaning,
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
