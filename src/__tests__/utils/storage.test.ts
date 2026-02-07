/**
 * Storage Service Tests
 * Shloka Sadhana - AsyncStorage wrapper with type safety
 *
 * TDD Approach: RED → GREEN → REFACTOR
 * These tests are written BEFORE implementation
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getItem,
  setItem,
  removeItem,
  clearAll,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
} from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import type { StreakData, AppSettings } from '@/types';

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('Storage Service', () => {
  describe('getItem', () => {
    it('should retrieve and parse stored data', async () => {
      const mockData: StreakData = {
        currentStreak: 7,
        lastCompletedDate: '2026-02-05',
        longestStreak: 7,
        totalPractices: 7,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const result = await getItem<StreakData>(STORAGE_KEYS.STREAK);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.STREAK);
      expect(result).toEqual(mockData);
    });

    it('should return null if key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getItem<StreakData>(STORAGE_KEYS.STREAK);

      expect(result).toBeNull();
    });

    it('should return null and log error if JSON parsing fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-json');

      const result = await getItem<StreakData>(STORAGE_KEYS.STREAK);

      expect(result).toBeNull();
    });

    it('should return null and log error if AsyncStorage.getItem throws', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(error);

      const result = await getItem<StreakData>(STORAGE_KEYS.STREAK);

      expect(result).toBeNull();
    });
  });

  describe('setItem', () => {
    it('should stringify and store data', async () => {
      const mockData: StreakData = {
        currentStreak: 7,
        lastCompletedDate: '2026-02-05',
        longestStreak: 7,
        totalPractices: 7,
      };

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await setItem(STORAGE_KEYS.STREAK, mockData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.STREAK,
        JSON.stringify(mockData)
      );
    });

    it('should return true on successful save', async () => {
      const mockData: AppSettings = {
        notificationsEnabled: true,
        notificationTime: '08:00',
        hapticsEnabled: true,
        soundEnabled: true,
        theme: 'dark',
      };

      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const result = await setItem(STORAGE_KEYS.SETTINGS, mockData);

      expect(result).toBe(true);
    });

    it('should return false and log error if AsyncStorage.setItem throws', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      const result = await setItem(STORAGE_KEYS.SETTINGS, { theme: 'dark' });

      expect(result).toBe(false);
    });

    it('should handle storing primitive values', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await setItem(STORAGE_KEYS.TODAY_SANKALP, 'My daily intention');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TODAY_SANKALP,
        JSON.stringify('My daily intention')
      );
    });
  });

  describe('removeItem', () => {
    it('should remove item from storage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await removeItem(STORAGE_KEYS.TODAY_SANKALP);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.TODAY_SANKALP);
    });

    it('should return true on successful removal', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const result = await removeItem(STORAGE_KEYS.TODAY_SANKALP);

      expect(result).toBe(true);
    });

    it('should return false and log error if AsyncStorage.removeItem throws', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(error);

      const result = await removeItem(STORAGE_KEYS.TODAY_SANKALP);

      expect(result).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('should clear all storage', async () => {
      (AsyncStorage.clear as jest.Mock).mockResolvedValue(undefined);

      await clearAll();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should return true on successful clear', async () => {
      (AsyncStorage.clear as jest.Mock).mockResolvedValue(undefined);

      const result = await clearAll();

      expect(result).toBe(true);
    });

    it('should return false and log error if AsyncStorage.clear throws', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.clear as jest.Mock).mockRejectedValue(error);

      const result = await clearAll();

      expect(result).toBe(false);
    });
  });

  describe('getAllKeys', () => {
    it('should retrieve all storage keys', async () => {
      const mockKeys = [
        STORAGE_KEYS.STREAK,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.ONBOARDING_COMPLETE,
      ];

      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);

      const result = await getAllKeys();

      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
      expect(result).toEqual(mockKeys);
    });

    it('should return empty array if no keys exist', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue([]);

      const result = await getAllKeys();

      expect(result).toEqual([]);
    });

    it('should return empty array and log error if AsyncStorage.getAllKeys throws', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(error);

      const result = await getAllKeys();

      expect(result).toEqual([]);
    });
  });

  describe('multiGet', () => {
    it('should retrieve multiple items at once', async () => {
      const mockData = [
        [STORAGE_KEYS.STREAK, JSON.stringify({ currentStreak: 7 })],
        [STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'dark' })],
      ];

      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue(mockData);

      const keys = [STORAGE_KEYS.STREAK, STORAGE_KEYS.SETTINGS];
      const result = await multiGet(keys);

      expect(AsyncStorage.multiGet).toHaveBeenCalledWith(keys);
      expect(result).toEqual([
        [STORAGE_KEYS.STREAK, { currentStreak: 7 }],
        [STORAGE_KEYS.SETTINGS, { theme: 'dark' }],
      ]);
    });

    it('should handle null values in multiGet', async () => {
      const mockData = [
        [STORAGE_KEYS.STREAK, null],
        [STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'dark' })],
      ];

      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue(mockData);

      const result = await multiGet([STORAGE_KEYS.STREAK, STORAGE_KEYS.SETTINGS]);

      expect(result).toEqual([
        [STORAGE_KEYS.STREAK, null],
        [STORAGE_KEYS.SETTINGS, { theme: 'dark' }],
      ]);
    });

    it('should return empty array and log error if AsyncStorage.multiGet throws', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.multiGet as jest.Mock).mockRejectedValue(error);

      const result = await multiGet([STORAGE_KEYS.STREAK, STORAGE_KEYS.SETTINGS]);

      expect(result).toEqual([]);
    });
  });

  describe('multiSet', () => {
    it('should store multiple items at once', async () => {
      const pairs: [string, unknown][] = [
        [STORAGE_KEYS.STREAK, { currentStreak: 7 }],
        [STORAGE_KEYS.SETTINGS, { theme: 'dark' }],
      ];

      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      await multiSet(pairs);

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        [STORAGE_KEYS.STREAK, JSON.stringify({ currentStreak: 7 })],
        [STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'dark' })],
      ]);
    });

    it('should return true on successful multiSet', async () => {
      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      const result = await multiSet([
        [STORAGE_KEYS.STREAK, { currentStreak: 7 }],
      ]);

      expect(result).toBe(true);
    });

    it('should return false and log error if AsyncStorage.multiSet throws', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.multiSet as jest.Mock).mockRejectedValue(error);

      const result = await multiSet([
        [STORAGE_KEYS.STREAK, { currentStreak: 7 }],
      ]);

      expect(result).toBe(false);
    });
  });

  describe('multiRemove', () => {
    it('should remove multiple items at once', async () => {
      const keys = [STORAGE_KEYS.STREAK, STORAGE_KEYS.TODAY_SANKALP];

      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await multiRemove(keys);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(keys);
    });

    it('should return true on successful multiRemove', async () => {
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      const result = await multiRemove([STORAGE_KEYS.STREAK]);

      expect(result).toBe(true);
    });

    it('should return false and log error if AsyncStorage.multiRemove throws', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(error);

      const result = await multiRemove([STORAGE_KEYS.STREAK]);

      expect(result).toBe(false);
    });
  });
});
