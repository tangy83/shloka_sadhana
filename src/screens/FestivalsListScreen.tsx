/**
 * FestivalsListScreen
 * Shloka Sadhana - V3 Feature #3
 *
 * Screen for browsing Hindu festivals (upcoming and past)
 */

import React, { useState } from 'react';
import { Colors } from '@/constants/Colors';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { getUpcomingFestivals, getPastFestivals, Festival } from '@/utils/festivals';
import { getTodayISO } from '@/utils/dateUtils';

type TabType = 'upcoming' | 'past';

/**
 * Formats ISO date (YYYY-MM-DD) to readable format (MMM DD, YYYY)
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00'); // Add time to avoid timezone issues
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Calculates relative date text (e.g., "in 10 days")
 */
function getRelativeDate(isoDate: string, today: string): string {
  const targetDate = new Date(isoDate + 'T00:00:00');
  const todayDate = new Date(today + 'T00:00:00');
  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays > 1 && diffDays <= 30) {
    return `in ${diffDays} days`;
  } else if (diffDays < 0 && diffDays >= -1) {
    return 'Yesterday';
  } else if (diffDays < -1 && diffDays >= -30) {
    return `${Math.abs(diffDays)} days ago`;
  }

  return ''; // Don't show relative for distant dates
}

/**
 * FestivalsListScreen - Browse upcoming and past Hindu festivals
 */
export const FestivalsListScreen: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const today = getTodayISO();

  // Load festivals based on active tab
  const upcomingFestivals = getUpcomingFestivals(today);
  const pastFestivals = getPastFestivals(today, 20); // Limit past to 20

  const festivals = activeTab === 'upcoming' ? upcomingFestivals : pastFestivals;

  /**
   * Render individual festival card
   */
  const renderFestivalCard = ({ item }: { item: Festival }) => {
    const relativeDate = getRelativeDate(item.date, today);

    return (
      <TouchableOpacity
        testID="festival-card"
        style={[styles.card, { backgroundColor: theme.surface }]}
        onPress={() => {
          // Future: Navigate to festival detail screen
        }}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.name}`}
      >
        <View style={styles.cardContent}>
          {/* Category Badge */}
          {item.category === 'major' && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>MAJOR</Text>
            </View>
          )}

          {/* Festival Name */}
          <Text style={[styles.festivalName, { color: theme.textBright }]}>{item.name}</Text>

          {/* Date */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            {relativeDate && (
              <Text style={[styles.relativeDateText, { color: theme.textSecondary }]}>• {relativeDate}</Text>
            )}
          </View>

          {/* Deity Association */}
          <Text style={[styles.deity, { color: theme.textMeaning }]}>{item.deity_association}</Text>

          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
        {activeTab === 'upcoming' ? 'No upcoming festivals' : 'No past festivals'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textBright }]}>Hindu Festivals</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {activeTab === 'upcoming' ? upcomingFestivals.length : pastFestivals.length} Festivals
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          testID="tab-upcoming"
          style={[styles.tab, { backgroundColor: theme.surface }, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          accessibilityRole="button"
          accessibilityLabel="View upcoming festivals"
          accessibilityState={{ selected: activeTab === 'upcoming' }}
        >
          <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="tab-past"
          style={[styles.tab, { backgroundColor: theme.surface }, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
          accessibilityRole="button"
          accessibilityLabel="View past festivals"
          accessibilityState={{ selected: activeTab === 'past' }}
        >
          <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'past' && styles.tabTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Festivals List */}
      <FlatList
        testID="festivals-list"
        data={festivals}
        renderItem={renderFestivalCard}
        keyExtractor={(item) => item.name + item.date} // Unique key
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
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
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dateText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  deity: {
    color: Colors.textMeaning,
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  festivalName: {
    color: Colors.textBright,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  relativeDateText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.background,
  },
  title: {
    color: Colors.textBright,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
