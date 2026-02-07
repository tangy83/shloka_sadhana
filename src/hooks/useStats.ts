/**
 * useStats Hook
 * Shloka Sadhana - Practice Statistics
 *
 * Calculates weekly and monthly practice statistics
 */

import { useState, useEffect } from 'react';
import { loadPracticeHistory } from '@/utils/practiceStorage';
import { CompletedPractice } from '@/types/practice';

export interface PeriodStats {
  totalSessions: number;
  totalMinutes: number;
  totalMalas: number;
}

export interface UseStatsReturn {
  weeklyStats: PeriodStats | null;
  monthlyStats: PeriodStats | null;
  longestStreak: number;
  isLoading: boolean;
}

/**
 * Hook for calculating practice statistics
 * @param currentDate Optional current date for testing
 */
export const useStats = (currentDate?: string): UseStatsReturn => {
  const [weeklyStats, setWeeklyStats] = useState<PeriodStats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<PeriodStats | null>(null);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const practices = await loadPracticeHistory();
        const now = currentDate ? new Date(currentDate) : new Date();

        // Calculate weekly stats
        const weekStart = getWeekStart(now);
        const weekPractices = practices.filter((p) => {
          const practiceDate = new Date(p.date);
          return practiceDate >= weekStart && practiceDate <= now;
        });
        setWeeklyStats(calculateStats(weekPractices));

        // Calculate monthly stats
        const monthStart = getMonthStart(now);
        const monthPractices = practices.filter((p) => {
          const practiceDate = new Date(p.date);
          return practiceDate >= monthStart && practiceDate <= now;
        });
        setMonthlyStats(calculateStats(monthPractices));

        // Calculate longest streak
        setLongestStreak(calculateLongestStreak(practices));
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [currentDate]);

  return {
    weeklyStats,
    monthlyStats,
    longestStreak,
    isLoading,
  };
};

/**
 * Get the start of the current week (Monday)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.getFullYear(), d.getMonth(), diff, 0, 0, 0, 0);
}

/**
 * Get the start of the current month
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Calculate statistics for a set of practices
 */
function calculateStats(practices: CompletedPractice[]): PeriodStats {
  return {
    totalSessions: practices.length,
    totalMinutes: Math.floor(
      practices.reduce((sum, p) => sum + p.duration, 0) / 60
    ),
    totalMalas: practices.reduce((sum, p) => sum + p.malaCount, 0),
  };
}

/**
 * Calculate longest streak from practice history
 */
function calculateLongestStreak(practices: CompletedPractice[]): number {
  if (practices.length === 0) {
    return 0;
  }

  // Sort practices by date
  const sorted = [...practices].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(sorted[i - 1].date);
    const currDate = new Date(sorted[i].date);

    // Get dates without time component
    const prevDay = new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate());
    const currDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate());

    const diffDays = Math.floor(
      (currDay.getTime() - prevDay.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      // Consecutive day
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else if (diffDays > 1) {
      // Gap in streak
      currentStreak = 1;
    }
    // If diffDays === 0, same day, don't increment streak
  }

  return longestStreak;
}
