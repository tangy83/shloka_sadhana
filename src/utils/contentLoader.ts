/**
 * Content Loader
 * Shloka Sadhana - Configurable Content System
 *
 * Loads shloka content from JSON (local fallback + remote fetch)
 * Enables content updates without code changes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shloka } from '@/types';
import { shlokas as localShlokas } from '@/data/shlokas';

const CONTENT_CACHE_KEY = '@shloka_sadhana:content_cache';

// In-memory cache for fast access
let memoryCache: Shloka[] | null = null;

/**
 * Load shloka content from remote URL or local fallback
 * @param remoteUrl - Optional remote JSON URL
 * @returns Promise<Shloka[]> - Array of shlokas
 */
export const loadShlokaContent = async (remoteUrl?: string): Promise<Shloka[]> => {
  // Return in-memory cache if available
  if (memoryCache) {
    return memoryCache;
  }

  // If no remote URL, return local fallback
  if (!remoteUrl) {
    memoryCache = localShlokas;
    return localShlokas;
  }

  try {
    // Attempt to fetch from remote URL
    const response = await fetch(remoteUrl);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const remoteContent: Shloka[] = await response.json();

    // Cache to AsyncStorage
    await AsyncStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(remoteContent));

    // Cache to memory
    memoryCache = remoteContent;

    return remoteContent;
  } catch (error) {
    console.warn('[ContentLoader] Failed to fetch remote content, using fallback:', error);

    // Try to use cached content from AsyncStorage
    const cachedContent = await getCachedContent();
    if (cachedContent) {
      memoryCache = cachedContent;
      return cachedContent;
    }

    // Final fallback to local content
    memoryCache = localShlokas;
    return localShlokas;
  }
};

/**
 * Get cached content from AsyncStorage
 * @returns Promise<Shloka[] | null> - Cached shlokas or null
 */
export const getCachedContent = async (): Promise<Shloka[] | null> => {
  try {
    const cached = await AsyncStorage.getItem(CONTENT_CACHE_KEY);
    if (!cached) {
      return null;
    }

    return JSON.parse(cached) as Shloka[];
  } catch (error) {
    console.warn('[ContentLoader] Failed to read cache:', error);
    return null;
  }
};

/**
 * Clear content cache (both AsyncStorage and memory)
 */
export const clearContentCache = async (): Promise<void> => {
  memoryCache = null;
  await AsyncStorage.removeItem(CONTENT_CACHE_KEY);
};
