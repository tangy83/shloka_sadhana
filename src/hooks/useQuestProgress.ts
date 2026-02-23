/**
 * useQuestProgress
 * Shloka Sadhana — Daily quest progress hook
 *
 * Tracks progress for the day's featured quest.
 * Resets automatically when the date changes.
 * Stored in STORAGE_KEYS.QUEST_PROGRESS.
 */

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { Quest, QUESTS, getTodayQuest } from '@/data/quests';

interface QuestProgressRecord {
  date: string;               // ISO date YYYY-MM-DD
  progress: Record<string, number>; // questId → progress count
}

interface UseQuestProgressReturn {
  todayQuest: Quest;
  progress: number;           // current progress toward today's quest
  isCompleted: boolean;
  incrementProgress: (amount?: number) => Promise<void>;
  xpEarned: number;
}

const today = (): string => new Date().toISOString().slice(0, 10);

export const useQuestProgress = (): UseQuestProgressReturn => {
  const todayQuest = getTodayQuest();
  const [record, setRecord] = useState<QuestProgressRecord>({
    date: today(),
    progress: {},
  });
  const [xpEarned, setXpEarned] = useState(0);

  // Load + reset on mount
  useEffect(() => {
    const load = async () => {
      const saved = await getItem<QuestProgressRecord>(STORAGE_KEYS.QUEST_PROGRESS);
      const todayStr = today();
      if (saved && saved.date === todayStr) {
        setRecord(saved);
        // Restore xp if already earned today
        if ((saved.progress[todayQuest.id] ?? 0) >= todayQuest.target) {
          setXpEarned(todayQuest.xpReward);
        }
      } else {
        // New day — reset
        const fresh: QuestProgressRecord = { date: todayStr, progress: {} };
        await setItem(STORAGE_KEYS.QUEST_PROGRESS, fresh);
        setRecord(fresh);
      }
    };
    load();
  }, [todayQuest.id, todayQuest.target, todayQuest.xpReward]);

  const incrementProgress = useCallback(
    async (amount = 1) => {
      setRecord((prev) => {
        const current = prev.progress[todayQuest.id] ?? 0;
        const newCount = current + amount;
        const updated: QuestProgressRecord = {
          ...prev,
          progress: { ...prev.progress, [todayQuest.id]: newCount },
        };
        // Fire-and-forget persist
        setItem(STORAGE_KEYS.QUEST_PROGRESS, updated);
        // Award XP when target first reached
        if (current < todayQuest.target && newCount >= todayQuest.target) {
          setXpEarned(todayQuest.xpReward);
        }
        return updated;
      });
    },
    [todayQuest.id, todayQuest.target, todayQuest.xpReward]
  );

  const progress = record.progress[todayQuest.id] ?? 0;
  const isCompleted = progress >= todayQuest.target;

  // Expose all quests for display (with current-day progress only for today's quest)
  return { todayQuest, progress, isCompleted, incrementProgress, xpEarned };
};

// Expose QUESTS for consumers that need to list all quests
export { QUESTS };
