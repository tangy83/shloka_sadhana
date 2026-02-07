/**
 * useStreak Hook
 * Shloka Sadhana - Streak Management
 *
 * Manages practice streak tracking and persistence
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';
import { getTodayISO } from '@/utils/dateUtils';
import type { StreakData } from '@/types';

export interface UseStreakReturn {
  currentStreak: number;
  longestStreak: number;
  totalPractices: number;
  isPracticedToday: boolean;
  isStreakAtRisk: boolean;
  isLoading: boolean;
  markTodayComplete: () => Promise<void>;
}

/**
 * Hook for managing practice streak
 * Handles loading, calculating, and persisting streak data
 */
export const useStreak = (): UseStreakReturn => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    totalPractices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load streak data on mount
  useEffect(() => {
    const loadStreak = async (): Promise<void> => {
      try {
        const data = await storage.getStreak();
        if (data) {
          setStreakData(data);
        }
      } catch (error) {
        console.error('[useStreak] Failed to load streak:', error);
        // Keep default values on error
      } finally {
        setIsLoading(false);
      }
    };

    loadStreak();
  }, []);

  /**
   * Check if user has practiced today
   */
  const isPracticedToday = streakData.lastCompletedDate === getTodayISO();

  /**
   * Check if streak is at risk (last practice was yesterday)
   */
  const isStreakAtRisk =
    !isPracticedToday &&
    streakData.lastCompletedDate !== null &&
    calculateDaysBetween(streakData.lastCompletedDate, getTodayISO()) === 1;

  /**
   * Mark today as complete and update streak
   */
  const markTodayComplete = useCallback(async (): Promise<void> => {
    const today = getTodayISO();

    // Prevent double-counting
    if (streakData.lastCompletedDate === today) {
      return;
    }

    let newCurrentStreak: number;
    const lastDate = streakData.lastCompletedDate;

    if (lastDate === null) {
      // First time practicing
      newCurrentStreak = 1;
    } else {
      const daysBetween = calculateDaysBetween(lastDate, today);

      if (daysBetween === 1) {
        // Consecutive day - continue streak
        newCurrentStreak = streakData.currentStreak + 1;
      } else {
        // Streak broken - start new streak
        newCurrentStreak = 1;
      }
    }

    const newLongestStreak = Math.max(streakData.longestStreak, newCurrentStreak);
    const newTotalPractices = streakData.totalPractices + 1;

    const updatedData: StreakData = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastCompletedDate: today,
      totalPractices: newTotalPractices,
    };

    // Update state
    setStreakData(updatedData);

    // Persist to storage
    try {
      await storage.saveStreak(updatedData);
    } catch (error) {
      console.error('[useStreak] Failed to save streak:', error);
      // Don't revert state - user's action counts even if save fails
    }
  }, [streakData]);

  return {
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    totalPractices: streakData.totalPractices,
    isPracticedToday,
    isStreakAtRisk,
    isLoading,
    markTodayComplete,
  };
};

/**
 * Calculate days between two ISO date strings
 * Helper function for streak calculation
 */
function calculateDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
