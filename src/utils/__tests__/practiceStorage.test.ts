/**
 * Practice Storage Tests
 * Shloka Sadhana - Practice Persistence
 *
 * Tests for practice session and history storage
 */

import {
  saveActivePractice,
  loadActivePractice,
  clearActivePractice,
  savePracticeToHistory,
  loadPracticeHistory,
  getPracticeStats,
} from '../practiceStorage';
import { PracticeSession, CompletedPractice } from '@/types/practice';
import { getItem, setItem, removeItem } from '../storage';

// Mock storage
jest.mock('../storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockGetItem = getItem as jest.MockedFunction<typeof getItem>;
const mockSetItem = setItem as jest.MockedFunction<typeof setItem>;
const mockRemoveItem = removeItem as jest.MockedFunction<typeof removeItem>;

describe('Practice Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveActivePractice', () => {
    it('should save active practice session', async () => {
      const session: PracticeSession = {
        isActive: true,
        startTime: '2026-02-05T10:00:00.000Z',
        pausedTime: null,
        elapsedSeconds: 300,
        malaCount: 25,
        selectedShlokaId: 'gayatri-mantra',
        sankalp: 'For peace',
      };

      mockSetItem.mockResolvedValue(true);

      await saveActivePractice(session);

      expect(mockSetItem).toHaveBeenCalledWith('active_practice', session);
    });

    it('should save paused practice session', async () => {
      const session: PracticeSession = {
        isActive: false,
        startTime: '2026-02-05T10:00:00.000Z',
        pausedTime: '2026-02-05T10:05:00.000Z',
        elapsedSeconds: 300,
        malaCount: 25,
        selectedShlokaId: 'gayatri-mantra',
        sankalp: 'For peace',
      };

      mockSetItem.mockResolvedValue(true);

      await saveActivePractice(session);

      expect(mockSetItem).toHaveBeenCalledWith('active_practice', session);
    });
  });

  describe('loadActivePractice', () => {
    it('should load active practice session', async () => {
      const session: PracticeSession = {
        isActive: true,
        startTime: '2026-02-05T10:00:00.000Z',
        pausedTime: null,
        elapsedSeconds: 300,
        malaCount: 25,
        selectedShlokaId: 'gayatri-mantra',
        sankalp: 'For peace',
      };

      mockGetItem.mockResolvedValue(session);

      const result = await loadActivePractice();

      expect(mockGetItem).toHaveBeenCalledWith('active_practice');
      expect(result).toEqual(session);
    });

    it('should return null if no active practice exists', async () => {
      mockGetItem.mockResolvedValue(null);

      const result = await loadActivePractice();

      expect(result).toBeNull();
    });
  });

  describe('clearActivePractice', () => {
    it('should clear active practice session', async () => {
      mockRemoveItem.mockResolvedValue(true);

      await clearActivePractice();

      expect(mockRemoveItem).toHaveBeenCalledWith('active_practice');
    });
  });

  describe('savePracticeToHistory', () => {
    it('should save completed practice to history', async () => {
      const practice: CompletedPractice = {
        id: 'practice-1',
        date: '2026-02-05T10:20:00.000Z',
        duration: 1200,
        malaCount: 108,
        shlokaId: 'gayatri-mantra',
        shlokaName: 'Gayatri Mantra',
        sankalp: 'For peace',
        offering: 'For my family',
        notes: null,
      };

      const existingHistory: CompletedPractice[] = [];
      mockGetItem.mockResolvedValue(existingHistory);
      mockSetItem.mockResolvedValue(true);

      await savePracticeToHistory(practice);

      expect(mockGetItem).toHaveBeenCalledWith('practice_history');
      expect(mockSetItem).toHaveBeenCalledWith('practice_history', [practice]);
    });

    it('should append practice to existing history', async () => {
      const existingPractice: CompletedPractice = {
        id: 'practice-1',
        date: '2026-02-04T10:00:00.000Z',
        duration: 900,
        malaCount: 108,
        shlokaId: 'ganesh-mantra',
        shlokaName: 'Ganesh Mantra',
        sankalp: null,
        offering: null,
        notes: null,
      };

      const newPractice: CompletedPractice = {
        id: 'practice-2',
        date: '2026-02-05T10:20:00.000Z',
        duration: 1200,
        malaCount: 108,
        shlokaId: 'gayatri-mantra',
        shlokaName: 'Gayatri Mantra',
        sankalp: 'For peace',
        offering: 'For my family',
        notes: null,
      };

      mockGetItem.mockResolvedValue([existingPractice]);
      mockSetItem.mockResolvedValue(true);

      await savePracticeToHistory(newPractice);

      expect(mockSetItem).toHaveBeenCalledWith('practice_history', [
        existingPractice,
        newPractice,
      ]);
    });
  });

  describe('loadPracticeHistory', () => {
    it('should load practice history', async () => {
      const history: CompletedPractice[] = [
        {
          id: 'practice-1',
          date: '2026-02-05T10:00:00.000Z',
          duration: 1200,
          malaCount: 108,
          shlokaId: 'gayatri-mantra',
          shlokaName: 'Gayatri Mantra',
          sankalp: null,
          offering: null,
        notes: null,
        },
      ];

      mockGetItem.mockResolvedValue(history);

      const result = await loadPracticeHistory();

      expect(mockGetItem).toHaveBeenCalledWith('practice_history');
      expect(result).toEqual(history);
    });

    it('should return empty array if no history exists', async () => {
      mockGetItem.mockResolvedValue(null);

      const result = await loadPracticeHistory();

      expect(result).toEqual([]);
    });
  });

  describe('getPracticeStats', () => {
    it('should calculate practice statistics', async () => {
      const history: CompletedPractice[] = [
        {
          id: 'practice-1',
          date: '2026-02-03T10:00:00.000Z',
          duration: 1200, // 20 minutes
          malaCount: 108,
          shlokaId: 'gayatri-mantra',
          shlokaName: 'Gayatri Mantra',
          sankalp: null,
          offering: null,
        notes: null,
        },
        {
          id: 'practice-2',
          date: '2026-02-04T10:00:00.000Z',
          duration: 900, // 15 minutes
          malaCount: 108,
          shlokaId: 'gayatri-mantra',
          shlokaName: 'Gayatri Mantra',
          sankalp: null,
          offering: null,
        notes: null,
        },
        {
          id: 'practice-3',
          date: '2026-02-05T10:00:00.000Z',
          duration: 600, // 10 minutes
          malaCount: 54,
          shlokaId: 'ganesh-mantra',
          shlokaName: 'Ganesh Mantra',
          sankalp: null,
          offering: null,
        notes: null,
        },
      ];

      mockGetItem.mockResolvedValue(history);

      const stats = await getPracticeStats();

      expect(stats.totalPractices).toBe(3);
      expect(stats.totalMinutes).toBe(45); // 20 + 15 + 10
      expect(stats.totalMalas).toBe(270); // 108 + 108 + 54
      expect(stats.favoriteShlokaId).toBe('gayatri-mantra'); // Most practiced
      expect(stats.lastPracticeDate).toBe('2026-02-05T10:00:00.000Z');
    });

    it('should return zero stats if no history exists', async () => {
      mockGetItem.mockResolvedValue(null);

      const stats = await getPracticeStats();

      expect(stats.totalPractices).toBe(0);
      expect(stats.totalMinutes).toBe(0);
      expect(stats.totalMalas).toBe(0);
      expect(stats.favoriteShlokaId).toBeNull();
      expect(stats.lastPracticeDate).toBeNull();
    });
  });
});
