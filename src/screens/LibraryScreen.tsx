/**
 * LibraryScreen
 * Shloka Sadhana - Browse Shlokas
 *
 * Screen for browsing all available shlokas with search + favorites filter
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { AppText } from '@/components/primitives/AppText';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllShlokas } from '@/data/shlokas';
import { getFavorites, addFavorite, removeFavorite } from '@/utils/favorites';
import { Shloka, RootStackParamList } from '@/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Library screen for browsing shlokas
 */
export const LibraryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const allShlokas = getAllShlokas();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load favorites on mount
  useEffect(() => {
    const load = async () => {
      const ids = await getFavorites();
      setFavoriteIds(ids);
    };
    load();
  }, []);

  // Filtered shloka list (search + favorites)
  const filteredShlokas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let result = allShlokas;

    if (q.length > 0) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.deity.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    if (showFavoritesOnly) {
      result = result.filter((s) => favoriteIds.includes(s.id));
    }

    return result;
  }, [allShlokas, searchQuery, showFavoritesOnly, favoriteIds]);

  /**
   * Handle shloka card press - navigate to detail screen
   */
  const handleShlokaPress = (shlokaId: string) => {
    navigation.navigate('ShlokaDetail', { shlokaId });
  };

  /**
   * Toggle a shloka as favorite
   */
  const handleFavoriteToggle = async (shlokaId: string) => {
    if (favoriteIds.includes(shlokaId)) {
      await removeFavorite(shlokaId);
      setFavoriteIds((prev) => prev.filter((id) => id !== shlokaId));
    } else {
      await addFavorite(shlokaId);
      setFavoriteIds((prev) => [...prev, shlokaId]);
    }
  };

  /**
   * Render individual shloka card
   */
  const renderShlokaCard = ({ item }: { item: Shloka }) => {
    const favorited = favoriteIds.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.surface }]}
        onPress={() => handleShlokaPress(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.name}`}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleBlock}>
              <AppText style={[styles.name, { color: theme.textBright }]}>{item.name}</AppText>
              <AppText style={[styles.deity, { color: theme.primary }]}>{item.deity}</AppText>
            </View>
            <TouchableOpacity
              style={styles.heartBtn}
              onPress={() => handleFavoriteToggle(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`${favorited ? 'Remove' : 'Add'} ${item.name} ${favorited ? 'from' : 'to'} favorites`}
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={22}
                color={favorited ? Colors.lotusPink : theme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <AppText style={[styles.description, { color: theme.textMeaning }]} numberOfLines={2}>
            {item.description}
          </AppText>

          <View style={styles.meta}>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="timer-outline" size={13} color={theme.textSecondary} />
              <Text style={[styles.duration, { color: theme.textSecondary }]}>{item.duration}</Text>
            </View>
            <Text style={[styles.bestTime, { color: theme.textSecondary }]}>🌅 {item.bestTime}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => {
    if (showFavoritesOnly && favoriteIds.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No favourites yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            Tap the heart icon on any shloka to save it here.
          </Text>
        </View>
      );
    }
    if (searchQuery.trim().length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No results</Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            {`No shlokas match "${searchQuery}".`}
          </Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>No shlokas available</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textBright }]}>Mantras</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{allShlokas.length} Sacred Texts</Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={18} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, deity, or description…"
          placeholderTextColor={theme.textSecondary}
          returnKeyType="search"
          accessibilityLabel="Search shlokas"
          clearButtonMode="while-editing"
        />
      </View>

      {/* All / Favourites tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, !showFavoritesOnly && styles.tabBtnActive]}
          onPress={() => setShowFavoritesOnly(false)}
          accessibilityRole="button"
          accessibilityLabel="Show all shlokas"
        >
          <Text style={[styles.tabBtnText, !showFavoritesOnly && styles.tabBtnTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, showFavoritesOnly && styles.tabBtnActive]}
          onPress={() => setShowFavoritesOnly(true)}
          accessibilityRole="button"
          accessibilityLabel="Show favourites only"
        >
          <Ionicons
            name={showFavoritesOnly ? 'heart' : 'heart-outline'}
            size={14}
            color={showFavoritesOnly ? Colors.lotusPink : Colors.textSecondary}
            style={styles.iconSpacing}
          />
          <Text style={[styles.tabBtnText, showFavoritesOnly && styles.tabBtnTextActive]}>
            Favourites
          </Text>
        </TouchableOpacity>
      </View>

      {/* Shloka List */}
      <FlatList
        testID="shloka-list"
        data={filteredShlokas}
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
    color: Colors.textSecondary,
    fontSize: 12,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 12,
  },
  container: {
    backgroundColor: Colors.background,
    flex: 1,
  },
  deity: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    color: Colors.textMeaning,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  duration: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptySubtext: {
    color: Colors.textTertiary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  heartBtn: {
    padding: 4,
  },
  iconSpacing: {
    marginRight: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  name: {
    color: Colors.textBright,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 6,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    color: Colors.text,
    flex: 1,
    fontSize: 15,
  },
  searchRow: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  tabBtn: {
    alignItems: 'center',
    borderColor: Colors.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabBtnActive: {
    backgroundColor: Colors.surfaceLight,
    borderColor: Colors.primary,
  },
  tabBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: Colors.primary,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  title: {
    color: Colors.textBright,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
});
