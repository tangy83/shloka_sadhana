/**
 * FestivalDetailScreen
 * Shloka Sadhana - V3 Feature #3
 *
 * Detailed view of a specific Hindu festival
 */

import React from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { getFestivalByNameAndDate } from '@/utils/festivals';

type FestivalDetailRouteParams = {
  FestivalDetail: {
    name: string;
    date: string;
  };
};

/**
 * Formats ISO date (YYYY-MM-DD) to readable format (Month DD, YYYY)
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * FestivalDetailScreen - Full details for a single festival occurrence
 */
export const FestivalDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<RouteProp<FestivalDetailRouteParams, 'FestivalDetail'>>();

  // Params may be absent if navigated to without them — fall through to not-found
  const name = route.params?.name;
  const date = route.params?.date;

  // Name alone is ambiguous (festival names repeat across years) — look up by both
  const festival = name && date ? getFestivalByNameAndDate(name, date) : null;

  // Handle case where festival not found
  if (!festival) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            {name ? `Festival not found: ${name}` : 'Festival not found'}
          </Text>
        </View>
      </View>
    );
  }

  const hasShlokas = !!festival.recommended_shlokas && festival.recommended_shlokas.length > 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.icon}>ॐ</Text>
        {festival.category === 'major' && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>MAJOR</Text>
          </View>
        )}
        <Text style={[styles.title, { color: theme.textBright }]}>{festival.name}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{formatDate(festival.date)}</Text>
      </View>

      {/* Deity */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>Deity</Text>
        <Text style={[styles.sectionContent, { color: theme.textMeaning }]}>{festival.deity_association}</Text>
      </View>

      {/* About */}
      <View style={[styles.section, { backgroundColor: theme.surface }]}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={[styles.sectionContent, { color: theme.textMeaning }]}>{festival.description}</Text>
      </View>

      {/* Recommended Shlokas */}
      {hasShlokas && (
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={styles.sectionTitle}>Recommended Shlokas</Text>
          {festival.recommended_shlokas?.map((shloka, index) => (
            <View key={`${shloka}-${index}`} style={styles.shlokaRow}>
              <Text style={styles.shlokaBullet}>•</Text>
              <Text style={[styles.shlokaText, { color: theme.textMeaning }]}>{shloka}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Fasting Guidelines */}
      {!!festival.fasting_guidelines && (
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={styles.sectionTitle}>Fasting Guidelines</Text>
          <Text style={[styles.sectionContent, { color: theme.textMeaning }]}>{festival.fasting_guidelines}</Text>
        </View>
      )}

      {/* Regional Variations */}
      {!!festival.regional_variations && (
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={styles.sectionTitle}>Regional Variations</Text>
          <Text style={[styles.sectionContent, { color: theme.textMeaning }]}>{festival.regional_variations}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: Colors.background,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
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
  icon: {
    color: Colors.templeGold,
    fontSize: 56,
    fontWeight: '700',
    marginBottom: 16,
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
    lineHeight: 22,
  },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  shlokaBullet: {
    color: Colors.primary,
    fontSize: 15,
    lineHeight: 22,
    marginRight: 8,
  },
  shlokaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  shlokaText: {
    color: Colors.textMeaning,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  title: {
    color: Colors.textBright,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
});
