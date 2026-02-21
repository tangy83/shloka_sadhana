/**
 * FestivalsListScreen
 * Shloka Sadhana - V3 Feature #3
 *
 * Screen for browsing Hindu festivals (upcoming and past)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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
        style={styles.card}
        onPress={() => {
          // Future: Navigate to festival detail screen
          console.log('Festival pressed:', item.name);
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
          <Text style={styles.festivalName}>{item.name}</Text>

          {/* Date */}
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            {relativeDate && (
              <Text style={styles.relativeDateText}>• {relativeDate}</Text>
            )}
          </View>

          {/* Deity Association */}
          <Text style={styles.deity}>{item.deity_association}</Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
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
      <Text style={styles.emptyText}>
        {activeTab === 'upcoming' ? 'No upcoming festivals' : 'No past festivals'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Hindu Festivals</Text>
        <Text style={styles.subtitle}>
          {activeTab === 'upcoming' ? upcomingFestivals.length : pastFestivals.length} Festivals
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          testID="tab-upcoming"
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          accessibilityRole="button"
          accessibilityLabel="View upcoming festivals"
          accessibilityState={{ selected: activeTab === 'upcoming' }}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="tab-past"
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
          accessibilityRole="button"
          accessibilityLabel="View past festivals"
          accessibilityState={{ selected: activeTab === 'past' }}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
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
    backgroundColor: '#2D1B4E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#1A0A2E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  container: {
    backgroundColor: '#1A0A2E',
    flex: 1,
  },
  dateContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dateText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '500',
  },
  deity: {
    color: '#BDBDBD',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  description: {
    color: '#C9A96E',
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
    color: '#C9A96E',
    fontSize: 16,
  },
  festivalName: {
    color: '#FFF8E7',
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
    color: '#C9A96E',
    fontSize: 13,
  },
  subtitle: {
    color: '#C9A96E',
    fontSize: 16,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: '#2D1B4E',
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tabActive: {
    backgroundColor: '#FF6B35',
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  tabText: {
    color: '#C9A96E',
    fontSize: 15,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#1A0A2E',
  },
  title: {
    color: '#FFF8E7',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
