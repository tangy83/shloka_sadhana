/**
 * Content Loader Tests
 * Shloka Sadhana - Configurable Content System
 *
 * Tests for loading shloka content from JSON (local and remote)
 */

import { loadShlokaContent, getCachedContent, clearContentCache } from '../contentLoader';
import { Shloka } from '@/types';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Content Loader', () => {
  const mockShlokaData: Shloka[] = [
    {
      id: 'test-shloka-1',
      name: 'Test Mantra 1',
      shortName: 'Test 1',
      deity: 'Test Deity',
      description: 'Test description',
      benefits: 'Test benefits',
      duration: '5 minutes',
      bestTime: 'Morning',
      youtubeUrl: 'https://youtube.com/test1',
      sections: [
        {
          id: 1,
          sanskrit: 'ॐ',
          transliteration: 'Om',
          meaning: 'Universal sound',
        },
      ],
    },
    {
      id: 'test-shloka-2',
      name: 'Test Mantra 2',
      shortName: 'Test 2',
      deity: 'Test Deity 2',
      description: 'Test description 2',
      benefits: 'Test benefits 2',
      duration: '10 minutes',
      bestTime: 'Evening',
      youtubeUrl: 'https://youtube.com/test2',
      sections: [
        {
          id: 1,
          sanskrit: 'ॐ',
          transliteration: 'Om',
          meaning: 'Universal sound',
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    clearContentCache();
  });

  describe('loadShlokaContent', () => {
    it('should load content from local fallback if no remote URL', async () => {
      const content = await loadShlokaContent();

      expect(content).toBeDefined();
      expect(Array.isArray(content)).toBe(true);
      expect(content.length).toBeGreaterThan(0);
    });

    it('should fetch content from remote URL if provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShlokaData,
      } as Response);

      const content = await loadShlokaContent('https://api.example.com/shlokas.json');

      expect(mockFetch).toHaveBeenCalledWith('https://api.example.com/shlokas.json');
      expect(content).toEqual(mockShlokaData);
    });

    it('should cache fetched content to AsyncStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShlokaData,
      } as Response);

      await loadShlokaContent('https://api.example.com/shlokas.json');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@shloka_sadhana:content_cache',
        JSON.stringify(mockShlokaData)
      );
    });

    it('should fall back to local content if fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const content = await loadShlokaContent('https://api.example.com/shlokas.json');

      expect(content).toBeDefined();
      expect(Array.isArray(content)).toBe(true);
      expect(content.length).toBeGreaterThan(0);
    });

    it('should use cached content if available and fetch fails', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockShlokaData));
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const content = await loadShlokaContent('https://api.example.com/shlokas.json');

      expect(content).toEqual(mockShlokaData);
    });

    it('should handle invalid JSON from fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const content = await loadShlokaContent('https://api.example.com/shlokas.json');

      // Should fall back to local content
      expect(content).toBeDefined();
      expect(Array.isArray(content)).toBe(true);
    });

    it('should handle non-OK fetch response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const content = await loadShlokaContent('https://api.example.com/shlokas.json');

      // Should fall back to local content
      expect(content).toBeDefined();
      expect(Array.isArray(content)).toBe(true);
    });
  });

  describe('getCachedContent', () => {
    it('should return null if no cache exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const cached = await getCachedContent();

      expect(cached).toBeNull();
    });

    it('should return parsed cached content', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockShlokaData));

      const cached = await getCachedContent();

      expect(cached).toEqual(mockShlokaData);
    });

    it('should return null if cache is invalid JSON', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      const cached = await getCachedContent();

      expect(cached).toBeNull();
    });
  });

  describe('clearContentCache', () => {
    it('should clear cached content from AsyncStorage', async () => {
      await clearContentCache();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@shloka_sadhana:content_cache');
    });
  });

  describe('In-memory cache', () => {
    it('should return in-memory cached content on subsequent calls', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShlokaData,
      } as Response);

      // First call - fetches from remote
      const content1 = await loadShlokaContent('https://api.example.com/shlokas.json');

      // Second call - should use in-memory cache
      const content2 = await loadShlokaContent('https://api.example.com/shlokas.json');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(content1).toEqual(content2);
    });

    it('should clear in-memory cache when clearContentCache is called', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockShlokaData,
      } as Response);

      // First call
      await loadShlokaContent('https://api.example.com/shlokas.json');

      // Clear cache
      clearContentCache();

      // Second call - should fetch again
      await loadShlokaContent('https://api.example.com/shlokas.json');

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
