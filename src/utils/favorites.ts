/**
 * Favorites Service
 * Shloka Sadhana - Favorites/Bookmarks System
 *
 * Manages user's favorite shlokas with AsyncStorage persistence
 * Includes in-memory caching for fast access
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@shloka_sadhana:favorites';

// In-memory cache for fast access
let favoritesCache: string[] | null = null;

/**
 * Get all favorite shloka IDs
 * @returns Promise<string[]> - Array of favorite shloka IDs
 */
export const getFavorites = async (): Promise<string[]> => {
  // Return cache if available
  if (favoritesCache !== null) {
    return favoritesCache;
  }

  try {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!stored) {
      favoritesCache = [];
      return [];
    }

    const favorites = JSON.parse(stored) as string[];
    favoritesCache = favorites;
    return favorites;
  } catch (error) {
    if (__DEV__) console.warn('[Favorites] Failed to get favorites:', error);
    favoritesCache = [];
    return [];
  }
};

/**
 * Add a shloka to favorites
 * @param shlokaId - ID of the shloka to add
 */
export const addFavorite = async (shlokaId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();

    // Don't add duplicates
    if (favorites.includes(shlokaId)) {
      return;
    }

    const updatedFavorites = [...favorites, shlokaId];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));

    // Update cache
    favoritesCache = updatedFavorites;
  } catch (error) {
    if (__DEV__) console.error('[Favorites] Failed to add favorite:', error);
  }
};

/**
 * Remove a shloka from favorites
 * @param shlokaId - ID of the shloka to remove
 */
export const removeFavorite = async (shlokaId: string): Promise<void> => {
  try {
    const favorites = await getFavorites();
    const updatedFavorites = favorites.filter((id) => id !== shlokaId);

    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites));

    // Update cache
    favoritesCache = updatedFavorites;
  } catch (error) {
    if (__DEV__) console.error('[Favorites] Failed to remove favorite:', error);
  }
};

/**
 * Check if a shloka is favorited
 * @param shlokaId - ID of the shloka to check
 * @returns Promise<boolean> - True if favorited
 */
export const isFavorite = async (shlokaId: string): Promise<boolean> => {
  try {
    const favorites = await getFavorites();
    return favorites.includes(shlokaId);
  } catch (error) {
    if (__DEV__) console.warn('[Favorites] Failed to check favorite:', error);
    return false;
  }
};

/**
 * Clear all favorites
 */
export const clearFavorites = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FAVORITES_KEY);
    favoritesCache = null;
  } catch (error) {
    if (__DEV__) console.error('[Favorites] Failed to clear favorites:', error);
  }
};

/**
 * Clear in-memory cache (for testing)
 * @internal
 */
export const _clearCache = (): void => {
  favoritesCache = null;
};
