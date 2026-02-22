/**
 * Streak Recovery Utility Tests
 * Shloka Sadhana - V3 Feature #2
 *
 * Tests for streak recovery message logic
 * Following TDD approach - RED phase
 */

import {
  shouldShowRecoveryMessage,
  markRecoveryMessageShown,
  clearRecoveryMessageFlag,
} from '../streakRecovery';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Fix "today" to match the hardcoded TODAY constant in this test file
// (streakRecovery.ts calls getTodayISO() — mock it to return the same fixed date)
jest.mock('@/utils/dateUtils', () => ({
  getTodayISO: () => '2026-02-07',
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('streakRecovery', () => {
  const TODAY = '2026-02-07';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('shouldShowRecoveryMessage', () => {
    it('should return true when streak is broken and user had a streak before', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null); // Not shown today

      const result = await shouldShowRecoveryMessage(0, 7);

      expect(result).toBe(true);
    });

    it('should return false when current streak is active (greater than 0)', async () => {
      const result = await shouldShowRecoveryMessage(5, 10);

      expect(result).toBe(false);
    });

    it('should return false when user never had a streak (longestStreak is 0)', async () => {
      const result = await shouldShowRecoveryMessage(0, 0);

      expect(result).toBe(false);
    });

    it('should return false if already shown today', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(TODAY);

      const result = await shouldShowRecoveryMessage(0, 7);

      expect(result).toBe(false);
    });

    it('should check correct AsyncStorage key', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await shouldShowRecoveryMessage(0, 7);

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        STORAGE_KEYS.STREAK_RECOVERY_LAST_SHOWN
      );
    });

    it('should show again on different day even if shown before', async () => {
      const yesterday = '2026-02-06';
      mockAsyncStorage.getItem.mockResolvedValue(yesterday);

      const result = await shouldShowRecoveryMessage(0, 7);

      expect(result).toBe(true);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await shouldShowRecoveryMessage(0, 7);

      // Should default to showing (better to show than not show)
      expect(result).toBe(true);
    });
  });

  describe('markRecoveryMessageShown', () => {
    it('should save today\'s date to AsyncStorage', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await markRecoveryMessageShown();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.STREAK_RECOVERY_LAST_SHOWN,
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) // ISO date format
      );
    });

    it('should use correct storage key', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await markRecoveryMessageShown();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.STREAK_RECOVERY_LAST_SHOWN,
        expect.any(String)
      );
    });

    it('should handle save errors without throwing', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Save failed'));

      await expect(markRecoveryMessageShown()).resolves.not.toThrow();
    });
  });

  describe('clearRecoveryMessageFlag', () => {
    it('should remove the last shown flag from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await clearRecoveryMessageFlag();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.STREAK_RECOVERY_LAST_SHOWN
      );
    });

    it('should handle removal errors without throwing', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Remove failed'));

      await expect(clearRecoveryMessageFlag()).resolves.not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle currentStreak = 0, longestStreak = 1 correctly', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await shouldShowRecoveryMessage(0, 1);

      expect(result).toBe(true);
    });

    it('should handle very large streak values', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await shouldShowRecoveryMessage(0, 365);

      expect(result).toBe(true);
    });

    it('should handle negative streak values gracefully (invalid data)', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await shouldShowRecoveryMessage(-1, 10);

      // Negative streak should be treated as no active streak
      expect(result).toBe(true);
    });

    it('should not show if both streaks are 0 even if last shown is old', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('2026-01-01');

      const result = await shouldShowRecoveryMessage(0, 0);

      expect(result).toBe(false);
    });
  });
});
