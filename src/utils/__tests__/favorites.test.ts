/**
 * Favorites Service Tests
 * Shloka Sadhana - Favorites/Bookmarks System
 *
 * Tests for managing user's favorite shlokas with AsyncStorage persistence
 */

import {
  addFavorite,
  removeFavorite,
  isFavorite,
  getFavorites,
  clearFavorites,
  _clearCache,
} from '../favorites';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Favorites Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _clearCache(); // Clear in-memory cache before each test
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const favorites = await getFavorites();

      expect(favorites).toEqual([]);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@shloka_sadhana:favorites');
    });

    it('should return stored favorites', async () => {
      const storedFavorites = ['gayatri-mantra', 'maha-mrityunjaya'];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(storedFavorites));

      const favorites = await getFavorites();

      expect(favorites).toEqual(storedFavorites);
    });

    it('should handle invalid JSON in storage', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      const favorites = await getFavorites();

      expect(favorites).toEqual([]);
    });

    it('should handle storage errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const favorites = await getFavorites();

      expect(favorites).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add a new favorite', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await addFavorite('gayatri-mantra');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@shloka_sadhana:favorites',
        JSON.stringify(['gayatri-mantra'])
      );
    });

    it('should add to existing favorites', async () => {
      const existingFavorites = ['gayatri-mantra'];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingFavorites));

      await addFavorite('maha-mrityunjaya');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@shloka_sadhana:favorites',
        JSON.stringify(['gayatri-mantra', 'maha-mrityunjaya'])
      );
    });

    it('should not add duplicate favorites', async () => {
      const existingFavorites = ['gayatri-mantra'];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingFavorites));

      await addFavorite('gayatri-mantra');

      // setItem should not be called since the favorite already exists
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(addFavorite('gayatri-mantra')).resolves.not.toThrow();
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite', async () => {
      const existingFavorites = ['gayatri-mantra', 'maha-mrityunjaya'];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingFavorites));

      await removeFavorite('gayatri-mantra');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@shloka_sadhana:favorites',
        JSON.stringify(['maha-mrityunjaya'])
      );
    });

    it('should handle removing non-existent favorite', async () => {
      const existingFavorites = ['gayatri-mantra'];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingFavorites));

      await removeFavorite('non-existent');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@shloka_sadhana:favorites',
        JSON.stringify(['gayatri-mantra'])
      );
    });

    it('should handle empty favorites list', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await removeFavorite('gayatri-mantra');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@shloka_sadhana:favorites',
        JSON.stringify([])
      );
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['gayatri-mantra']));
      mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(removeFavorite('gayatri-mantra')).resolves.not.toThrow();
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited shloka', async () => {
      const existingFavorites = ['gayatri-mantra', 'maha-mrityunjaya'];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingFavorites));

      const result = await isFavorite('gayatri-mantra');

      expect(result).toBe(true);
    });

    it('should return false for non-favorited shloka', async () => {
      const existingFavorites = ['gayatri-mantra'];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingFavorites));

      const result = await isFavorite('maha-mrityunjaya');

      expect(result).toBe(false);
    });

    it('should return false when no favorites exist', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await isFavorite('gayatri-mantra');

      expect(result).toBe(false);
    });

    it('should handle storage errors', async () => {
      mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await isFavorite('gayatri-mantra');

      expect(result).toBe(false);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', async () => {
      await clearFavorites();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@shloka_sadhana:favorites');
    });

    it('should handle storage errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValueOnce(new Error('Storage error'));

      await expect(clearFavorites()).resolves.not.toThrow();
    });
  });

  describe('In-memory caching', () => {
    it('should use in-memory cache for subsequent getFavorites calls', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['gayatri-mantra']));

      // First call - loads from storage
      const favorites1 = await getFavorites();

      // Second call - should use cache
      const favorites2 = await getFavorites();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(favorites1).toEqual(favorites2);
    });

    it('should update cache when adding favorite', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['gayatri-mantra']));

      await getFavorites(); // Load initial cache
      await addFavorite('maha-mrityunjaya'); // Should update cache

      const favorites = await getFavorites(); // Should use updated cache

      // getItem called only once (initial load), not for the third getFavorites
      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(favorites).toContain('maha-mrityunjaya');
    });

    it('should update cache when removing favorite', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(['gayatri-mantra', 'maha-mrityunjaya']));

      await getFavorites(); // Load initial cache
      await removeFavorite('gayatri-mantra'); // Should update cache

      const favorites = await getFavorites(); // Should use updated cache

      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(1);
      expect(favorites).not.toContain('gayatri-mantra');
      expect(favorites).toContain('maha-mrityunjaya');
    });

    it('should clear cache when clearFavorites is called', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(['gayatri-mantra']));

      await getFavorites(); // Load initial cache
      await clearFavorites(); // Should clear cache

      await getFavorites(); // Should reload from storage

      expect(mockAsyncStorage.getItem).toHaveBeenCalledTimes(2);
    });
  });
});
