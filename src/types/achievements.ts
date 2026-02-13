/**
 * Achievement System Types
 * Shloka Sadhana - Phase 2A: Engagement Core
 *
 * Achievement tracking across 6 categories: streak, practice, mala, quest, social, group
 */

/**
 * Achievement categories
 */
export type AchievementCategory =
  | 'streak' // Consecutive days
  | 'practice' // Total sessions
  | 'mala' // Total malas
  | 'quest' // Quest completion
  | 'social' // Friends & sharing
  | 'group'; // Group participation

/**
 * Achievement rarity
 */
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

/**
 * Main Achievement interface
 */
export interface Achievement {
  id: string; // Unique achievement ID (e.g., 'streak_7', 'mala_108')
  category: AchievementCategory;
  name: string; // Display name (e.g., "7 Day Devotee")
  description: string; // User-facing description
  icon: string; // Emoji or icon name
  target: number; // Goal value to unlock
  xpReward: number; // XP awarded on unlock
  rarity: AchievementRarity;
  isSecret?: boolean; // Hidden until unlocked
}

/**
 * User's achievement progress
 */
export interface AchievementProgress {
  achievementId: string;
  progress: number; // Current value
  target: number; // Target value
  isUnlocked: boolean;
  unlockedAt?: string; // ISO timestamp (if unlocked)
  percentComplete: number; // Calculated: (progress / target) * 100
}

/**
 * Unlocked achievement record
 */
export interface UnlockedAchievement {
  achievementId: string;
  achievement: Achievement; // Full achievement data
  unlockedAt: string; // ISO timestamp
  xpEarned: number;
  celebrationShown: boolean; // Has modal been shown?
}

/**
 * Achievement statistics
 */
export interface AchievementStats {
  totalUnlocked: number; // Count of unlocked achievements
  totalAchievements: number; // Total available achievements
  completionPercentage: number; // (unlocked / total) * 100
  totalXPFromAchievements: number; // Sum of XP from achievements
  unlockedByCategory: Record<AchievementCategory, number>; // Count per category
  rarestAchievement: Achievement | null; // Highest rarity unlocked
}

/**
 * Achievement check result
 */
export interface AchievementCheckResult {
  newlyUnlocked: Achievement[]; // Achievements unlocked in this check
  nearCompletion: AchievementProgress[]; // ≤3 away from target
  totalXPEarned: number; // XP from newly unlocked
}

/**
 * Achievement milestone thresholds
 */
export const ACHIEVEMENT_MILESTONES = {
  // Streak category
  streak: [7, 14, 21, 30, 50, 100, 365],

  // Practice category
  practice: [10, 25, 50, 100, 250, 500, 1000],

  // Mala category (108 beads = 1 mala)
  mala: [1, 10, 50, 108, 500, 1000, 1080],

  // Quest category
  quest: [7, 14, 30, 50, 100, 365],

  // Social category (friends count)
  social: [1, 5, 10, 20, 50],

  // Group category
  group: [1, 5, 10], // Groups joined
} as const;

/**
 * Achievement definitions (seed data)
 * Full list will be in achievementService.ts
 */
export interface AchievementDefinition extends Achievement {
  unlockedMessage: string; // Message shown in unlock modal
  checkFunction: (stats: any) => boolean; // Function to check if unlocked
}
