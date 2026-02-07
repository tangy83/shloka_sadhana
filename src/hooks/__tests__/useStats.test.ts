/**
 * useStats Hook Tests
 * Shloka Sadhana - Practice Statistics Hook
 *
 * Tests for calculating weekly and monthly practice statistics
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useStats } from '../useStats';
import { CompletedPractice } from '@/types/practice';
import * as practiceStorage from '@/utils/practiceStorage';

// Mock the practiceStorage module
jest.mock('@/utils/practiceStorage');

const mockLoadPracticeHistory = practiceStorage.loadPracticeHistory as jest.MockedFunction<
  typeof practiceStorage.loadPracticeHistory
>;

describe('useStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with loading state', () => {
      mockLoadPracticeHistory.mockResolvedValue([]);

      const { result } = renderHook(() => useStats());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.weeklyStats).toBeNull();
      expect(result.current.monthlyStats).toBeNull();
    });
  });

  describe('Weekly Stats', () => {
    it('should calculate weekly practice count', async () => {
      const now = new Date('2026-02-05T12:00:00.000Z');
      const practices: CompletedPractice[] = [
        {
          id: 'p1',
          date: '2026-02-03T10:00:00.000Z', // Monday this week
          duration: 600,
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
        {
          id: 'p2',
          date: '2026-02-04T10:00:00.000Z', // Tuesday this week
          duration: 900,
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
        {
          id: 'p3',
          date: '2026-01-29T10:00:00.000Z', // Last week
          duration: 600,
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
      ];

      mockLoadPracticeHistory.mockResolvedValue(practices);

      const { result } = renderHook(() => useStats(now.toISOString()));

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.weeklyStats?.totalSessions).toBe(2);
    });

    it('should calculate weekly total minutes', async () => {
      const now = new Date('2026-02-05T12:00:00.000Z');
      const practices: CompletedPractice[] = [
        {
          id: 'p1',
          date: '2026-02-03T10:00:00.000Z',
          duration: 600, // 10 minutes
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
        {
          id: 'p2',
          date: '2026-02-04T10:00:00.000Z',
          duration: 900, // 15 minutes
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
      ];

      mockLoadPracticeHistory.mockResolvedValue(practices);

      const { result } = renderHook(() => useStats(now.toISOString()));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.weeklyStats?.totalMinutes).toBe(25); // 10 + 15
    });

    it('should calculate weekly total malas', async () => {
      const now = new Date('2026-02-05T12:00:00.000Z');
      const practices: CompletedPractice[] = [
        {
          id: 'p1',
          date: '2026-02-03T10:00:00.000Z',
          duration: 600,
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
        {
          id: 'p2',
          date: '2026-02-04T10:00:00.000Z',
          duration: 900,
          malaCount: 216,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
      ];

      mockLoadPracticeHistory.mockResolvedValue(practices);

      const { result } = renderHook(() => useStats(now.toISOString()));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.weeklyStats?.totalMalas).toBe(324); // 108 + 216
    });

    it('should return zero stats for empty week', async () => {
      const now = new Date('2026-02-05T12:00:00.000Z');

      mockLoadPracticeHistory.mockResolvedValue([]);

      const { result } = renderHook(() => useStats(now.toISOString()));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.weeklyStats?.totalSessions).toBe(0);
      expect(result.current.weeklyStats?.totalMinutes).toBe(0);
      expect(result.current.weeklyStats?.totalMalas).toBe(0);
    });
  });

  describe('Monthly Stats', () => {
    it('should calculate monthly practice count', async () => {
      const now = new Date('2026-02-15T12:00:00.000Z');
      const practices: CompletedPractice[] = [
        {
          id: 'p1',
          date: '2026-02-01T10:00:00.000Z', // This month
          duration: 600,
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
        {
          id: 'p2',
          date: '2026-02-10T10:00:00.000Z', // This month
          duration: 900,
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
        {
          id: 'p3',
          date: '2026-01-15T10:00:00.000Z', // Last month
          duration: 600,
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
      ];

      mockLoadPracticeHistory.mockResolvedValue(practices);

      const { result } = renderHook(() => useStats(now.toISOString()));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.monthlyStats?.totalSessions).toBe(2);
    });

    it('should calculate monthly total minutes', async () => {
      const now = new Date('2026-02-15T12:00:00.000Z');
      const practices: CompletedPractice[] = [
        {
          id: 'p1',
          date: '2026-02-01T10:00:00.000Z',
          duration: 1200, // 20 minutes
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
        {
          id: 'p2',
          date: '2026-02-10T10:00:00.000Z',
          duration: 1800, // 30 minutes
          malaCount: 108,
          shlokaId: null,
          shlokaName: null,
          sankalp: null,
          offering: null,
          notes: null,
        },
      ];

      mockLoadPracticeHistory.mockResolvedValue(practices);

      const { result } = renderHook(() => useStats(now.toISOString()));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.monthlyStats?.totalMinutes).toBe(50); // 20 + 30
    });

    it('should return zero stats for empty month', async () => {
      const now = new Date('2026-02-15T12:00:00.000Z');

      mockLoadPracticeHistory.mockResolvedValue([]);

      const { result } = renderHook(() => useStats(now.toISOString()));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.monthlyStats?.totalSessions).toBe(0);
      expect(result.current.monthlyStats?.totalMinutes).toBe(0);
      expect(result.current.monthlyStats?.totalMalas).toBe(0);
    });
  });

  describe('Longest Streak', () => {
    it('should calculate longest streak from history', async () => {
      const practices: CompletedPractice[] = [
        { id: 'p1', date: '2026-02-01T10:00:00.000Z', duration: 600, malaCount: 108, shlokaId: null, shlokaName: null, sankalp: null, offering: null, notes: null },
        { id: 'p2', date: '2026-02-02T10:00:00.000Z', duration: 600, malaCount: 108, shlokaId: null, shlokaName: null, sankalp: null, offering: null, notes: null },
        { id: 'p3', date: '2026-02-03T10:00:00.000Z', duration: 600, malaCount: 108, shlokaId: null, shlokaName: null, sankalp: null, offering: null, notes: null },
        // Gap
        { id: 'p4', date: '2026-02-10T10:00:00.000Z', duration: 600, malaCount: 108, shlokaId: null, shlokaName: null, sankalp: null, offering: null, notes: null },
        { id: 'p5', date: '2026-02-11T10:00:00.000Z', duration: 600, malaCount: 108, shlokaId: null, shlokaName: null, sankalp: null, offering: null, notes: null },
      ];

      mockLoadPracticeHistory.mockResolvedValue(practices);

      const { result } = renderHook(() => useStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.longestStreak).toBe(3);
    });

    it('should return 0 for no practices', async () => {
      mockLoadPracticeHistory.mockResolvedValue([]);

      const { result } = renderHook(() => useStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.longestStreak).toBe(0);
    });
  });

  describe('Loading State', () => {
    it('should set loading to false after data loads', async () => {
      mockLoadPracticeHistory.mockResolvedValue([]);

      const { result } = renderHook(() => useStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
