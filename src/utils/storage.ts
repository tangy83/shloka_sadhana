/**
 * Storage Service
 * Shloka Sadhana - Type-safe AsyncStorage wrapper
 *
 * Provides type-safe methods for storing and retrieving data
 * with automatic JSON serialization/deserialization and error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logStorageError } from './errorLogger';

// Import types and storage keys
import type { StreakData, PracticeSession } from '@/types';
import { STORAGE_KEYS } from '@/constants/StorageKeys';

/**
 * Get item from storage with type safety
 * @param key Storage key
 * @returns Parsed data or null if not found/error
 */
export const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key);

    if (value === null) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    logStorageError(error as Error, 'read', key);
    return null;
  }
};

/**
 * Set item in storage with automatic JSON stringification
 * @param key Storage key
 * @param value Data to store
 * @returns True if successful, false otherwise
 */
export const setItem = async <T>(key: string, value: T): Promise<boolean> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    logStorageError(error as Error, 'write', key);
    return false;
  }
};

/**
 * Remove item from storage
 * @param key Storage key
 * @returns True if successful, false otherwise
 */
export const removeItem = async (key: string): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    logStorageError(error as Error, 'delete', key);
    return false;
  }
};

/**
 * Clear all storage
 * @returns True if successful, false otherwise
 */
export const clearAll = async (): Promise<boolean> => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    logStorageError(error as Error, 'clear');
    return false;
  }
};

/**
 * Get all keys in storage
 * @returns Array of storage keys
 */
export const getAllKeys = async (): Promise<readonly string[]> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    logStorageError(error as Error, 'read');
    return [];
  }
};

/**
 * Get multiple items at once
 * @param keys Array of storage keys
 * @returns Array of [key, value] pairs with parsed values
 */
export const multiGet = async (
  keys: string[]
): Promise<[string, unknown | null][]> => {
  try {
    const results = await AsyncStorage.multiGet(keys);

    // Parse JSON values
    return results.map(([key, value]) => {
      if (value === null) {
        return [key, null];
      }

      try {
        return [key, JSON.parse(value)];
      } catch {
        // If JSON parsing fails, return null for that value
        logStorageError(new Error('JSON parse error'), 'read', key);
        return [key, null];
      }
    });
  } catch (error) {
    logStorageError(error as Error, 'read');
    return [];
  }
};

/**
 * Set multiple items at once
 * @param pairs Array of [key, value] pairs
 * @returns True if successful, false otherwise
 */
export const multiSet = async (
  pairs: [string, unknown][]
): Promise<boolean> => {
  try {
    // Stringify all values
    const stringifiedPairs = pairs.map(([key, value]) => [
      key,
      JSON.stringify(value),
    ]) as [string, string][];

    await AsyncStorage.multiSet(stringifiedPairs);
    return true;
  } catch (error) {
    logStorageError(error as Error, 'write');
    return false;
  }
};

/**
 * Remove multiple items at once
 * @param keys Array of storage keys
 * @returns True if successful, false otherwise
 */
export const multiRemove = async (keys: string[]): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    logStorageError(error as Error, 'delete');
    return false;
  }
};

/**
 * Get streak data from storage
 * @returns Streak data or null if not found
 */
export const getStreak = async (): Promise<StreakData | null> => {
  return getItem<StreakData>(STORAGE_KEYS.STREAK);
};

/**
 * Save streak data to storage
 * @param data Streak data to save
 */
export const saveStreak = async (data: StreakData): Promise<void> => {
  await setItem(STORAGE_KEYS.STREAK, data);
};

/**
 * Get all practice sessions from storage
 * @returns Array of practice sessions, empty array if none found
 */
export const getSessions = async (): Promise<PracticeSession[]> => {
  const sessions = await getItem<PracticeSession[]>(STORAGE_KEYS.SESSIONS);
  return sessions || [];
};

/**
 * Save practice sessions to storage
 * @param sessions Array of sessions to save
 */
export const saveSessions = async (sessions: PracticeSession[]): Promise<void> => {
  await setItem(STORAGE_KEYS.SESSIONS, sessions);
};

/**
 * Add a new practice session
 * @param session Practice session to add
 */
export const addSession = async (session: PracticeSession): Promise<void> => {
  const sessions = await getSessions();
  sessions.push(session);
  await saveSessions(sessions);
};

// Export storage object for easy mocking in tests
export const storage = {
  getItem,
  setItem,
  removeItem,
  clearAll,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
  getStreak,
  saveStreak,
  getSessions,
  saveSessions,
  addSession,
};
