/**
 * LibraryScreen
 * Shloka Sadhana - Browse Shlokas
 *
 * Screen for browsing all available shlokas
 * Enhanced with search functionality (P0 #24)
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllShlokas } from '@/data/shlokas';
import { Shloka, RootStackParamList } from '@/types';
import { useShlokaSearch } from '@/hooks/useShlokaSearch';
import { FilterChip } from '@/components/ui/FilterChip';
import { analyticsService } from '@/services/analytics';
import { AnalyticsEvents, AnalyticsProperties } from '@/constants/AnalyticsEvents';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * P0 #25: Filter options
 */
const DEITY_FILTERS = ['Lord Shiva', 'Lord Vishnu', 'Goddess Durga', 'Lord Ganesha', 'Lord Hanuman'];
const DURATION_FILTERS = ['Quick (<10 min)', 'Medium (10-20 min)', 'Long (>20 min)'];
const TIME_FILTERS = ['Morning', 'Afternoon', 'Evening', 'Anytime'];

/**
 * Library screen for browsing shlokas
 */
export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { search, totalCount } = useShlokaSearch();

  // P0 #24: Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Shloka[]>(getAllShlokas());

  // P0 #25: Filter state
  const [selectedDeity, setSelectedDeity] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Track screen view when Library screen is focused
  useFocusEffect(
    React.useCallback(() => {
      analyticsService.trackScreen('Library');
    }, [])
  );

  // P0 #24 & #25: Update search results when query or filters change
  useEffect(() => {
    // First apply search
    let results = search(searchQuery);

    // Then apply filters
    results = applyFilters(results);

    setSearchResults(results);

    // Track search event (with debounce to avoid too many events)
    if (searchQuery.trim().length > 0) {
      // Only track non-empty searches
      const timer = setTimeout(() => {
        analyticsService.trackEvent(AnalyticsEvents.LIBRARY_SEARCHED, {
          [AnalyticsProperties.SEARCH_QUERY]: searchQuery,
          [AnalyticsProperties.RESULTS_COUNT]: results.length,
        });
      }, 500); // 500ms debounce

      return () => clearTimeout(timer);
    }
  }, [searchQuery, search, selectedDeity, selectedDuration, selectedTime]);

  /**
   * P0 #25: Apply filters to shloka list
   */
  const applyFilters = (shlokas: Shloka[]): Shloka[] => {
    let filtered = shlokas;

    // Filter by deity
    if (selectedDeity) {
      filtered = filtered.filter((shloka) => shloka.deity === selectedDeity);
    }

    // Filter by duration
    if (selectedDuration) {
      filtered = filtered.filter((shloka) => matchesDuration(shloka, selectedDuration));
    }

    // Filter by best time
    if (selectedTime) {
      filtered = filtered.filter((shloka) => matchesTime(shloka, selectedTime));
    }

    return filtered;
  };

  /**
   * P0 #25: Check if shloka matches duration filter
   */
  const matchesDuration = (shloka: Shloka, durationFilter: string): boolean => {
    const duration = shloka.duration.toLowerCase();

    // Extract minutes from duration string (e.g., "3 minutes", "30-45 minutes")
    const match = duration.match(/(\d+)(?:-(\d+))?\s*(?:minutes?|mins?)/i);
    if (!match) return false;

    const minMinutes = parseInt(match[1], 10);
    const maxMinutes = match[2] ? parseInt(match[2], 10) : minMinutes;

    // Use the average if range
    const avgMinutes = (minMinutes + maxMinutes) / 2;

    if (durationFilter === 'Quick (<10 min)') {
      return avgMinutes < 10;
    } else if (durationFilter === 'Medium (10-20 min)') {
      return avgMinutes >= 10 && avgMinutes <= 20;
    } else if (durationFilter === 'Long (>20 min)') {
      return avgMinutes > 20;
    }

    return false;
  };

  /**
   * P0 #25: Check if shloka matches time filter
   */
  const matchesTime = (shloka: Shloka, timeFilter: string): boolean => {
    const bestTime = shloka.bestTime.toLowerCase();

    if (timeFilter === 'Morning') {
      return bestTime.includes('morning') || bestTime.includes('brahma muhurta');
    } else if (timeFilter === 'Afternoon') {
      return bestTime.includes('afternoon') || bestTime.includes('midday');
    } else if (timeFilter === 'Evening') {
      return bestTime.includes('evening') || bestTime.includes('sunset') || bestTime.includes('twilight');
    } else if (timeFilter === 'Anytime') {
      return bestTime.includes('anytime') || bestTime.includes('any time');
    }

    return false;
  };

  /**
   * P0 #25: Toggle filter selection
   */
  const toggleFilter = (type: 'deity' | 'duration' | 'time', value: string) => {
    if (type === 'deity') {
      setSelectedDeity(selectedDeity === value ? null : value);
    } else if (type === 'duration') {
      setSelectedDuration(selectedDuration === value ? null : value);
    } else if (type === 'time') {
      setSelectedTime(selectedTime === value ? null : value);
    }
  };

  /**
   * P0 #25: Clear all filters
   */
  const clearAllFilters = () => {
    setSelectedDeity(null);
    setSelectedDuration(null);
    setSelectedTime(null);
  };

  /**
   * P0 #25: Check if any filters are active
   */
  const hasActiveFilters = selectedDeity || selectedDuration || selectedTime;

  /**
   * Handle shloka card press - navigate to detail screen
   */
  const handleShlokaPress = (shlokaId: string) => {
    // Track shloka selection
    const shloka = searchResults.find((s) => s.id === shlokaId);
    analyticsService.trackEvent(AnalyticsEvents.SHLOKA_SELECTED, {
      [AnalyticsProperties.SHLOKA_ID]: shlokaId,
      [AnalyticsProperties.SHLOKA_NAME]: shloka?.name || 'Unknown',
      [AnalyticsProperties.SEARCH_QUERY]: searchQuery || null, // Track if selected from search
    });

    navigation.navigate('ShlokaDetail', { shlokaId });
  };

  /**
   * Render individual shloka card
   */
  const renderShlokaCard = ({ item }: { item: Shloka }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleShlokaPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`View ${item.name}`}
    >
      <View style={styles.cardContent}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.deity}>{item.deity}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.duration}>⏱️ {item.duration}</Text>
          <Text style={styles.bestTime}>🌅 {item.bestTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  /**
   * Render empty state (search-aware)
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {searchQuery ? (
        <>
          <Text style={styles.emptyText}>No results for &quot;{searchQuery}&quot;</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </>
      ) : (
        <Text style={styles.emptyText}>No shlokas available</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>
          {searchQuery
            ? `${searchResults.length} of ${totalCount} Sacred Texts`
            : `${totalCount} Sacred Texts`}
        </Text>
      </View>

      {/* P0 #24: Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, deity, or description..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Search shlokas"
          accessibilityHint="Type to search by name, deity, or description"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* P0 #25: Filter Chips */}
      <View style={styles.filtersContainer}>
        {/* Deity Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Deity</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {DEITY_FILTERS.map((deity) => (
              <FilterChip
                key={deity}
                label={deity}
                selected={selectedDeity === deity}
                onPress={() => toggleFilter('deity', deity)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Duration Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Duration</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {DURATION_FILTERS.map((duration) => (
              <FilterChip
                key={duration}
                label={duration}
                selected={selectedDuration === duration}
                onPress={() => toggleFilter('duration', duration)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Time Filters */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Best Time</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {TIME_FILTERS.map((time) => (
              <FilterChip
                key={time}
                label={time}
                selected={selectedTime === time}
                onPress={() => toggleFilter('time', time)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearAllFilters}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Shloka List */}
      <FlatList
        testID="shloka-list"
        data={searchResults}
        renderItem={renderShlokaCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bestTime: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  container: {
    backgroundColor: '#121212',
    flex: 1,
  },
  deity: {
    color: '#FF9800',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  description: {
    color: '#BDBDBD',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  duration: {
    color: '#9E9E9E',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptySubtext: {
    color: Colors.textTertiary,
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingRight: 40, // Space for clear button
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
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
  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  filterRow: {
    paddingRight: 20,
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
});
