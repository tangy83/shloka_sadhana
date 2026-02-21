/**
 * EkadashiCalendarScreen
 * Shloka Sadhana - V3 Feature #10
 *
 * Screen for browsing Ekadashi dates (upcoming and past)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUpcomingEkadashis, getAllEkadashis, Ekadashi } from '@/utils/ekadashiCalendar';
import { getTodayISO } from '@/utils/dateUtils';

type TabType = 'upcoming' | 'all';

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
 * EkadashiCalendarScreen - Browse Ekadashi dates
 */
export const EkadashiCalendarScreen: React.FC = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const today = getTodayISO();

  // Load Ekadashis based on active tab
  const upcomingEkadashis = getUpcomingEkadashis(today, 12);
  const allEkadashis = getAllEkadashis();

  const ekadashis = activeTab === 'upcoming' ? upcomingEkadashis : allEkadashis;

  /**
   * Navigate to Ekadashi detail screen
   */
  const handleEkadashiPress = (ekadashi: Ekadashi) => {
    // @ts-expect-error - Navigation types not fully defined
    navigation.navigate('EkadashiDetail', { date: ekadashi.date });
  };

  /**
   * Render individual Ekadashi card
   */
  const renderEkadashiCard = ({ item }: { item: Ekadashi }) => {
    const relativeDate = activeTab === 'upcoming' ? getRelativeDate(item.date, today) : '';

    return (
      <TouchableOpacity
        testID="ekadashi-card"
        style={styles.card}
        onPress={() => handleEkadashiPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.name}`}
      >
        <View style={styles.cardContent}>
          {/* Ekadashi Icon */}
          <Text style={styles.icon}>ॐ</Text>

          <View style={styles.cardTextContainer}>
            {/* Ekadashi Name */}
            <Text style={styles.ekadashiName}>{item.name}</Text>
            <Text style={styles.ekadashiNameHindi}>{item.name_hindi}</Text>

            {/* Date */}
            <View style={styles.dateContainer}>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              {relativeDate && (
                <Text style={styles.relativeDateText}>• {relativeDate}</Text>
              )}
            </View>

            {/* Paksha */}
            <Text style={styles.paksha}>{item.paksha}</Text>

            {/* Significance */}
            <Text style={styles.significance} numberOfLines={2}>
              {item.significance}
            </Text>
          </View>
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
        {activeTab === 'upcoming' ? 'No upcoming Ekadashis' : 'No Ekadashis available'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Ekadashi Calendar</Text>
        <Text style={styles.subtitle}>
          {ekadashis.length} Ekadashi{ekadashis.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          testID="tab-upcoming"
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
          accessibilityRole="button"
          accessibilityLabel="View upcoming Ekadashis"
          accessibilityState={{ selected: activeTab === 'upcoming' }}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="tab-all"
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
          accessibilityRole="button"
          accessibilityLabel="View all Ekadashis"
          accessibilityState={{ selected: activeTab === 'all' }}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All 2026
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ekadashis List */}
      <FlatList
        testID="ekadashi-list"
        data={ekadashis}
        renderItem={renderEkadashiCard}
        keyExtractor={(item) => item.date}
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
    alignItems: 'flex-start',
    flexDirection: 'row',
    padding: 20,
  },
  cardTextContainer: {
    flex: 1,
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
  ekadashiName: {
    color: '#FFF8E7',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  ekadashiNameHindi: {
    color: '#C9A96E',
    fontSize: 14,
    marginBottom: 8,
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
  header: {
    padding: 20,
    paddingTop: 60,
  },
  icon: {
    color: '#FFD700',
    fontSize: 36,
    fontWeight: '700',
    marginRight: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  paksha: {
    color: '#BDBDBD',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  relativeDateText: {
    color: '#C9A96E',
    fontSize: 13,
  },
  significance: {
    color: '#C9A96E',
    fontSize: 14,
    lineHeight: 20,
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
