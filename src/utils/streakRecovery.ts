/**
 * Streak Recovery Utility
 * Shloka Sadhana - V3 Feature #2
 *
 * Utility functions for managing streak recovery message display
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { getTodayISO } from '@/utils/dateUtils';

/**
 * Determines if the streak recovery message should be shown
 *
 * @param currentStreak - User's current active streak (0 if broken)
 * @param longestStreak - User's longest ever streak
 * @returns True if message should be shown, false otherwise
 *
 * Logic:
 * - Only show if streak is broken (currentStreak <= 0) AND user had a streak before (longestStreak > 0)
 * - Show only once per day (check last shown date)
 * - Default to showing if AsyncStorage fails (better to show than not show)
 */
export async function shouldShowRecoveryMessage(
  currentStreak: number,
  longestStreak: number
): Promise<boolean> {
  // Don't show if streak is active
  if (currentStreak > 0) {
    return false;
  }

  // Don't show if user never had a streak
  if (longestStreak <= 0) {
    return false;
  }

  // Check if already shown today
  try {
    const lastShown = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_RECOVERY_LAST_SHOWN);
    const today = getTodayISO();

    // If shown today, don't show again
    if (lastShown === today) {
      return false;
    }

    // Show (either never shown, or shown on a different day)
    return true;
  } catch (error) {
    console.error('[streakRecovery] Failed to check last shown date:', error);
    // Default to showing if storage check fails
    return true;
  }
}

/**
 * Marks the recovery message as shown for today
 * Saves today's date to AsyncStorage to prevent showing multiple times per day
 */
export async function markRecoveryMessageShown(): Promise<void> {
  try {
    const today = getTodayISO();
    await AsyncStorage.setItem(STORAGE_KEYS.STREAK_RECOVERY_LAST_SHOWN, today);
  } catch (error) {
    console.error('[streakRecovery] Failed to mark message as shown:', error);
    // Don't throw - failing to save is not critical
  }
}

/**
 * Clears the recovery message flag
 * Useful for testing or resetting the feature state
 */
export async function clearRecoveryMessageFlag(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.STREAK_RECOVERY_LAST_SHOWN);
  } catch (error) {
    console.error('[streakRecovery] Failed to clear recovery flag:', error);
    // Don't throw - failing to clear is not critical
  }
}
