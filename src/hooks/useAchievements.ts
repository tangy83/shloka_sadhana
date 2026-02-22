/**
 * useAchievements
 * Shloka Sadhana — Achievement unlock system hook
 *
 * Loads unlocked achievement IDs + total XP from AsyncStorage.
 * Provides checkAndUnlock() to test unlock conditions after each session.
 * Stored in STORAGE_KEYS.ACHIEVEMENTS.
 */

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { ACHIEVEMENTS, Achievement } from '@/data/achievements';

interface AchievementRecord {
  unlockedIds: string[];
  xp: number;
}

export interface CheckUnlockParams {
  totalPractices: number;
  currentStreak: number;
  totalMalas: number;
}

interface UseAchievementsReturn {
  unlockedIds: string[];
  xp: number;
  recentlyUnlocked: Achievement | null;
  checkAndUnlock: (params: CheckUnlockParams) => Promise<Achievement | null>;
  dismissRecentlyUnlocked: () => void;
  isLoading: boolean;
}

const DEFAULT_RECORD: AchievementRecord = { unlockedIds: [], xp: 0 };

export const useAchievements = (): UseAchievementsReturn => {
  const [record, setRecord] = useState<AchievementRecord>(DEFAULT_RECORD);
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Achievement | null>(null);

  // Load on mount
  useEffect(() => {
    const load = async () => {
      try {
        const saved = await getItem<AchievementRecord>(STORAGE_KEYS.ACHIEVEMENTS);
        if (saved) setRecord(saved);
      } catch (error) {
        console.error('[useAchievements] Load failed:', error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  /**
   * Check all achievement unlock conditions and unlock any newly earned ones.
   * Returns the first newly-unlocked achievement (for modal display), or null.
   */
  const checkAndUnlock = useCallback(
    async (params: CheckUnlockParams): Promise<Achievement | null> => {
      const currentRecord = await getItem<AchievementRecord>(STORAGE_KEYS.ACHIEVEMENTS) ?? DEFAULT_RECORD;
      const alreadyUnlocked = new Set(currentRecord.unlockedIds);

      let newlyUnlocked: Achievement | null = null;
      let addedXp = 0;

      for (const achievement of ACHIEVEMENTS) {
        if (alreadyUnlocked.has(achievement.id)) continue;

        const { type, value } = achievement.unlockCondition;
        const met =
          (type === 'practices' && params.totalPractices >= value) ||
          (type === 'streak' && params.currentStreak >= value) ||
          (type === 'malas' && params.totalMalas >= value);

        if (met) {
          alreadyUnlocked.add(achievement.id);
          addedXp += achievement.xpReward;
          if (!newlyUnlocked) newlyUnlocked = achievement; // Surface first new unlock
        }
      }

      if (newlyUnlocked) {
        const updated: AchievementRecord = {
          unlockedIds: Array.from(alreadyUnlocked),
          xp: currentRecord.xp + addedXp,
        };
        await setItem(STORAGE_KEYS.ACHIEVEMENTS, updated);
        setRecord(updated);
        setRecentlyUnlocked(newlyUnlocked);
      }

      return newlyUnlocked;
    },
    []
  );

  const dismissRecentlyUnlocked = useCallback(() => {
    setRecentlyUnlocked(null);
  }, []);

  return {
    unlockedIds: record.unlockedIds,
    xp: record.xp,
    recentlyUnlocked,
    checkAndUnlock,
    dismissRecentlyUnlocked,
    isLoading,
  };
};
