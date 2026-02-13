/**
 * Quest Storage
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Utilities for saving and loading quest data to AsyncStorage and Firestore
 */

import { getItem, setItem, removeItem } from './storage';
import { Quest, CompletedQuest, QuestStats } from '@/types/quests';

// Storage keys
const CURRENT_QUEST_KEY = 'current_quest';
const COMPLETED_QUESTS_KEY = 'completed_quests';
const QUEST_STATS_KEY = 'quest_stats';

/**
 * Save current active quest to storage
 */
export const saveCurrentQuest = async (quest: Quest): Promise<void> => {
  await setItem(CURRENT_QUEST_KEY, quest);
};

/**
 * Load current active quest from storage
 */
export const loadCurrentQuest = async (): Promise<Quest | null> => {
  return await getItem<Quest>(CURRENT_QUEST_KEY);
};

/**
 * Clear current quest from storage
 */
export const clearCurrentQuest = async (): Promise<void> => {
  await removeItem(CURRENT_QUEST_KEY);
};

/**
 * Save completed quest to history
 */
export const saveCompletedQuest = async (
  completedQuest: CompletedQuest
): Promise<void> => {
  const history = await getItem<CompletedQuest[]>(COMPLETED_QUESTS_KEY);
  const updatedHistory = history ? [...history, completedQuest] : [completedQuest];
  await setItem(COMPLETED_QUESTS_KEY, updatedHistory);
};

/**
 * Load completed quests history
 */
export const loadCompletedQuests = async (): Promise<CompletedQuest[]> => {
  const history = await getItem<CompletedQuest[]>(COMPLETED_QUESTS_KEY);
  return history || [];
};

/**
 * Calculate quest statistics from completed quests
 */
export const getQuestStats = async (): Promise<QuestStats> => {
  const completedQuests = await loadCompletedQuests();

  if (completedQuests.length === 0) {
    return {
      totalCompleted: 0,
      questStreak: 0,
      longestQuestStreak: 0,
      totalXP: 0,
      completionRate: 0,
      favoriteQuestType: null,
    };
  }

  // Calculate total completed
  const totalCompleted = completedQuests.length;

  // Calculate total XP
  const totalXP = completedQuests.reduce((sum, q) => sum + q.xpEarned, 0);

  // Calculate quest streak (consecutive days)
  const questStreak = calculateQuestStreak(completedQuests);

  // Calculate longest quest streak
  const longestQuestStreak = calculateLongestQuestStreak(completedQuests);

  // Find favorite quest type (most completed)
  const favoriteQuestType = findFavoriteQuestType(completedQuests);

  // Completion rate is calculated elsewhere (needs total generated quests count)
  // For now, assume 100% if user has completed quests
  const completionRate = 100;

  return {
    totalCompleted,
    questStreak,
    longestQuestStreak,
    totalXP,
    completionRate,
    favoriteQuestType,
  };
};

/**
 * Calculate current quest streak (consecutive days)
 */
const calculateQuestStreak = (completedQuests: CompletedQuest[]): number => {
  if (completedQuests.length === 0) return 0;

  // Sort by completion date (newest first)
  const sorted = [...completedQuests].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Start of today

  for (const quest of sorted) {
    const questDate = new Date(quest.completedAt);
    questDate.setHours(0, 0, 0, 0); // Start of quest day

    const daysDiff = Math.floor(
      (currentDate.getTime() - questDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Check if quest was completed on expected day
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff === streak + 1 && streak === 0) {
      // Quest completed today
      streak++;
    } else {
      // Streak broken
      break;
    }
  }

  return streak;
};

/**
 * Calculate longest quest streak ever achieved
 */
const calculateLongestQuestStreak = (completedQuests: CompletedQuest[]): number => {
  if (completedQuests.length === 0) return 0;

  // Sort by completion date (oldest first)
  const sorted = [...completedQuests].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  let longestStreak = 1;
  let currentStreak = 1;
  let previousDate = new Date(sorted[0].completedAt);
  previousDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sorted.length; i++) {
    const questDate = new Date(sorted[i].completedAt);
    questDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (questDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (daysDiff > 1) {
      // Streak broken
      currentStreak = 1;
    }
    // If daysDiff === 0 (same day), don't increment streak

    previousDate = questDate;
  }

  return longestStreak;
};

/**
 * Find most frequently completed quest type
 */
const findFavoriteQuestType = (
  completedQuests: CompletedQuest[]
): CompletedQuest['type'] | null => {
  if (completedQuests.length === 0) return null;

  const typeCounts = new Map<CompletedQuest['type'], number>();

  completedQuests.forEach((quest) => {
    const count = typeCounts.get(quest.type) || 0;
    typeCounts.set(quest.type, count + 1);
  });

  let maxCount = 0;
  let favoriteType: CompletedQuest['type'] | null = null;

  typeCounts.forEach((count, type) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteType = type;
    }
  });

  return favoriteType;
};

/**
 * Save quest stats (cached)
 */
export const saveQuestStats = async (stats: QuestStats): Promise<void> => {
  await setItem(QUEST_STATS_KEY, stats);
};

/**
 * Load quest stats (cached)
 */
export const loadQuestStats = async (): Promise<QuestStats | null> => {
  return await getItem<QuestStats>(QUEST_STATS_KEY);
};

/**
 * Check if user has completed quest today
 */
export const hasCompletedQuestToday = async (): Promise<boolean> => {
  const currentQuest = await loadCurrentQuest();

  if (!currentQuest) return false;

  return currentQuest.status === 'completed';
};

/**
 * Get quest completion for date range
 */
export const getQuestCompletionsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<CompletedQuest[]> => {
  const allQuests = await loadCompletedQuests();

  return allQuests.filter((quest) => {
    const questDate = new Date(quest.completedAt);
    return questDate >= startDate && questDate <= endDate;
  });
};

/**
 * Get total XP earned in date range
 */
export const getXPByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<number> => {
  const quests = await getQuestCompletionsByDateRange(startDate, endDate);
  return quests.reduce((sum, q) => sum + q.xpEarned, 0);
};
