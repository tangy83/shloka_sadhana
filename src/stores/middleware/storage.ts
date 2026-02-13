/**
 * AsyncStorage Persistence Middleware
 * Shloka Sadhana - State Management
 *
 * Zustand middleware for persisting store state to AsyncStorage
 */

import { StateStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage adapter for Zustand persistence
 *
 * Provides type-safe storage interface for Zustand middleware
 */
export const asyncStoragePersist: StateStorage = {
  /**
   * Get item from AsyncStorage
   */
  getItem: async (name: string): Promise<string | null> => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value ?? null;
    } catch (error) {
      console.error(`[Storage] Error getting item "${name}":`, error);
      return null;
    }
  },

  /**
   * Set item in AsyncStorage
   */
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error(`[Storage] Error setting item "${name}":`, error);
    }
  },

  /**
   * Remove item from AsyncStorage
   */
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error(`[Storage] Error removing item "${name}":`, error);
    }
  },
};
