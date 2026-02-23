/**
 * useUserProfile Hook Tests
 * Shloka Sadhana — Local user profile hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserProfile } from '../useUserProfile';
import { getItem, setItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/StorageKeys';

// Mock storage
jest.mock('../../utils/storage');
const mockGetItem = getItem as jest.MockedFunction<typeof getItem>;
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;

describe('useUserProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(true);
  });

  describe('Initial State', () => {
    it('should start with isLoading=true then resolve to false', async () => {
      mockGetItem.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 10))
      );

      const { result } = renderHook(() => useUserProfile());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should return default profile when storage is empty', async () => {
      mockGetItem.mockResolvedValue(null);

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.profile.displayName).toBe('');
      expect(result.current.profile.avatarEmoji).toBe('🙏');
    });

    it('should load saved profile from storage', async () => {
      const savedProfile = { displayName: 'Priya', avatarEmoji: '🌸' };
      mockGetItem.mockResolvedValue(savedProfile);

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.profile.displayName).toBe('Priya');
        expect(result.current.profile.avatarEmoji).toBe('🌸');
      });
    });

    it('should load from correct storage key', async () => {
      renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_PROFILE);
      });
    });

    it('should fall back to default profile on storage error', async () => {
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.profile.displayName).toBe('');
        expect(result.current.profile.avatarEmoji).toBe('🙏');
      });
    });
  });

  describe('saveProfile', () => {
    it('should update in-memory profile', async () => {
      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.saveProfile({ displayName: 'Tanuj', avatarEmoji: '🙏' });
      });

      expect(result.current.profile.displayName).toBe('Tanuj');
    });

    it('should persist profile to AsyncStorage', async () => {
      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const newProfile = { displayName: 'Meera', avatarEmoji: '🌺' };

      await act(async () => {
        await result.current.saveProfile(newProfile);
      });

      expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_PROFILE, newProfile);
    });

    it('should update avatarEmoji when saving profile', async () => {
      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.saveProfile({ displayName: '', avatarEmoji: '🌟' });
      });

      expect(result.current.profile.avatarEmoji).toBe('🌟');
    });

    it('should handle storage save error gracefully (not throw)', async () => {
      mockSetItem.mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useUserProfile());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.saveProfile({ displayName: 'Test', avatarEmoji: '🙏' });
        })
      ).resolves.not.toThrow();
    });
  });
});
