/**
 * useAchievements Hook Tests
 * Shloka Sadhana — Achievement unlock system hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAchievements } from '../useAchievements';
import { getItem, setItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/StorageKeys';
import { ACHIEVEMENTS } from '../../data/achievements';

// Mock storage utilities
jest.mock('../../utils/storage');
const mockGetItem = getItem as jest.MockedFunction<typeof getItem>;
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;

describe('useAchievements', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(true);
  });

  describe('Initial State', () => {
    it('should start with isLoading=true then false', async () => {
      // Delay the storage response slightly
      mockGetItem.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 10))
      );

      const { result } = renderHook(() => useAchievements());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should initialize with empty unlockedIds and xp=0 when storage is empty', async () => {
      mockGetItem.mockResolvedValue(null);

      const { result } = renderHook(() => useAchievements());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.unlockedIds).toEqual([]);
        expect(result.current.xp).toBe(0);
      });
    });

    it('should initialize recentlyUnlocked as null', async () => {
      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.recentlyUnlocked).toBeNull();
    });

    it('should load previously unlocked ids and xp from storage', async () => {
      mockGetItem.mockResolvedValue({
        unlockedIds: ['first_practice', 'week_streak'],
        xp: 150,
      });

      const { result } = renderHook(() => useAchievements());

      await waitFor(() => {
        expect(result.current.unlockedIds).toEqual(['first_practice', 'week_streak']);
        expect(result.current.xp).toBe(150);
      });
    });

    it('should handle storage load error gracefully (defaults to empty)', async () => {
      mockGetItem.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useAchievements());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.unlockedIds).toEqual([]);
        expect(result.current.xp).toBe(0);
      });
    });
  });

  describe('checkAndUnlock', () => {
    it('should unlock first_practice when totalPractices >= 1', async () => {
      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let unlocked: Awaited<ReturnType<typeof result.current.checkAndUnlock>>;
      await act(async () => {
        unlocked = await result.current.checkAndUnlock({
          totalPractices: 1,
          currentStreak: 0,
          totalMalas: 0,
        });
      });

      expect(unlocked!).not.toBeNull();
      expect(unlocked!.id).toBe('first_practice');
    });

    it('should add the achievement XP to the total', async () => {
      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      const firstPractice = ACHIEVEMENTS.find((a) => a.id === 'first_practice')!;

      await act(async () => {
        await result.current.checkAndUnlock({
          totalPractices: 1,
          currentStreak: 0,
          totalMalas: 0,
        });
      });

      expect(result.current.xp).toBe(firstPractice.xpReward);
    });

    it('should set recentlyUnlocked to the first newly unlocked achievement', async () => {
      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.checkAndUnlock({
          totalPractices: 1,
          currentStreak: 0,
          totalMalas: 0,
        });
      });

      expect(result.current.recentlyUnlocked).not.toBeNull();
      expect(result.current.recentlyUnlocked?.id).toBe('first_practice');
    });

    it('should not double-count already-unlocked achievements', async () => {
      mockGetItem.mockResolvedValue({
        unlockedIds: ['first_practice'],
        xp: 50,
      });

      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let unlocked: Awaited<ReturnType<typeof result.current.checkAndUnlock>>;
      await act(async () => {
        unlocked = await result.current.checkAndUnlock({
          totalPractices: 1,
          currentStreak: 0,
          totalMalas: 0,
        });
      });

      // first_practice already unlocked — nothing new
      expect(unlocked!).toBeNull();
      expect(result.current.xp).toBe(50); // unchanged
    });

    it('should persist new unlock state to storage', async () => {
      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.checkAndUnlock({
          totalPractices: 1,
          currentStreak: 0,
          totalMalas: 0,
        });
      });

      expect(mockSetItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ACHIEVEMENTS,
        expect.objectContaining({
          unlockedIds: expect.arrayContaining(['first_practice']),
          xp: expect.any(Number),
        })
      );
    });

    it('should return null when no new achievements are unlocked', async () => {
      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let unlocked: Awaited<ReturnType<typeof result.current.checkAndUnlock>>;
      await act(async () => {
        unlocked = await result.current.checkAndUnlock({
          totalPractices: 0,
          currentStreak: 0,
          totalMalas: 0,
        });
      });

      expect(unlocked!).toBeNull();
    });

    it('should unlock streak achievement when currentStreak meets threshold', async () => {
      const weekStreak = ACHIEVEMENTS.find((a) => a.id === 'week_streak')!;

      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let unlocked: Awaited<ReturnType<typeof result.current.checkAndUnlock>>;
      await act(async () => {
        unlocked = await result.current.checkAndUnlock({
          totalPractices: 0,
          currentStreak: weekStreak.unlockCondition.value,
          totalMalas: 0,
        });
      });

      expect(unlocked!).not.toBeNull();
      expect(result.current.unlockedIds).toContain('week_streak');
    });

    it('should unlock malas achievement when totalMalas meets threshold', async () => {
      const malaMaster = ACHIEVEMENTS.find((a) => a.id === 'mala_master')!;

      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.checkAndUnlock({
          totalPractices: 0,
          currentStreak: 0,
          totalMalas: malaMaster.unlockCondition.value,
        });
      });

      expect(result.current.unlockedIds).toContain('mala_master');
    });
  });

  describe('dismissRecentlyUnlocked', () => {
    it('should clear recentlyUnlocked to null', async () => {
      const { result } = renderHook(() => useAchievements());

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // Unlock one
      await act(async () => {
        await result.current.checkAndUnlock({
          totalPractices: 1,
          currentStreak: 0,
          totalMalas: 0,
        });
      });

      expect(result.current.recentlyUnlocked).not.toBeNull();

      act(() => {
        result.current.dismissRecentlyUnlocked();
      });

      expect(result.current.recentlyUnlocked).toBeNull();
    });
  });
});
