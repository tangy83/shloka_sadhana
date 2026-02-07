/**
 * Practice Storage
 * Shloka Sadhana - Practice Session & History Persistence
 *
 * Utilities for saving and loading practice sessions and history
 */

import { getItem, setItem, removeItem } from './storage';
import {
  PracticeSession,
  CompletedPractice,
  PracticeStats,
} from '@/types/practice';

const ACTIVE_PRACTICE_KEY = 'active_practice';
const PRACTICE_HISTORY_KEY = 'practice_history';

/**
 * Save active practice session to storage
 */
export const saveActivePractice = async (
  session: PracticeSession
): Promise<void> => {
  await setItem(ACTIVE_PRACTICE_KEY, session);
};

/**
 * Load active practice session from storage
 */
export const loadActivePractice = async (): Promise<PracticeSession | null> => {
  return await getItem<PracticeSession>(ACTIVE_PRACTICE_KEY);
};

/**
 * Clear active practice session from storage
 */
export const clearActivePractice = async (): Promise<void> => {
  await removeItem(ACTIVE_PRACTICE_KEY);
};

/**
 * Save completed practice to history
 */
export const savePracticeToHistory = async (
  practice: CompletedPractice
): Promise<void> => {
  const history = await getItem<CompletedPractice[]>(PRACTICE_HISTORY_KEY);
  const updatedHistory = history ? [...history, practice] : [practice];
  await setItem(PRACTICE_HISTORY_KEY, updatedHistory);
};

/**
 * Load practice history from storage
 */
export const loadPracticeHistory = async (): Promise<CompletedPractice[]> => {
  const history = await getItem<CompletedPractice[]>(PRACTICE_HISTORY_KEY);
  return history || [];
};

/**
 * Calculate practice statistics from history
 */
export const getPracticeStats = async (): Promise<PracticeStats> => {
  const history = await loadPracticeHistory();

  if (history.length === 0) {
    return {
      totalPractices: 0,
      totalMinutes: 0,
      totalMalas: 0,
      favoriteShlokaId: null,
      lastPracticeDate: null,
    };
  }

  // Calculate total practices and minutes
  const totalPractices = history.length;
  const totalSeconds = history.reduce((sum, p) => sum + p.duration, 0);
  const totalMinutes = Math.floor(totalSeconds / 60);

  // Calculate total mala count
  const totalMalas = history.reduce((sum, p) => sum + p.malaCount, 0);

  // Find favorite shloka (most practiced)
  const shlokaCount = new Map<string, number>();
  history.forEach((practice) => {
    if (practice.shlokaId) {
      const count = shlokaCount.get(practice.shlokaId) || 0;
      shlokaCount.set(practice.shlokaId, count + 1);
    }
  });

  let favoriteShlokaId: string | null = null;
  let maxCount = 0;
  shlokaCount.forEach((count, shlokaId) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteShlokaId = shlokaId;
    }
  });

  // Get last practice date (history should be in chronological order)
  const lastPracticeDate = history[history.length - 1].date;

  return {
    totalPractices,
    totalMinutes,
    totalMalas,
    favoriteShlokaId,
    lastPracticeDate,
  };
};
