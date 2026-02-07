/**
 * Goals Storage Utilities
 * Shloka Sadhana - Practice Goals Persistence
 */

import { getItem, setItem, removeItem } from './storage';
import { STORAGE_KEYS } from '@/constants/StorageKeys';
import { PracticeGoal } from '@/types/practice';

/**
 * Save goal to storage
 * @param goal Practice goal to save
 */
export const saveGoal = async (goal: PracticeGoal): Promise<void> => {
  await setItem(STORAGE_KEYS.GOAL, goal);
};

/**
 * Load goal from storage
 * @returns Practice goal or null if not found
 */
export const loadGoal = async (): Promise<PracticeGoal | null> => {
  return getItem<PracticeGoal>(STORAGE_KEYS.GOAL);
};

/**
 * Clear goal from storage
 */
export const clearGoal = async (): Promise<void> => {
  await removeItem(STORAGE_KEYS.GOAL);
};

/**
 * Increment goal progress by 1
 * Marks goal as inactive when target is reached
 */
export const updateGoalProgress = async (): Promise<void> => {
  const goal = await loadGoal();
  if (!goal) {
    return;
  }

  const newProgress = goal.currentProgress + 1;
  const isCompleted = newProgress >= goal.targetSessions;

  await saveGoal({
    ...goal,
    currentProgress: newProgress,
    isActive: !isCompleted,
  });
};

/**
 * Reset goal if its period has expired
 * Daily goals reset if day has changed
 * Weekly goals reset if week has changed (Monday-Sunday)
 * @param currentDate Current date ISO string
 */
export const resetGoalIfExpired = async (currentDate: string): Promise<void> => {
  const goal = await loadGoal();
  if (!goal) {
    return;
  }

  const goalStart = new Date(goal.startDate);
  const now = new Date(currentDate);

  let shouldReset = false;

  if (goal.type === 'daily') {
    // Reset if different day
    const goalDay = new Date(goalStart.getFullYear(), goalStart.getMonth(), goalStart.getDate());
    const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    shouldReset = currentDay.getTime() !== goalDay.getTime();
  } else if (goal.type === 'weekly') {
    // Reset if different week (Monday-Sunday)
    const getWeekStart = (date: Date): Date => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      return new Date(d.getFullYear(), d.getMonth(), diff);
    };

    const goalWeekStart = getWeekStart(goalStart);
    const currentWeekStart = getWeekStart(now);
    shouldReset = currentWeekStart.getTime() !== goalWeekStart.getTime();
  }

  if (shouldReset) {
    await saveGoal({
      ...goal,
      currentProgress: 0,
      startDate: now.toISOString(),
      isActive: true,
    });
  }
};
