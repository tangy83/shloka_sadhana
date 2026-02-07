/**
 * useStreak Hook Tests
 * Shloka Sadhana - Streak Management Hook
 *
 * Tests for streak tracking, calculation, and persistence
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useStreak } from '../useStreak';
import { storage } from '../../utils/storage';
import { getTodayISO } from '../../utils/dateUtils';

// Mock storage service
jest.mock('../../utils/storage');
const mockStorage = storage as jest.Mocked<typeof storage>;

// Mock date utilities with explicit implementation
jest.mock('../../utils/dateUtils', () => ({
  getTodayISO: jest.fn(),
}));
const mockGetTodayISO = getTodayISO as jest.MockedFunction<typeof getTodayISO>;

describe('useStreak', () => {
  const TODAY = '2026-02-05';
  const YESTERDAY = '2026-02-04';
  const TWO_DAYS_AGO = '2026-02-03';

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayISO.mockReturnValue(TODAY);
  });

  describe('Initial Load', () => {
    it('should load existing streak data from storage', async () => {
      const existingData = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: YESTERDAY,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(existingData);

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.currentStreak).toBe(5);
        expect(result.current.longestStreak).toBe(10);
        expect(result.current.totalPractices).toBe(25);
      });
    });

    it('should initialize with defaults if no streak data exists', async () => {
      mockStorage.getStreak.mockResolvedValue(null);

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.currentStreak).toBe(0);
        expect(result.current.longestStreak).toBe(0);
        expect(result.current.totalPractices).toBe(0);
      });
    });

    it('should show loading state while fetching data', () => {
      mockStorage.getStreak.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      );

      const { result } = renderHook(() => useStreak());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Mark Today Complete', () => {
    it('should start a new streak when completing for the first time', async () => {
      mockStorage.getStreak.mockResolvedValue(null);
      mockStorage.saveStreak.mockResolvedValue();

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markTodayComplete();
      });

      expect(result.current.currentStreak).toBe(1);
      expect(result.current.longestStreak).toBe(1);
      expect(result.current.totalPractices).toBe(1);
      expect(result.current.isPracticedToday).toBe(true);
    });

    it('should continue streak when practicing on consecutive days', async () => {
      const existingData = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: YESTERDAY,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(existingData);
      mockStorage.saveStreak.mockResolvedValue();

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markTodayComplete();
      });

      expect(result.current.currentStreak).toBe(6);
      expect(result.current.longestStreak).toBe(10);
      expect(result.current.totalPractices).toBe(26);
    });

    it('should update longest streak when current exceeds it', async () => {
      const existingData = {
        currentStreak: 10,
        longestStreak: 10,
        lastCompletedDate: YESTERDAY,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(existingData);
      mockStorage.saveStreak.mockResolvedValue();

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markTodayComplete();
      });

      expect(result.current.currentStreak).toBe(11);
      expect(result.current.longestStreak).toBe(11);
    });

    it('should break streak when last practice was more than 1 day ago', async () => {
      const existingData = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: TWO_DAYS_AGO,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(existingData);
      mockStorage.saveStreak.mockResolvedValue();

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markTodayComplete();
      });

      expect(result.current.currentStreak).toBe(1);
      expect(result.current.longestStreak).toBe(10); // Should not change
      expect(result.current.totalPractices).toBe(26);
    });

    it('should prevent double-counting if already practiced today', async () => {
      const existingData = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: TODAY,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(existingData);
      mockStorage.saveStreak.mockResolvedValue();

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markTodayComplete();
      });

      // Should not change
      expect(result.current.currentStreak).toBe(5);
      expect(result.current.totalPractices).toBe(25);
      expect(mockStorage.saveStreak).not.toHaveBeenCalled();
    });

    it('should persist streak data to storage after marking complete', async () => {
      mockStorage.getStreak.mockResolvedValue(null);
      mockStorage.saveStreak.mockResolvedValue();

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.markTodayComplete();
      });

      expect(mockStorage.saveStreak).toHaveBeenCalledWith({
        currentStreak: 1,
        longestStreak: 1,
        lastCompletedDate: TODAY,
        totalPractices: 1,
      });
    });
  });

  describe('Streak Status', () => {
    it('should correctly identify if practiced today', async () => {
      const practicedToday = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: TODAY,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(practicedToday);

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isPracticedToday).toBe(true);
      });
    });

    it('should correctly identify if not practiced today', async () => {
      const notPracticedToday = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: YESTERDAY,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(notPracticedToday);

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isPracticedToday).toBe(false);
      });
    });

    it('should show streak is at risk if last practice was yesterday', async () => {
      const streakAtRisk = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: YESTERDAY,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(streakAtRisk);

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isStreakAtRisk).toBe(true);
      });
    });

    it('should show streak is not at risk if practiced today', async () => {
      const streakSafe = {
        currentStreak: 5,
        longestStreak: 10,
        lastCompletedDate: TODAY,
        totalPractices: 25,
      };

      mockStorage.getStreak.mockResolvedValue(streakSafe);

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isStreakAtRisk).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage load errors gracefully', async () => {
      mockStorage.getStreak.mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        // Should fallback to defaults
        expect(result.current.currentStreak).toBe(0);
      });
    });

    it('should handle storage save errors gracefully', async () => {
      mockStorage.getStreak.mockResolvedValue(null);
      mockStorage.saveStreak.mockRejectedValue(new Error('Save error'));

      const { result } = renderHook(() => useStreak());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw error
      await act(async () => {
        await expect(result.current.markTodayComplete()).resolves.not.toThrow();
      });
    });
  });
});
