/**
 * Goals Storage Tests
 * Shloka Sadhana - Practice Goals Persistence
 */

import {
  saveGoal,
  loadGoal,
  clearGoal,
  updateGoalProgress,
  resetGoalIfExpired,
} from '../goalsStorage';
import { PracticeGoal } from '@/types/practice';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import * as storage from '../storage';

// Mock the storage module
jest.mock('../storage');

const mockGetItem = storage.getItem as jest.MockedFunction<typeof storage.getItem>;
const mockSetItem = storage.setItem as jest.MockedFunction<typeof storage.setItem>;
const mockRemoveItem = storage.removeItem as jest.MockedFunction<typeof storage.removeItem>;

describe('goalsStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveGoal', () => {
    it('should save goal to storage', async () => {
      const goal: PracticeGoal = {
        id: 'goal-1',
        type: 'daily',
        targetSessions: 1,
        currentProgress: 0,
        startDate: '2026-02-05T00:00:00.000Z',
        isActive: true,
      };

      mockSetItem.mockResolvedValue(true);

      await saveGoal(goal);

      expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.GOAL, goal);
    });
  });

  describe('loadGoal', () => {
    it('should load goal from storage', async () => {
      const goal: PracticeGoal = {
        id: 'goal-1',
        type: 'weekly',
        targetSessions: 5,
        currentProgress: 2,
        startDate: '2026-02-03T00:00:00.000Z',
        isActive: true,
      };

      mockGetItem.mockResolvedValue(goal);

      const result = await loadGoal();

      expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.GOAL);
      expect(result).toEqual(goal);
    });

    it('should return null if no goal exists', async () => {
      mockGetItem.mockResolvedValue(null);

      const result = await loadGoal();

      expect(result).toBeNull();
    });
  });

  describe('clearGoal', () => {
    it('should remove goal from storage', async () => {
      mockRemoveItem.mockResolvedValue(true);

      await clearGoal();

      expect(mockRemoveItem).toHaveBeenCalledWith(STORAGE_KEYS.GOAL);
    });
  });

  describe('updateGoalProgress', () => {
    it('should increment goal progress', async () => {
      const goal: PracticeGoal = {
        id: 'goal-1',
        type: 'daily',
        targetSessions: 3,
        currentProgress: 1,
        startDate: '2026-02-05T00:00:00.000Z',
        isActive: true,
      };

      mockGetItem.mockResolvedValue(goal);
      mockSetItem.mockResolvedValue(true);

      await updateGoalProgress();

      expect(mockGetItem).toHaveBeenCalledWith(STORAGE_KEYS.GOAL);
      expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.GOAL, {
        ...goal,
        currentProgress: 2,
      });
    });

    it('should not update if no goal exists', async () => {
      mockGetItem.mockResolvedValue(null);

      await updateGoalProgress();

      expect(mockSetItem).not.toHaveBeenCalled();
    });

    it('should mark goal as inactive when target reached', async () => {
      const goal: PracticeGoal = {
        id: 'goal-1',
        type: 'daily',
        targetSessions: 2,
        currentProgress: 1,
        startDate: '2026-02-05T00:00:00.000Z',
        isActive: true,
      };

      mockGetItem.mockResolvedValue(goal);
      mockSetItem.mockResolvedValue(true);

      await updateGoalProgress();

      expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.GOAL, {
        ...goal,
        currentProgress: 2,
        isActive: false, // Goal completed
      });
    });
  });

  describe('resetGoalIfExpired', () => {
    it('should reset daily goal if day has changed', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const goal: PracticeGoal = {
        id: 'goal-1',
        type: 'daily',
        targetSessions: 1,
        currentProgress: 1,
        startDate: yesterday.toISOString(),
        isActive: false,
      };

      mockGetItem.mockResolvedValue(goal);
      mockSetItem.mockResolvedValue(true);

      const now = new Date().toISOString();
      await resetGoalIfExpired(now);

      expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.GOAL, {
        ...goal,
        currentProgress: 0,
        startDate: expect.any(String),
        isActive: true,
      });
    });

    it('should reset weekly goal if week has changed', async () => {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 8);

      const goal: PracticeGoal = {
        id: 'goal-1',
        type: 'weekly',
        targetSessions: 5,
        currentProgress: 3,
        startDate: lastWeek.toISOString(),
        isActive: true,
      };

      mockGetItem.mockResolvedValue(goal);
      mockSetItem.mockResolvedValue(true);

      const now = new Date().toISOString();
      await resetGoalIfExpired(now);

      expect(mockSetItem).toHaveBeenCalledWith(STORAGE_KEYS.GOAL, {
        ...goal,
        currentProgress: 0,
        startDate: expect.any(String),
        isActive: true,
      });
    });

    it('should not reset if goal period is still active', async () => {
      const today = new Date();

      const goal: PracticeGoal = {
        id: 'goal-1',
        type: 'daily',
        targetSessions: 1,
        currentProgress: 0,
        startDate: today.toISOString(),
        isActive: true,
      };

      mockGetItem.mockResolvedValue(goal);

      await resetGoalIfExpired(today.toISOString());

      expect(mockSetItem).not.toHaveBeenCalled();
    });

    it('should do nothing if no goal exists', async () => {
      mockGetItem.mockResolvedValue(null);

      await resetGoalIfExpired(new Date().toISOString());

      expect(mockSetItem).not.toHaveBeenCalled();
    });
  });
});
