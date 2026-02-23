/**
 * useQuestProgress Hook Tests
 * Shloka Sadhana — Daily quest progress hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useQuestProgress } from '../useQuestProgress';
import { getItem, setItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/StorageKeys';
import { getTodayQuest } from '../../data/quests';

// Mock storage utilities
jest.mock('../../utils/storage');
const mockGetItem = getItem as jest.MockedFunction<typeof getItem>;
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;

// Fix the today date so tests are deterministic
const FIXED_TODAY = '2026-02-22';

jest.mock('../../data/quests', () => ({
  ...jest.requireActual('../../data/quests'),
  getTodayQuest: jest.fn(),
}));
const mockGetTodayQuest = getTodayQuest as jest.MockedFunction<typeof getTodayQuest>;

const MOCK_QUEST = {
  id: 'daily_practice',
  title: 'Complete a Practice',
  description: 'Finish one full practice session today.',
  target: 1,
  type: 'practices' as const,
  xpReward: 50,
};

// Fix Date.prototype.toISOString to return fixed date
const originalToISOString = Date.prototype.toISOString;
beforeAll(() => {
  jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(`${FIXED_TODAY}T00:00:00.000Z`);
});
afterAll(() => {
  // eslint-disable-next-line no-extend-native -- restoring mocked Date.prototype in test teardown
  Date.prototype.toISOString = originalToISOString;
});

describe('useQuestProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayQuest.mockReturnValue(MOCK_QUEST);
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(true);
  });

  describe('Initial State', () => {
    it('should start with progress=0, isCompleted=false, xpEarned=0', async () => {
      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => {
        expect(result.current.progress).toBe(0);
        expect(result.current.isCompleted).toBe(false);
        expect(result.current.xpEarned).toBe(0);
      });
    });

    it('should return todayQuest from getTodayQuest()', async () => {
      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => {
        expect(result.current.todayQuest.id).toBe(MOCK_QUEST.id);
        expect(result.current.todayQuest.title).toBe(MOCK_QUEST.title);
      });
    });

    it('should load saved progress for today from storage', async () => {
      mockGetItem.mockResolvedValue({
        date: FIXED_TODAY,
        progress: { daily_practice: 1 },
      });

      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => {
        expect(result.current.progress).toBe(1);
      });
    });

    it('should restore xpEarned if quest was already completed today', async () => {
      mockGetItem.mockResolvedValue({
        date: FIXED_TODAY,
        progress: { daily_practice: 1 }, // target is 1, so completed
      });

      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => {
        expect(result.current.xpEarned).toBe(MOCK_QUEST.xpReward);
        expect(result.current.isCompleted).toBe(true);
      });
    });

    it('should reset progress when saved date differs from today', async () => {
      mockGetItem.mockResolvedValue({
        date: '2026-02-21', // yesterday
        progress: { daily_practice: 1 },
      });

      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => {
        expect(result.current.progress).toBe(0);
        expect(result.current.xpEarned).toBe(0);
      });
    });

    it('should persist a fresh record to storage when date has changed', async () => {
      mockGetItem.mockResolvedValue({
        date: '2026-02-21',
        progress: { daily_practice: 1 },
      });

      renderHook(() => useQuestProgress());

      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalledWith(
          STORAGE_KEYS.QUEST_PROGRESS,
          expect.objectContaining({ date: FIXED_TODAY, progress: {} })
        );
      });
    });

  });

  describe('incrementProgress', () => {
    it('should increase progress by 1 by default', async () => {
      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => expect(result.current.progress).toBe(0));

      await act(async () => {
        await result.current.incrementProgress();
      });

      expect(result.current.progress).toBe(1);
    });

    it('should increase progress by custom amount', async () => {
      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => expect(result.current.progress).toBe(0));

      await act(async () => {
        await result.current.incrementProgress(5);
      });

      expect(result.current.progress).toBe(5);
    });

    it('should mark isCompleted=true when progress reaches target', async () => {
      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => expect(result.current.isCompleted).toBe(false));

      await act(async () => {
        await result.current.incrementProgress(1); // target is 1
      });

      expect(result.current.isCompleted).toBe(true);
    });

    it('should award xpEarned when target first reached', async () => {
      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => expect(result.current.xpEarned).toBe(0));

      await act(async () => {
        await result.current.incrementProgress(1);
      });

      expect(result.current.xpEarned).toBe(MOCK_QUEST.xpReward);
    });

    it('should not double-award XP on subsequent increments after completion', async () => {
      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => expect(result.current.xpEarned).toBe(0));

      await act(async () => {
        await result.current.incrementProgress(1); // complete
      });
      await act(async () => {
        await result.current.incrementProgress(1); // already complete
      });

      expect(result.current.xpEarned).toBe(MOCK_QUEST.xpReward); // not doubled
    });

    it('should persist updated progress to storage', async () => {
      const { result } = renderHook(() => useQuestProgress());

      await waitFor(() => expect(result.current.progress).toBe(0));

      await act(async () => {
        await result.current.incrementProgress();
      });

      expect(mockSetItem).toHaveBeenCalledWith(
        STORAGE_KEYS.QUEST_PROGRESS,
        expect.objectContaining({
          progress: expect.objectContaining({ daily_practice: 1 }),
        })
      );
    });
  });
});
